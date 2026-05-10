// Bighorn Threads — Main /contact "Get a Quote" form endpoint.
// Accepts FormData (form submits via fetch + FormData), upserts contact to GHL,
// applies tag, and attaches a note with the full quote-request details so
// re-submissions from the same person leave their own timestamped record.

const GHL_BASE = 'https://services.leadconnectorhq.com'
const GHL_API_VERSION = '2021-07-28'
const TAG = 'contact-quote-request'

const REQUIRED_FIELDS = ['name', 'company', 'email']

// GHL custom field IDs (Bighorn Threads location). Created via API on 2026-05-01.
const CF_SERVICE_INTEREST = 'DvESTdLKy9ZFrsu5eVsp'
const CF_QUANTITY_ESTIMATE = 'AuP8x0F7NvKOzWX0xxRh'
const CF_TIMELINE = 'DRuIOjbLxqwSqM7EYlTV'
const CF_QUOTE_MESSAGE = 'BPFPC44V1QiiHdrTKpUN'

export async function onRequestPost({ request, env }) {
  let data
  try {
    const ct = request.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      data = await request.json()
    } else {
      const fd = await request.formData()
      data = Object.fromEntries(fd.entries())
    }
  } catch (_) {
    return errorResponse('Invalid body', 400)
  }
  if (!data || typeof data !== 'object') return errorResponse('Invalid body', 400)

  // Honeypot — silently drop spam
  if (data.bh_hp_field && String(data.bh_hp_field).trim()) {
    return jsonResponse({ ok: true, contactId: null, spam: true })
  }

  for (const f of REQUIRED_FIELDS) {
    if (!data[f] || !String(data[f]).trim()) {
      return errorResponse(`Missing required field: ${f}`, 400)
    }
  }

  const email = String(data.email).trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return errorResponse('Invalid email format', 400)
  }

  const locationId = env.GHL_LOCATION_ID
  const token = env.GHL_PIT_TOKEN
  if (!locationId || !token) {
    console.error('[contact] missing GHL env vars')
    return errorResponse('Server misconfigured', 500)
  }

  const fullName = String(data.name).trim()
  const [firstName, ...rest] = fullName.split(/\s+/)
  const lastName = rest.join(' ') || '-'
  const company = String(data.company).trim()
  const phone = data.phone ? String(data.phone).trim() : ''
  const service = data.service ? String(data.service).trim() : ''
  const quantity = data.quantity ? String(data.quantity).trim() : ''
  const timeline = data.timeline ? String(data.timeline).trim() : ''
  const message = data.message ? String(data.message).trim() : ''

  let contactId = null
  try {
    const upsertBody = {
      locationId,
      firstName,
      lastName,
      name: fullName,
      email,
      companyName: company,
      source: 'bighornthreads.com — Contact Page',
      tags: [TAG],
    }
    if (phone) upsertBody.phone = phone

    const customFields = []
    if (service) customFields.push({ id: CF_SERVICE_INTEREST, field_value: service })
    if (quantity) customFields.push({ id: CF_QUANTITY_ESTIMATE, field_value: quantity })
    if (timeline) customFields.push({ id: CF_TIMELINE, field_value: timeline })
    if (message) customFields.push({ id: CF_QUOTE_MESSAGE, field_value: message })
    if (customFields.length) upsertBody.customFields = customFields

    const upsertRes = await ghlFetch(`${GHL_BASE}/contacts/upsert`, token, {
      method: 'POST',
      body: JSON.stringify(upsertBody),
    })
    if (!upsertRes.ok) {
      const text = await safeText(upsertRes)
      console.error('[contact] upsert failed', upsertRes.status, text)
      return errorResponse(`GHL upsert failed (${upsertRes.status})`, 502)
    }
    const upsertData = await upsertRes.json()
    contactId = upsertData?.contact?.id || upsertData?.id || upsertData?.contactId
    if (!contactId) return errorResponse('GHL upsert returned no contact id', 502)
  } catch (err) {
    console.error('[contact] upsert threw', err)
    return errorResponse('GHL upsert error', 502)
  }

  try {
    await ghlFetch(`${GHL_BASE}/contacts/${contactId}/tags`, token, {
      method: 'POST',
      body: JSON.stringify({ tags: [TAG] }),
    })
  } catch (err) {
    console.warn('[contact] tag add failed (non-fatal)', err)
  }

  try {
    const lines = [
      `Quote request — ${new Date().toISOString()}`,
      `Name: ${fullName}`,
      `Company: ${company}`,
      `Email: ${email}`,
    ]
    if (phone) lines.push(`Phone: ${phone}`)
    if (service) lines.push(`Service: ${service}`)
    if (quantity) lines.push(`Quantity: ${quantity}`)
    if (timeline) lines.push(`Timeline: ${timeline}`)
    if (message) lines.push('', 'Message:', message)
    await ghlFetch(`${GHL_BASE}/contacts/${contactId}/notes`, token, {
      method: 'POST',
      body: JSON.stringify({ body: lines.join('\n') }),
    })
  } catch (err) {
    console.warn('[contact] note add failed (non-fatal)', err)
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

async function safeText(res) {
  try { return await res.text() } catch (_) { return '' }
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
  return jsonResponse({ ok: true, endpoint: 'contact', method: 'POST' })
}
