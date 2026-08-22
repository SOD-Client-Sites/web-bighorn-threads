// Bighorn Threads — Demo / company-store preview opt-in endpoint.
// Fired when someone submits the /demo/ form to generate a branded store preview.
// Upserts the lead into GHL, tags it, and attaches a note with trade + crew size.
// The logo data URL is intentionally NOT sent to GHL (too large; lives in the preview URL).

import { parseSmsConsent } from './_consent.js'
import { formatAttributionNote, scheduleOriginalAttribution } from './_attribution.js'
import { verifyTurnstile } from './_turnstile.js'
import { COMMON_FIELD_LIMITS, normalizeSiteUrl, safeErrorName, validatePayload } from './_validation.js'

const GHL_BASE = 'https://services.leadconnectorhq.com'
const GHL_API_VERSION = '2021-07-28'
const DEMO_TAG = 'company-store-demo'

const REQUIRED_FIELDS = ['company', 'contact', 'email', 'trade']

export async function onRequestPost(context) {
  const { request, env } = context
  let body
  try {
    body = await request.json()
  } catch (_) {
    return errorResponse('Invalid JSON body', 400)
  }
  if (!body || typeof body !== 'object') return errorResponse('Invalid body', 400)

  // Honeypot (silent drop)
  if (body.bh_hp_field && String(body.bh_hp_field).trim()) {
    return jsonResponse({ ok: true, contactId: null, spam: true })
  }

  const validationError = validatePayload(body, {
    ...COMMON_FIELD_LIMITS,
    trade: 200,
    crewSize: 20,
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
    console.error('[demo-optin] missing GHL env vars')
    return errorResponse('Server misconfigured', 500)
  }

  const contactName = String(body.contact).trim()
  const [firstName, ...rest] = contactName.split(/\s+/)
  const lastName = rest.join(' ').trim() || ''
  const company = String(body.company).trim()
  const phone = body.phone ? String(body.phone).trim() : ''
  const trade = String(body.trade).trim()
  const crewSize = body.crewSize ? parseInt(String(body.crewSize), 10) : null
  const sourceUrl = normalizeSiteUrl(body.sourceUrl, 'https://bighornthreads.com/demo/')
  const consent = parseSmsConsent(body, sourceUrl)
  if (consent.any && !phone) return errorResponse('Phone is required when SMS consent is selected', 400)

  // ---------------- Upsert contact ----------------
  let contactId = null
  try {
    const upsertBody = {
      locationId,
      firstName,
      lastName,
      name: contactName,
      email,
      companyName: company,
      source: 'bighornthreads.com — company store demo',
    }
    if (phone) upsertBody.phone = phone

    const upsertRes = await ghlFetch(`${GHL_BASE}/contacts/upsert`, token, {
      method: 'POST',
      body: JSON.stringify(upsertBody),
    })
    if (!upsertRes.ok) {
      console.error('[demo-optin] GHL request failed', { operation: 'contact-upsert', status: upsertRes.status })
      return errorResponse(`GHL upsert failed (${upsertRes.status})`, 502)
    }
    const upsertData = await upsertRes.json()
    contactId = upsertData?.contact?.id || upsertData?.id || upsertData?.contactId
    if (!contactId) {
      console.error('[demo-optin] GHL response missing contact id', { operation: 'contact-upsert', status: upsertRes.status })
      return errorResponse('GHL upsert returned no contact id', 502)
    }
  } catch (err) {
    console.error('[demo-optin] GHL request threw', { operation: 'contact-upsert', error: safeErrorName(err) })
    return errorResponse('GHL upsert error', 502)
  }

  await scheduleOriginalAttribution({
    waitUntil: typeof context.waitUntil === 'function' ? context.waitUntil.bind(context) : undefined,
    label: 'demo-optin',
    contactId,
    token,
    data: body,
    fallbackDetail: 'Company store demo request',
  })

  // ---------------- Note with demo details ----------------
  const noteBody = formatNote({ company, contactName, email, phone, trade, crewSize, sourceUrl })
    + '\n' + consent.noteBlock
    + formatAttributionNote(body)
  try {
    const noteRes = await ghlFetch(`${GHL_BASE}/contacts/${contactId}/notes`, token, {
      method: 'POST',
      body: JSON.stringify({ body: noteBody }),
    })
    if (!noteRes.ok) {
      console.error('[demo-optin] GHL request failed', { operation: 'contact-note', status: noteRes.status })
      return errorResponse('Contact saved, but consent record failed', 502)
    }
  } catch (err) {
    console.error('[demo-optin] GHL request threw', { operation: 'contact-note', error: safeErrorName(err) })
    return errorResponse('Contact saved, but consent record failed', 502)
  }

  try {
    const tagRes = await ghlFetch(`${GHL_BASE}/contacts/${contactId}/tags`, token, {
      method: 'POST',
      body: JSON.stringify({ tags: [DEMO_TAG, 'company-store-lead', ...consent.tags] }),
    })
    if (!tagRes.ok) {
      console.error('[demo-optin] GHL request failed', { operation: 'contact-tags', status: tagRes.status })
      return errorResponse('Contact saved, but lead routing failed', 502)
    }
  } catch (err) {
    console.error('[demo-optin] GHL request threw', { operation: 'contact-tags', error: safeErrorName(err) })
    return errorResponse('Contact saved, but lead routing failed', 502)
  }

  return jsonResponse({ ok: true, contactId })
}

// ---------------- helpers ----------------
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

function formatNote({ company, contactName, email, phone, trade, crewSize, sourceUrl }) {
  const lines = []
  lines.push('=== COMPANY STORE DEMO REQUEST ===')
  lines.push('')
  lines.push('CONTACT')
  lines.push(`  Name:      ${contactName}`)
  lines.push(`  Company:   ${company}`)
  lines.push(`  Email:     ${email}`)
  if (phone) lines.push(`  Phone:     ${phone}`)
  lines.push('')
  lines.push('STORE DETAILS')
  lines.push(`  Trade:     ${trade}`)
  if (crewSize) lines.push(`  Crew size: ${crewSize}`)
  lines.push('')
  lines.push('SOURCE')
  lines.push(`  ${sourceUrl || 'bighornthreads.com/demo'}`)
  return lines.join('\n')
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

// Healthcheck
export async function onRequestGet() {
  return jsonResponse({ ok: true, endpoint: 'demo-optin', method: 'POST' })
}
