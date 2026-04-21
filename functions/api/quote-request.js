// Bighorn Threads — Inline product-page quote request endpoint.
// Validates POST body, upserts contact in GHL, tags it, and attaches a note
// with the full quote details. Charles wires the notification workflow in GHL UI.

const GHL_BASE = 'https://services.leadconnectorhq.com'
const GHL_API_VERSION = '2021-07-28'
const QUOTE_TAG = 'bighorn-quote-request'

const REQUIRED_FIELDS = ['name', 'company', 'email', 'qty', 'productName']

export async function onRequestPost({ request, env }) {
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

  const qty = parseInt(String(body.qty), 10)
  if (!(qty > 0)) return errorResponse('Quantity must be a positive integer', 400)

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
        phone,
        companyName: company,
        source: 'bighornthreads.com — PDP quote modal',
        tags: [QUOTE_TAG],
      }),
    })
    if (!upsertRes.ok) {
      const text = await safeText(upsertRes)
      console.error('[quote-request] upsert failed', upsertRes.status, text)
      return errorResponse(`GHL upsert failed (${upsertRes.status})`, 502)
    }
    const upsertData = await upsertRes.json()
    contactId = upsertData?.contact?.id || upsertData?.id || upsertData?.contactId
    if (!contactId) {
      console.error('[quote-request] upsert returned no id', upsertData)
      return errorResponse('GHL upsert returned no contact id', 502)
    }
  } catch (err) {
    console.error('[quote-request] upsert threw', err)
    return errorResponse('GHL upsert error', 502)
  }

  // ---------------- 2. Ensure tag is on the contact ----------------
  // Upsert above accepts tags, but if the contact already existed without
  // this tag we want to make sure it lands. POST /contacts/{id}/tags is idempotent.
  try {
    await ghlFetch(`${GHL_BASE}/contacts/${contactId}/tags`, token, {
      method: 'POST',
      body: JSON.stringify({ tags: [QUOTE_TAG] }),
    })
  } catch (err) {
    console.warn('[quote-request] tag add failed (non-fatal)', err)
  }

  // ---------------- 3. Add a note with quote details ----------------
  const noteBody = formatNote(body, qty)
  try {
    const noteRes = await ghlFetch(`${GHL_BASE}/contacts/${contactId}/notes`, token, {
      method: 'POST',
      body: JSON.stringify({ body: noteBody, userId: undefined }),
    })
    if (!noteRes.ok) {
      const text = await safeText(noteRes)
      console.warn('[quote-request] note failed (non-fatal)', noteRes.status, text)
    }
  } catch (err) {
    console.warn('[quote-request] note threw (non-fatal)', err)
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

async function safeText(res) {
  try { return await res.text() } catch (_) { return '' }
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
