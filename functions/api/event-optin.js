// Bighorn Threads — Event opt-in endpoint (QR landing pages at golf, expos, etc).
// Validates POST body, upserts contact in GHL, applies the event tag.
// Tag is sent from the form so the same endpoint serves every event.

const GHL_BASE = 'https://services.leadconnectorhq.com'
const GHL_API_VERSION = '2021-07-28'
const DEFAULT_TAG = 'event-optin'

const REQUIRED_FIELDS = ['firstName', 'lastName', 'email', 'phone', 'business']

export async function onRequestPost({ request, env }) {
  let body
  try {
    body = await request.json()
  } catch (_) {
    return errorResponse('Invalid JSON body', 400)
  }
  if (!body || typeof body !== 'object') return errorResponse('Invalid body', 400)

  if (body.website && String(body.website).trim()) {
    return jsonResponse({ ok: true, contactId: null, spam: true })
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
  const phone = String(body.phone).trim()
  const business = String(body.business).trim()
  const eventTag = (body.eventTag && String(body.eventTag).trim()) || DEFAULT_TAG
  const eventLabel = (body.eventLabel && String(body.eventLabel).trim()) || eventTag

  let contactId = null
  try {
    const upsertRes = await ghlFetch(`${GHL_BASE}/contacts/upsert`, token, {
      method: 'POST',
      body: JSON.stringify({
        locationId,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email,
        phone,
        companyName: business,
        source: eventLabel,
        tags: [eventTag, 'event-optin'],
      }),
    })
    if (!upsertRes.ok) {
      const text = await safeText(upsertRes)
      console.error('[event-optin] upsert failed', upsertRes.status, text)
      return errorResponse(`GHL upsert failed (${upsertRes.status})`, 502)
    }
    const upsertData = await upsertRes.json()
    contactId = upsertData?.contact?.id || upsertData?.id || upsertData?.contactId
    if (!contactId) return errorResponse('GHL upsert returned no contact id', 502)
  } catch (err) {
    console.error('[event-optin] upsert threw', err)
    return errorResponse('GHL upsert error', 502)
  }

  try {
    await ghlFetch(`${GHL_BASE}/contacts/${contactId}/tags`, token, {
      method: 'POST',
      body: JSON.stringify({ tags: [eventTag, 'event-optin'] }),
    })
  } catch (err) {
    console.warn('[event-optin] tag add failed (non-fatal)', err)
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
  return jsonResponse({ ok: true, endpoint: 'event-optin', method: 'POST' })
}
