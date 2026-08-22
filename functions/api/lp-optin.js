// Bighorn Threads — vertical lead-capture landing-page opt-in endpoint.
// Powers /get-started/<vertical>/ LPs and the per-vertical hub forms.
// Upserts the lead into GHL, tags it by vertical segment, maps headcount to the
// Quantity Estimate custom field, and attaches a structured note with every answer.

import { parseSmsConsent } from './_consent.js'
import { formatAttributionNote, scheduleOriginalAttribution } from './_attribution.js'
import { verifyTurnstile } from './_turnstile.js'
import { COMMON_FIELD_LIMITS, normalizeSiteUrl, safeErrorName, validatePayload } from './_validation.js'

const GHL_BASE = 'https://services.leadconnectorhq.com'
const GHL_API_VERSION = '2021-07-28'

// GHL custom field IDs (Bighorn location lNyfWNCloQHAP34OSwIZ)
const CF_QUANTITY_ESTIMATE = 'AuP8x0F7NvKOzWX0xxRh' // TEXT — "how many people would order / outfit"
const CF_PRODUCT = 'sjfsg4TTMK4zutyPULCE' // TEXT — product/item the lead is asking about
const CF_LANDING_PAGE = 'ugF8tUamfteI3vZolbjR' // TEXT — exact landing-page URL the lead submitted from

// Unified simple quote form: only vertical + email are required to submit.
// First name, company, mobile, quantity, and details are all optional.
const REQUIRED_FIELDS = ['vertical', 'email']

// Allowed verticals → human label + segment tag
const VERTICALS = {
  corporate: 'Corporate',
  education: 'Education',
  government: 'Government',
  healthcare: 'Healthcare',
  'gaming-hospitality': 'Gaming & Hospitality',
  events: 'Events',
  trades: 'Construction & Trades',
}

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
    vertical: 100,
    quantity: 100,
    product: 500,
    details: 5_000,
  })
  if (validationError) return errorResponse(validationError, 400)

  // Cloudflare Turnstile — bot challenge (skipped until TURNSTILE_SECRET is set)
  const verified = await verifyTurnstile({ env, request, token: body['cf-turnstile-response'] })
  if (!verified) {
    return errorResponse('Verification failed. Please refresh and try again.', 400)
  }

  for (const f of REQUIRED_FIELDS) {
    if (!body[f] || !String(body[f]).trim()) {
      return errorResponse(`Missing required field: ${f}`, 400)
    }
  }

  const verticalSlug = String(body.vertical).trim()
  const verticalLabel = VERTICALS[verticalSlug]
  if (!verticalLabel) return errorResponse(`Unknown vertical: ${verticalSlug}`, 400)

  const email = String(body.email).trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return errorResponse('Invalid email format', 400)
  }

  const locationId = env.GHL_LOCATION_ID
  const token = env.GHL_PIT_TOKEN
  if (!locationId || !token) {
    console.error('[lp-optin] missing GHL env vars')
    return errorResponse('Server misconfigured', 500)
  }

  const contactName = body.contact ? String(body.contact).trim() : ''
  const [firstName = '', ...rest] = contactName.split(/\s+/)
  const lastName = rest.join(' ').trim() || ''
  const company = body.company ? String(body.company).trim() : ''
  const phone = body.phone ? String(body.phone).trim() : ''
  const quantity = body.quantity ? String(body.quantity).trim() : ''
  const product = body.product ? String(body.product).trim() : ''
  const details = body.details ? String(body.details).trim() : ''
  const sourceUrl = normalizeSiteUrl(body.sourceUrl)
  const consent = parseSmsConsent(body, sourceUrl)
  if (consent.any && !phone) return errorResponse('Phone is required when SMS consent is selected', 400)

  // ---------------- Upsert contact ----------------
  let contactId = null
  try {
    const upsertBody = {
      locationId,
      email,
      source: `bighornthreads.com — ${verticalLabel} company store LP`,
    }
    if (firstName) upsertBody.firstName = firstName
    if (lastName) upsertBody.lastName = lastName
    if (contactName) upsertBody.name = contactName
    if (company) upsertBody.companyName = company
    if (phone) upsertBody.phone = phone
    const customFields = []
    if (quantity) customFields.push({ id: CF_QUANTITY_ESTIMATE, field_value: quantity })
    if (product) customFields.push({ id: CF_PRODUCT, field_value: product })
    if (sourceUrl) customFields.push({ id: CF_LANDING_PAGE, field_value: sourceUrl })
    if (customFields.length) upsertBody.customFields = customFields

    const upsertRes = await ghlFetch(`${GHL_BASE}/contacts/upsert`, token, {
      method: 'POST',
      body: JSON.stringify(upsertBody),
    })
    if (!upsertRes.ok) {
      console.error('[lp-optin] GHL request failed', { operation: 'contact-upsert', status: upsertRes.status })
      return errorResponse(`GHL upsert failed (${upsertRes.status})`, 502)
    }
    const upsertData = await upsertRes.json()
    contactId = upsertData?.contact?.id || upsertData?.id || upsertData?.contactId
    if (!contactId) {
      console.error('[lp-optin] GHL response missing contact id', { operation: 'contact-upsert', status: upsertRes.status })
      return errorResponse('GHL upsert returned no contact id', 502)
    }
  } catch (err) {
    console.error('[lp-optin] GHL request threw', { operation: 'contact-upsert', error: safeErrorName(err) })
    return errorResponse('GHL upsert error', 502)
  }

  await scheduleOriginalAttribution({
    waitUntil: typeof context.waitUntil === 'function' ? context.waitUntil.bind(context) : undefined,
    label: 'lp-optin',
    contactId,
    token,
    data: body,
    fallbackDetail: `${verticalLabel} company store landing page`,
  })

  // ---------------- Note with full detail ----------------
  const noteBody = formatNote({ verticalLabel, company, contactName, email, phone, quantity, product, details, sourceUrl })
    + '\n' + consent.noteBlock
    + formatAttributionNote(body)
  try {
    const noteRes = await ghlFetch(`${GHL_BASE}/contacts/${contactId}/notes`, token, {
      method: 'POST',
      body: JSON.stringify({ body: noteBody }),
    })
    if (!noteRes.ok) {
      console.error('[lp-optin] GHL request failed', { operation: 'contact-note', status: noteRes.status })
      return errorResponse('Contact saved, but consent record failed', 502)
    }
  } catch (err) {
    console.error('[lp-optin] GHL request threw', { operation: 'contact-note', error: safeErrorName(err) })
    return errorResponse('Contact saved, but consent record failed', 502)
  }

  try {
    const tagRes = await ghlFetch(`${GHL_BASE}/contacts/${contactId}/tags`, token, {
      method: 'POST',
      body: JSON.stringify({ tags: ['company-store-lead', `segment-${verticalSlug}`, `industry-${verticalSlug}`, ...consent.tags] }),
    })
    if (!tagRes.ok) {
      console.error('[lp-optin] GHL request failed', { operation: 'contact-tags', status: tagRes.status })
      return errorResponse('Contact saved, but lead routing failed', 502)
    }
  } catch (err) {
    console.error('[lp-optin] GHL request threw', { operation: 'contact-tags', error: safeErrorName(err) })
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

function formatNote({ verticalLabel, company, contactName, email, phone, quantity, product, details, sourceUrl }) {
  const lines = []
  lines.push(`=== ${verticalLabel.toUpperCase()} — COMPANY STORE LEAD ===`)
  lines.push('')
  lines.push('CONTACT')
  if (contactName) lines.push(`  Name:      ${contactName}`)
  if (company) lines.push(`  Company:   ${company}`)
  lines.push(`  Email:     ${email}`)
  if (phone) lines.push(`  Phone:     ${phone}`)
  lines.push('')
  lines.push('DETAILS')
  lines.push(`  Vertical:  ${verticalLabel}`)
  if (product) lines.push(`  Product:   ${product}`)
  if (quantity) lines.push(`  Quantity:  ${quantity}`)
  if (details) lines.push(`  Notes:     ${details}`)
  lines.push('')
  lines.push('SOURCE')
  lines.push(`  ${sourceUrl || `bighornthreads.com/get-started/${verticalLabel}`}`)
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
  return jsonResponse({ ok: true, endpoint: 'lp-optin', method: 'POST' })
}
