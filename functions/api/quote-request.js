// Bighorn Threads — Inline product-page quote request endpoint.
// Validates POST body, upserts contact in GHL, tags it, and attaches a note
// with the full quote details. Charles wires the notification workflow in GHL UI.

import { parseSmsConsent } from './_consent.js'
import { formatAttributionNote, scheduleOriginalAttribution } from './_attribution.js'
import { verifyTurnstile } from './_turnstile.js'
import { COMMON_FIELD_LIMITS, normalizeSiteUrl, safeErrorName, validatePayload } from './_validation.js'

const GHL_BASE = 'https://services.leadconnectorhq.com'
const GHL_API_VERSION = '2021-07-28'
const QUOTE_TAG = 'bighorn-quote-request'

const REQUIRED_FIELDS = ['name', 'company', 'email', 'qty', 'productName']

export async function onRequestPost(context) {
  const { request, env } = context
  // Parse body
  let body
  try {
    body = await request.json()
  } catch (_) {
    return errorResponse('Invalid JSON body', 400)
  }
  if (!body || typeof body !== 'object') return errorResponse('Invalid body', 400)

  // Honeypot
  if (body.website && String(body.website).trim()) {
    // Pretend success — silently drop spam
    return jsonResponse({ ok: true, contactId: null, spam: true })
  }

  const validationError = validatePayload(body, {
    ...COMMON_FIELD_LIMITS,
    qty: 20,
    productName: 500,
    productSpc: 200,
    productEId: 200,
    productCategory: 200,
    productImage: 2_048,
    color: 200,
    sizes: 1_000,
    decorationMethod: 200,
    decorationLocation: 200,
    inHandsDate: 100,
    notes: 5_000,
  })
  if (validationError) return errorResponse(validationError, 400)

  // Cloudflare Turnstile — fail closed if verification is unavailable or misconfigured
  const verified = await verifyTurnstile({ env, request, token: body['cf-turnstile-response'] })
  if (!verified) {
    return errorResponse('Verification failed. Please refresh and try again.', 400)
  }

  // Required field validation
  for (const f of REQUIRED_FIELDS) {
    if (!body[f] || !String(body[f]).trim()) {
      return errorResponse(`Missing required field: ${f}`, 400)
    }
  }
  if (!body.productSpc && !body.productEId) {
    return errorResponse('Missing required product identifier (productSpc or productEId)', 400)
  }

  // Email format
  const email = String(body.email).trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return errorResponse('Invalid email format', 400)
  }

  const qtyText = String(body.qty).trim()
  if (!/^\d+$/.test(qtyText)) return errorResponse('Quantity must be a positive integer', 400)
  const qty = Number(qtyText)
  if (!Number.isSafeInteger(qty) || qty < 1 || qty > 1_000_000) {
    return errorResponse('Quantity must be between 1 and 1000000', 400)
  }

  // Env check
  const locationId = env.GHL_LOCATION_ID
  const token = env.GHL_PIT_TOKEN
  if (!locationId || !token) {
    console.error('[quote-request] missing GHL env vars')
    return errorResponse('Server misconfigured', 500)
  }

  const name = String(body.name).trim()
  const [firstName, ...rest] = name.split(/\s+/)
  const lastName = rest.join(' ').trim() || ''
  const company = String(body.company).trim()
  const phone = body.phone ? String(body.phone).trim() : ''
  const sourceUrl = normalizeSiteUrl(body.sourceUrl)
  const consent = parseSmsConsent(body, sourceUrl)
  if (consent.any && !phone) return errorResponse('Phone is required when SMS consent is selected', 400)

  // ---------------- 1. Upsert contact ----------------
  let contactId = null
  try {
    const upsertRes = await ghlFetch(`${GHL_BASE}/contacts/upsert`, token, {
      method: 'POST',
      body: JSON.stringify({
        locationId,
        firstName,
        lastName,
        name,
        email,
        ...(phone ? { phone } : {}),
        companyName: company,
        source: 'bighornthreads.com — PDP quote modal',
      }),
    })
    if (!upsertRes.ok) {
      console.error('[quote-request] GHL request failed', { operation: 'contact-upsert', status: upsertRes.status })
      return errorResponse(`GHL upsert failed (${upsertRes.status})`, 502)
    }
    const upsertData = await upsertRes.json()
    contactId = upsertData?.contact?.id || upsertData?.id || upsertData?.contactId
    if (!contactId) {
      console.error('[quote-request] GHL response missing contact id', { operation: 'contact-upsert', status: upsertRes.status })
      return errorResponse('GHL upsert returned no contact id', 502)
    }
  } catch (err) {
    console.error('[quote-request] GHL request threw', { operation: 'contact-upsert', error: safeErrorName(err) })
    return errorResponse('GHL upsert error', 502)
  }

  await scheduleOriginalAttribution({
    waitUntil: typeof context.waitUntil === 'function' ? context.waitUntil.bind(context) : undefined,
    label: 'quote-request',
    contactId,
    token,
    data: body,
    fallbackDetail: 'Product quote modal',
  })

  // ---------------- 2. Add the consent-bearing note before routing tags ----------------
  const noteBody = formatNote({ ...body, sourceUrl }, qty) + '\n' + consent.noteBlock + formatAttributionNote(body)
  try {
    const noteRes = await ghlFetch(`${GHL_BASE}/contacts/${contactId}/notes`, token, {
      method: 'POST',
      body: JSON.stringify({ body: noteBody, userId: undefined }),
    })
    if (!noteRes.ok) {
      console.error('[quote-request] GHL request failed', { operation: 'contact-note', status: noteRes.status })
      return errorResponse('Contact saved, but consent record failed', 502)
    }
  } catch (err) {
    console.error('[quote-request] GHL request threw', { operation: 'contact-note', error: safeErrorName(err) })
    return errorResponse('Contact saved, but consent record failed', 502)
  }

  // ---------------- 3. Route only after the consent record is durable ----------------
  try {
    const tagRes = await ghlFetch(`${GHL_BASE}/contacts/${contactId}/tags`, token, {
      method: 'POST',
      body: JSON.stringify({ tags: [QUOTE_TAG, ...consent.tags] }),
    })
    if (!tagRes.ok) {
      console.error('[quote-request] GHL request failed', { operation: 'contact-tags', status: tagRes.status })
      return errorResponse('Contact saved, but lead routing failed', 502)
    }
  } catch (err) {
    console.error('[quote-request] GHL request threw', { operation: 'contact-tags', error: safeErrorName(err) })
    return errorResponse('Contact saved, but lead routing failed', 502)
  }

  return jsonResponse({ ok: true, contactId })
}

// ---------------- helpers ----------------
function ghlFetch(url, token, init = {}) {
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Version: GHL_API_VERSION,
    ...(init.headers || {}),
  }
  return fetch(url, {
    ...init,
    headers,
    signal: AbortSignal.timeout(15_000),
  })
}

function formatNote(body, qty) {
  const lines = []
  lines.push('=== BIGHORN PDP QUOTE REQUEST ===')
  lines.push('')
  lines.push('PRODUCT')
  lines.push(`  Name:      ${body.productName || '(unknown)'}`)
  if (body.productSpc) lines.push(`  SPC:       ${body.productSpc}`)
  if (body.productEId) lines.push(`  prodEId:   ${body.productEId}`)
  if (body.productCategory) lines.push(`  Category:  ${body.productCategory}`)
  if (body.productImage) lines.push(`  Image:     ${body.productImage}`)
  lines.push('')
  lines.push('QUOTE DETAILS')
  lines.push(`  Quantity:           ${qty.toLocaleString()}`)
  if (body.color) lines.push(`  Color:              ${body.color}`)
  if (body.sizes) lines.push(`  Sizes / split:      ${body.sizes}`)
  if (body.decorationMethod) lines.push(`  Decoration method:  ${body.decorationMethod}`)
  if (body.decorationLocation) lines.push(`  Decoration location:${body.decorationLocation}`)
  if (body.inHandsDate) lines.push(`  In-hands date:      ${body.inHandsDate}`)
  if (body.notes) {
    lines.push('')
    lines.push('NOTES')
    lines.push(indent(body.notes, '  '))
  }
  lines.push('')
  lines.push('CONTACT')
  lines.push(`  Name:    ${body.name}`)
  lines.push(`  Company: ${body.company}`)
  lines.push(`  Email:   ${body.email}`)
  if (body.phone) lines.push(`  Phone:   ${body.phone}`)
  lines.push('')
  lines.push('SOURCE')
  if (body.sourceUrl) lines.push(`  ${body.sourceUrl}`)
  return lines.join('\n')
}

function indent(text, prefix) {
  return String(text).split('\n').map((l) => prefix + l).join('\n')
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}

function errorResponse(message, status = 500) {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}

// Optional GET for trivial healthcheck (helps Charles verify deploy without
// firing real requests at GHL).
export async function onRequestGet() {
  return jsonResponse({ ok: true, endpoint: 'quote-request', method: 'POST' })
}
