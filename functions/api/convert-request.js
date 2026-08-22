// Bighorn Threads — "Make my store real" convert request from the /preview/ page.
// The person already submitted the /demo/ form, so they're a known lead. This upserts
// by email, creates a GHL Opportunity in the Sales Pipeline "Company Store Requested"
// stage, and attaches a note with their requested details + free-text notes.

import { verifyTurnstile } from './_turnstile.js'
import { formatAttributionNote, scheduleOriginalAttribution } from './_attribution.js'
import { COMMON_FIELD_LIMITS, normalizeSiteUrl, safeErrorName, validatePayload } from './_validation.js'

const GHL_BASE = 'https://services.leadconnectorhq.com'
const GHL_API_VERSION = '2021-07-28'
const CONVERT_TAG = 'company-store-convert-request'

// Bighorn GHL "01 Sales Pipeline" → "Company Store Requested" stage.
const PIPELINE_ID = 'PKybkPYN4ITvoEfxEifG'
const STAGE_ID = '66aaf645-b6c9-40e1-813d-620671bab354'

const REQUIRED_FIELDS = ['company', 'contact', 'email']

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
    return jsonResponse({ ok: true, opportunityId: null, spam: true })
  }

  const validationError = validatePayload(body, {
    ...COMMON_FIELD_LIMITS,
    trade: 200,
    crewSize: 20,
    notes: 5_000,
  })
  if (validationError) return errorResponse(validationError, 400)

  // Cloudflare Turnstile — fail closed
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
    console.error('[convert-request] missing GHL env vars')
    return errorResponse('Server misconfigured', 500)
  }

  const contactName = String(body.contact).trim()
  const [firstName, ...rest] = contactName.split(/\s+/)
  const lastName = rest.join(' ').trim() || ''
  const company = String(body.company).trim()
  const phone = body.phone ? String(body.phone).trim() : ''
  const trade = body.trade ? String(body.trade).trim() : ''
  const crewSize = body.crewSize ? parseInt(String(body.crewSize), 10) : null
  const notes = body.notes ? String(body.notes).trim().slice(0, 2000) : ''
  const previewUrl = normalizeSiteUrl(body.previewUrl, 'https://bighornthreads.com/preview/')

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
      source: 'bighornthreads.com — company store convert',
    }
    if (phone) upsertBody.phone = phone

    const upsertRes = await ghlFetch(`${GHL_BASE}/contacts/upsert`, token, {
      method: 'POST',
      body: JSON.stringify(upsertBody),
    })
    if (!upsertRes.ok) {
      console.error('[convert-request] GHL request failed', { operation: 'contact-upsert', status: upsertRes.status })
      return errorResponse(`GHL upsert failed (${upsertRes.status})`, 502)
    }
    const upsertData = await upsertRes.json()
    contactId = upsertData?.contact?.id || upsertData?.id || upsertData?.contactId
    if (!contactId) return errorResponse('GHL upsert returned no contact id', 502)
  } catch (err) {
    console.error('[convert-request] GHL request threw', { operation: 'contact-upsert', error: safeErrorName(err) })
    return errorResponse('GHL upsert error', 502)
  }

  await scheduleOriginalAttribution({
    waitUntil: typeof context.waitUntil === 'function' ? context.waitUntil.bind(context) : undefined,
    label: 'convert-request',
    contactId,
    token,
    data: body,
    fallbackDetail: 'Company store conversion request',
  })

  try {
    const tagRes = await ghlFetch(`${GHL_BASE}/contacts/${contactId}/tags`, token, {
      method: 'POST',
      body: JSON.stringify({ tags: [CONVERT_TAG, 'company-store-lead'] }),
    })
    if (!tagRes.ok) {
      console.error('[convert-request] GHL request failed', { operation: 'contact-tags', status: tagRes.status })
      return errorResponse('Contact saved, but lead routing failed', 502)
    }
  } catch (err) {
    console.error('[convert-request] GHL request threw', { operation: 'contact-tags', error: safeErrorName(err) })
    return errorResponse('Contact saved, but lead routing failed', 502)
  }

  // ---------------- Create opportunity (Company Store Requested) ----------------
  let opportunityId = null
  let opportunityFailure = null
  try {
    const oppRes = await ghlFetch(`${GHL_BASE}/opportunities/`, token, {
      method: 'POST',
      body: JSON.stringify({
        pipelineId: PIPELINE_ID,
        pipelineStageId: STAGE_ID,
        locationId,
        contactId,
        name: `${company} — Company Store`,
        status: 'open',
      }),
    })
    if (oppRes.ok) {
      const oppData = await oppRes.json()
      opportunityId = oppData?.opportunity?.id || oppData?.id || null
      if (!opportunityId) {
        opportunityFailure = { operation: 'opportunity-create', status: oppRes.status, reason: 'missing-id' }
        console.error('[convert-request] GHL response missing opportunity id', opportunityFailure)
      }
    } else {
      opportunityFailure = { operation: 'opportunity-create', status: oppRes.status }
      console.error('[convert-request] GHL request failed', opportunityFailure)
    }
  } catch (err) {
    opportunityFailure = { operation: 'opportunity-create', status: 0, error: safeErrorName(err) }
    console.error('[convert-request] GHL request threw', opportunityFailure)
  }

  // ---------------- Note ----------------
  try {
    const lines = [
      '=== COMPANY STORE — CONVERT REQUEST ===',
      '',
      'CONTACT',
      `  Name:      ${contactName}`,
      `  Company:   ${company}`,
      `  Email:     ${email}`,
    ]
    if (phone) lines.push(`  Phone:     ${phone}`)
    if (trade) lines.push(`  Trade:     ${trade}`)
    if (crewSize) lines.push(`  Crew size: ${crewSize}`)
    if (notes) { lines.push('', 'NOTES FROM CUSTOMER', notes) }
    if (previewUrl) { lines.push('', 'PREVIEW', `  ${previewUrl}`) }
    const attributionNote = formatAttributionNote(body)
    if (attributionNote) lines.push(attributionNote)
    const noteRes = await ghlFetch(`${GHL_BASE}/contacts/${contactId}/notes`, token, {
      method: 'POST',
      body: JSON.stringify({ body: lines.join('\n') }),
    })
    if (!noteRes.ok) console.warn('[convert-request] GHL request failed (non-fatal)', { operation: 'contact-note', status: noteRes.status })
  } catch (err) {
    console.warn('[convert-request] GHL request threw (non-fatal)', { operation: 'contact-note', error: safeErrorName(err) })
  }

  if (opportunityFailure) {
    return errorResponse('Contact saved, but opportunity creation failed', 502)
  }
  return jsonResponse({ ok: true, contactId, opportunityId })
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
  return jsonResponse({ ok: true, endpoint: 'convert-request', method: 'POST' })
}
