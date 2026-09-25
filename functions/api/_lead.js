// Shared intake for every website lead form:
// bot check → one GHL upsert with real fields → consent note (only if they opted in) → tags.
// Files prefixed with "_" are not routed as endpoints by Cloudflare Pages Functions.

import { parseSmsConsent } from './_consent.js'
import { verifyTurnstile } from './_turnstile.js'
import { COMMON_FIELD_LIMITS, safeErrorName, validatePayload } from './_validation.js'

const GHL_BASE = 'https://services.leadconnectorhq.com'
const GHL_API_VERSION = '2021-07-28'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// GHL contact custom field IDs (Bighorn location lNyfWNCloQHAP34OSwIZ)
export const CF = {
  source: '1x3FBbe1ETiX3b3aQ9OL', // Original Source
  sourceDetail: 'hGMW3LfcGIAXOZL2bRim', // Original Source Detail
  quantity: 'AuP8x0F7NvKOzWX0xxRh', // Quantity Estimate
  message: 'BPFPC44V1QiiHdrTKpUN', // Quote Message
  product: 'sjfsg4TTMK4zutyPULCE', // Product
  trade: 'J4iXDY0OMNiGcdWDjPXg', // Trade (dropdown)
  crewSize: 'Ok0V5AleRwGALakbqWnN', // Crew Size
}

export const str = (v, max = 5_000) => String(v ?? '').trim().slice(0, max)

// Where the lead came from, from the per-session capture in TrackingHead.astro.
// Values are truncated, never rejected, so an oversized UTM can't cost a lead.
// ponytail: last-touch — a returning contact's source is overwritten by the newest form fill.
export function leadSource(data) {
  const utmSource = str(data?.utm_source, 120)
  const medium = str(data?.utm_medium, 120)
  const ref = str(data?.referrer, 200).toLowerCase()
  const click = str(data?.click, 20)
  let source = 'direct'
  if (utmSource) source = medium ? `${utmSource} / ${medium}` : utmSource
  else if (click === 'gclid') source = 'google / cpc'
  else if (click === 'fbclid') source = 'facebook / paid'
  else if (/(^|\.)google\./.test(ref)) source = 'google / organic'
  else if (/(^|\.)(bing|duckduckgo|yahoo)\./.test(ref)) source = `${ref.split('.').at(-2)} / organic`
  else if (/facebook|instagram/.test(ref)) source = 'facebook / social'
  else if (ref) source = `${ref} / referral`
  const detail = [str(data?.utm_campaign, 200), str(data?.landing, 300)].filter(Boolean).join(' | ')
  return { source, detail }
}

export function ghlFetch(path, token, init = {}) {
  return fetch(`${GHL_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Version: GHL_API_VERSION,
    },
    signal: AbortSignal.timeout(15_000),
  })
}

export const json = (payload, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })
export const fail = (error, status = 500) => json({ ok: false, error }, status)

/**
 * @param {object} context Pages Functions context
 * @param {object} spec
 *   label    log prefix
 *   required body fields that must be non-empty
 *   limits   extra per-field length limits
 *   build(data) → { error } | { name, firstName, lastName, company, tags, fields: {cfId: value}, pageUrl }
 *   after({ contactId, token, locationId, lead }) → optional extra JSON fields or a Response on failure
 */
export async function handleLead(context, spec) {
  const { request, env } = context
  let data
  try {
    data = (request.headers.get('content-type') || '').includes('application/json')
      ? await request.json()
      : Object.fromEntries((await request.formData()).entries())
  } catch (_) {
    return fail('Invalid body', 400)
  }
  if (!data || typeof data !== 'object') return fail('Invalid body', 400)

  // Honeypots (quote modal uses "website") — silent success for bots.
  if (str(data.bh_hp_field) || str(data.website)) return json({ ok: true, contactId: null, spam: true })

  const invalid = validatePayload(data, { ...COMMON_FIELD_LIMITS, ...spec.limits })
  if (invalid) return fail(invalid, 400)

  if (!(await verifyTurnstile({ env, request, token: data['cf-turnstile-response'] }))) {
    return fail('Verification failed. Please refresh and try again.', 400)
  }

  for (const f of spec.required) {
    if (!str(data[f])) return fail(`Missing required field: ${f}`, 400)
  }
  const email = str(data.email, 320)
  if (!EMAIL_RE.test(email)) return fail('Invalid email format', 400)

  const lead = spec.build(data)
  if (lead.error) return fail(lead.error, 400)

  const locationId = env.GHL_LOCATION_ID
  const token = env.GHL_PIT_TOKEN
  if (!locationId || !token) {
    console.error(`[${spec.label}] missing GHL env vars`)
    return fail('Server misconfigured', 500)
  }

  const phone = str(data.phone, 50)
  const consent = parseSmsConsent(data, lead.pageUrl)
  if (consent.any && !phone) return fail('Phone is required when SMS consent is selected', 400)

  const name = str(lead.name, 200)
  const [splitFirst = '', ...rest] = name.split(/\s+/)
  const firstName = lead.firstName ?? splitFirst
  const lastName = lead.lastName ?? rest.join(' ')
  const { source, detail } = leadSource(data)
  const fields = { ...lead.fields, [CF.source]: source, [CF.sourceDetail]: detail }

  // 1. Contact + fields in one call. Blank values are omitted so they never erase existing data.
  let contactId
  try {
    const upsert = { locationId, email, source: 'Website' }
    if (firstName) upsert.firstName = firstName
    if (lastName) upsert.lastName = lastName
    if (name) upsert.name = name
    if (lead.company) upsert.companyName = str(lead.company, 200)
    if (phone) upsert.phone = phone
    const customFields = Object.entries(fields)
      .filter(([, v]) => str(v))
      .map(([id, v]) => ({ id, field_value: str(v) }))
    if (customFields.length) upsert.customFields = customFields

    const res = await ghlFetch('/contacts/upsert', token, { method: 'POST', body: JSON.stringify(upsert) })
    if (!res.ok) {
      console.error(`[${spec.label}] GHL request failed`, { operation: 'contact-upsert', status: res.status })
      return fail(`GHL upsert failed (${res.status})`, 502)
    }
    const out = await res.json()
    contactId = out?.contact?.id || out?.id || out?.contactId
    if (!contactId) return fail('GHL upsert returned no contact id', 502)
  } catch (err) {
    console.error(`[${spec.label}] GHL request threw`, { operation: 'contact-upsert', error: safeErrorName(err) })
    return fail('GHL upsert error', 502)
  }

  // 2. Consent record (A2P proof) lands before tags so tag-triggered SMS workflows see it.
  if (consent.any) {
    try {
      const res = await ghlFetch(`/contacts/${contactId}/notes`, token, {
        method: 'POST',
        body: JSON.stringify({ body: consent.note }),
      })
      if (!res.ok) {
        console.error(`[${spec.label}] GHL request failed`, { operation: 'contact-note', status: res.status })
        return fail('Contact saved, but consent record failed', 502)
      }
    } catch (err) {
      console.error(`[${spec.label}] GHL request threw`, { operation: 'contact-note', error: safeErrorName(err) })
      return fail('Contact saved, but consent record failed', 502)
    }
  }

  // 3. Tags are added separately so existing tags are never replaced.
  try {
    const tags = [...lead.tags, ...consent.tags]
    const res = await ghlFetch(`/contacts/${contactId}/tags`, token, { method: 'POST', body: JSON.stringify({ tags }) })
    if (!res.ok) {
      console.error(`[${spec.label}] GHL request failed`, { operation: 'contact-tags', status: res.status })
      return fail('Contact saved, but lead routing failed', 502)
    }
  } catch (err) {
    console.error(`[${spec.label}] GHL request threw`, { operation: 'contact-tags', error: safeErrorName(err) })
    return fail('Contact saved, but lead routing failed', 502)
  }

  const extra = spec.after ? await spec.after({ contactId, token, locationId, lead }) : {}
  if (extra instanceof Response) return extra
  return json({ ok: true, contactId, ...extra })
}
