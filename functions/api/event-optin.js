// Bighorn Threads — Event opt-in endpoint (QR landing pages at golf, expos, etc).
// Validates POST body, upserts contact in GHL, applies the event tag.
// Every allowed event is mapped server-side so visitors cannot apply arbitrary
// tags that may trigger unrelated GHL workflows.

import { parseSmsConsent } from './_consent.js'
import { formatAttributionNote, scheduleOriginalAttribution } from './_attribution.js'
import { verifyTurnstile } from './_turnstile.js'
import { COMMON_FIELD_LIMITS, safeErrorName, validatePayload } from './_validation.js'

const GHL_BASE = 'https://services.leadconnectorhq.com'
const GHL_API_VERSION = '2021-07-28'
const DEFAULT_TAG = 'event-optin'
const EVENTS = {
  'event-golf-tournament': 'Golf Tournament 2026',
}

const REQUIRED_FIELDS = ['firstName', 'lastName', 'email', 'business']

export async function onRequestPost(context) {
  const { request, env } = context
  let body
  try {
    body = await request.json()
  } catch (_) {
    return errorResponse('Invalid JSON body', 400)
  }
  if (!body || typeof body !== 'object') return errorResponse('Invalid body', 400)

  if (body.bh_hp_field && String(body.bh_hp_field).trim()) {
    return jsonResponse({ ok: true, contactId: null, spam: true })
  }

  const validationError = validatePayload(body, {
    ...COMMON_FIELD_LIMITS,
    eventTag: 100,
  })
  if (validationError) return errorResponse(validationError, 400)

  // Cloudflare Turnstile — fail closed if verification is unavailable or misconfigured
  const verified = await verifyTurnstile({ env, request, token: body['cf-turnstile-response'] })
  if (!verified) {
    return errorResponse('Verification failed. Please refresh and try again.', 400)
  }

  for (const f of REQUIRED_FIELDS) {
    if (!body[f] || !String(body[f]).trim()) {
      return errorResponse(`Missing required field: ${f}`, 400)
    }
  }

  const email = String(body.email).trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return errorResponse('Invalid email format', 400)
  }

  const locationId = env.GHL_LOCATION_ID
  const token = env.GHL_PIT_TOKEN
  if (!locationId || !token) {
    console.error('[event-optin] missing GHL env vars')
    return errorResponse('Server misconfigured', 500)
  }

  const firstName = String(body.firstName).trim()
  const lastName = String(body.lastName).trim()
  const phone = body.phone ? String(body.phone).trim() : ''
  const business = String(body.business).trim()
  const eventTag = (body.eventTag && String(body.eventTag).trim()) || DEFAULT_TAG
  const eventLabel = EVENTS[eventTag]
  if (!eventLabel) return errorResponse('Unknown event', 400)
  const consent = parseSmsConsent(body, body.consentUrl)
  if (consent.any && !phone) return errorResponse('Phone is required when SMS consent is selected', 400)

  let contactId = null
  try {
    const upsertBody = {
      locationId,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      email,
      companyName: business,
      source: eventLabel,
    }
    if (phone) upsertBody.phone = phone
    const upsertRes = await ghlFetch(`${GHL_BASE}/contacts/upsert`, token, {
      method: 'POST',
      body: JSON.stringify(upsertBody),
    })
    if (!upsertRes.ok) {
      console.error('[event-optin] GHL request failed', { operation: 'contact-upsert', status: upsertRes.status })
      return errorResponse(`GHL upsert failed (${upsertRes.status})`, 502)
    }
    const upsertData = await upsertRes.json()
    contactId = upsertData?.contact?.id || upsertData?.id || upsertData?.contactId
    if (!contactId) return errorResponse('GHL upsert returned no contact id', 502)
  } catch (err) {
    console.error('[event-optin] GHL request threw', { operation: 'contact-upsert', error: safeErrorName(err) })
    return errorResponse('GHL upsert error', 502)
  }

  await scheduleOriginalAttribution({
    waitUntil: typeof context.waitUntil === 'function' ? context.waitUntil.bind(context) : undefined,
    label: 'event-optin',
    contactId,
    token,
    data: body,
    fallbackDetail: `${eventLabel} event opt-in`,
  })

  // Append a note so every opt-in leaves its own timestamped record,
  // even when upsert merges into an existing contact.
  try {
    const noteBody = `Opt-in: ${eventLabel} (${eventTag}) | ${new Date().toISOString()}\nName: ${firstName} ${lastName}\nPhone: ${phone}\nEmail: ${email}\nBusiness: ${business}\n${consent.noteBlock}${formatAttributionNote(body)}`
    const noteRes = await ghlFetch(`${GHL_BASE}/contacts/${contactId}/notes`, token, {
      method: 'POST',
      body: JSON.stringify({ body: noteBody }),
    })
    if (!noteRes.ok) {
      console.error('[event-optin] GHL request failed', { operation: 'contact-note', status: noteRes.status })
      return errorResponse('Contact saved, but consent record failed', 502)
    }
  } catch (err) {
    console.error('[event-optin] GHL request threw', { operation: 'contact-note', error: safeErrorName(err) })
    return errorResponse('Contact saved, but consent record failed', 502)
  }

  try {
    const tagRes = await ghlFetch(`${GHL_BASE}/contacts/${contactId}/tags`, token, {
      method: 'POST',
      body: JSON.stringify({ tags: [eventTag, 'event-optin', ...consent.tags] }),
    })
    if (!tagRes.ok) {
      console.error('[event-optin] GHL request failed', { operation: 'contact-tags', status: tagRes.status })
      return errorResponse('Contact saved, but lead routing failed', 502)
    }
  } catch (err) {
    console.error('[event-optin] GHL request threw', { operation: 'contact-tags', error: safeErrorName(err) })
    return errorResponse('Contact saved, but lead routing failed', 502)
  }

  return jsonResponse({ ok: true, contactId })
}

function ghlFetch(url, token, init = {}) {
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Version: GHL_API_VERSION,
      ...(init.headers || {}),
    },
    signal: AbortSignal.timeout(15_000),
  })
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })
}

function errorResponse(message, status = 500) {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })
}

export async function onRequestGet() {
  return jsonResponse({ ok: true, endpoint: 'event-optin', method: 'POST' })
}
