// Bighorn Threads — vertical lead-capture landing-page opt-in endpoint.
// Powers /get-started/<vertical>/ LPs and the per-vertical hub forms.
// Upserts the lead into GHL, tags it by vertical segment, maps headcount to the
// Quantity Estimate custom field, and attaches a structured note with every answer.

import { parseSmsConsent } from './_consent.js'
import { verifyTurnstile } from './_turnstile.js'

const GHL_BASE = 'https://services.leadconnectorhq.com'
const GHL_API_VERSION = '2021-07-28'

// GHL custom field IDs (Bighorn location lNyfWNCloQHAP34OSwIZ)
const CF_QUANTITY_ESTIMATE = 'AuP8x0F7NvKOzWX0xxRh' // TEXT — "how many people would order / outfit"

const REQUIRED_FIELDS = ['vertical', 'company', 'contact', 'email']

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

export async function onRequestPost({ request, env }) {
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

  const contactName = String(body.contact).trim()
  const [firstName, ...rest] = contactName.split(/\s+/)
  const lastName = rest.join(' ').trim() || ''
  const company = String(body.company).trim()
  const phone = body.phone ? String(body.phone).trim() : ''
  const headcount = body.headcount ? String(body.headcount).trim() : ''
  // qualifiers: { "Question label": "answer", ... }
  const qualifiers = (body.qualifiers && typeof body.qualifiers === 'object') ? body.qualifiers : {}
  const consent = parseSmsConsent(body, body.sourceUrl)

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
      source: `bighornthreads.com — ${verticalLabel} company store LP`,
      tags: ['company-store-lead', `segment-${verticalSlug}`, ...consent.tags],
    }
    if (phone) upsertBody.phone = phone
    if (headcount) upsertBody.customFields = [{ id: CF_QUANTITY_ESTIMATE, value: headcount }]

    const upsertRes = await ghlFetch(`${GHL_BASE}/contacts/upsert`, token, {
      method: 'POST',
      body: JSON.stringify(upsertBody),
    })
    if (!upsertRes.ok) {
      const text = await safeText(upsertRes)
      console.error('[lp-optin] upsert failed', upsertRes.status, text)
      return errorResponse(`GHL upsert failed (${upsertRes.status})`, 502)
    }
    const upsertData = await upsertRes.json()
    contactId = upsertData?.contact?.id || upsertData?.id || upsertData?.contactId
    if (!contactId) {
      console.error('[lp-optin] upsert returned no id', upsertData)
      return errorResponse('GHL upsert returned no contact id', 502)
    }
  } catch (err) {
    console.error('[lp-optin] upsert threw', err)
    return errorResponse('GHL upsert error', 502)
  }

  // ---------------- Note with full detail ----------------
  const noteBody = formatNote({ verticalLabel, company, contactName, email, phone, headcount, qualifiers, sourceUrl: body.sourceUrl })
    + '\n' + consent.noteBlock
  try {
    const noteRes = await ghlFetch(`${GHL_BASE}/contacts/${contactId}/notes`, token, {
      method: 'POST',
      body: JSON.stringify({ body: noteBody }),
    })
    if (!noteRes.ok) {
      const text = await safeText(noteRes)
      console.warn('[lp-optin] note failed (non-fatal)', noteRes.status, text)
    }
  } catch (err) {
    console.warn('[lp-optin] note threw (non-fatal)', err)
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

async function safeText(res) {
  try { return await res.text() } catch (_) { return '' }
}

function formatNote({ verticalLabel, company, contactName, email, phone, headcount, qualifiers, sourceUrl }) {
  const lines = []
  lines.push(`=== ${verticalLabel.toUpperCase()} — COMPANY STORE LEAD ===`)
  lines.push('')
  lines.push('CONTACT')
  lines.push(`  Name:      ${contactName}`)
  lines.push(`  Company:   ${company}`)
  lines.push(`  Email:     ${email}`)
  if (phone) lines.push(`  Phone:     ${phone}`)
  lines.push('')
  lines.push('DETAILS')
  lines.push(`  Vertical:  ${verticalLabel}`)
  if (headcount) lines.push(`  Headcount: ${headcount}`)
  for (const [label, value] of Object.entries(qualifiers)) {
    if (value && String(value).trim()) lines.push(`  ${label}: ${String(value).trim()}`)
  }
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
