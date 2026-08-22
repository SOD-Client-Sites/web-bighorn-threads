// Shared, allowlisted attribution formatter for GHL lead notes.
// Values come from the site's first-party capture script. Never include contact
// details here and never transform click IDs.

const TOUCH_KEYS = [
  'capturedAt', 'landingPage', 'referrer',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid',
]

const GHL_BASE = 'https://services.leadconnectorhq.com'
const GHL_API_VERSION = 'v3'
const CF_ORIGINAL_SOURCE = '1x3FBbe1ETiX3b3aQ9OL'
const CF_ORIGINAL_SOURCE_DETAIL = 'hGMW3LfcGIAXOZL2bRim'

function safeErrorName(error) {
  return error && typeof error === 'object' && typeof error.name === 'string'
    ? error.name
    : 'Error'
}

function clean(value, max = 1000) {
  return String(value || '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max)
}

function parseObject(value) {
  if (!value) return null
  if (typeof value === 'object' && !Array.isArray(value)) return value
  if (typeof value !== 'string' || value.length > 12_000) return null
  try {
    const parsed = JSON.parse(value)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null
  } catch (_) {
    return null
  }
}

function normalizeTouch(value) {
  const source = parseObject(value)
  if (!source) return null
  const touch = {}
  for (const key of TOUCH_KEYS) {
    const value = clean(source[key], key === 'capturedAt' ? 50 : 1000)
    if (value) touch[key] = value
  }
  return Object.keys(touch).length ? touch : null
}

function appendTouch(lines, label, touch) {
  if (!touch) return
  lines.push(`${label}:`)
  for (const key of TOUCH_KEYS) {
    if (touch[key]) lines.push(`  ${key}: ${touch[key]}`)
  }
}

export function formatAttributionNote(data) {
  if (!data || typeof data !== 'object') return ''
  const attribution = parseObject(data.attribution)
  const firstTouch = normalizeTouch(attribution?.firstNonDirectTouch)
  const lastTouch = normalizeTouch(attribution?.lastNonDirectTouch)
  const sessionLandingPage = clean(attribution?.sessionLandingPage, 1000)
  const conversionPage = clean(attribution?.conversionPage, 1000)
  const externalLeadId = clean(data.externalLeadId, 120)
  const eventId = clean(data.eventId, 120)

  if (!firstTouch && !lastTouch && !sessionLandingPage && !conversionPage && !externalLeadId && !eventId) return ''

  const lines = ['', '--- FIRST-PARTY ATTRIBUTION ---']
  if (externalLeadId) lines.push(`External lead ID: ${externalLeadId}`)
  if (eventId) lines.push(`Conversion event ID: ${eventId}`)
  if (sessionLandingPage) lines.push(`Session landing page: ${sessionLandingPage}`)
  if (conversionPage) lines.push(`Conversion page: ${conversionPage}`)
  appendTouch(lines, 'First non-direct touch', firstTouch)
  appendTouch(lines, 'Last non-direct touch', lastTouch)
  return lines.join('\n')
}

export function deriveOriginalAttribution(data, fallbackDetail = 'Website form') {
  const attribution = parseObject(data?.attribution)
  const firstTouch = normalizeTouch(attribution?.firstNonDirectTouch)
  const utmSource = clean(firstTouch?.utm_source, 120).toLowerCase()
  const referrer = clean(firstTouch?.referrer, 500).toLowerCase()

  let source = 'Website'
  if (firstTouch?.fbclid || /(^|[._-])(facebook|instagram|meta)([._-]|$)/.test(utmSource)) source = 'Meta'
  else if (firstTouch?.gclid || firstTouch?.gbraid || firstTouch?.wbraid || /(^|[._-])google([._-]|$)/.test(utmSource)) source = 'Google'
  else if (firstTouch?.msclkid || /(^|[._-])(bing|microsoft)([._-]|$)/.test(utmSource)) source = 'Bing'
  else if (utmSource) source = clean(firstTouch.utm_source, 120)
  else if (referrer.includes('google.')) source = 'Google Organic'
  else if (referrer.includes('bing.com')) source = 'Bing Organic'
  else if (referrer) source = 'Referral'

  const detailParts = []
  const fallback = clean(fallbackDetail, 200)
  if (fallback) detailParts.push(fallback)
  if (firstTouch?.utm_campaign) detailParts.push(`Campaign: ${clean(firstTouch.utm_campaign, 160)}`)
  if (firstTouch?.landingPage) detailParts.push(`Landing: ${clean(firstTouch.landingPage, 300)}`)
  else if (attribution?.sessionLandingPage) detailParts.push(`Landing: ${clean(attribution.sessionLandingPage, 300)}`)

  return { source, detail: clean(detailParts.join(' | '), 500) }
}

// Preserve first-touch CRM fields after an upsert. Existing values are read
// first and never replaced. The API endpoints treat a failure as non-fatal so
// the lead itself is not lost if attribution enrichment is unavailable.
export async function persistOriginalAttribution({ contactId, token, data, fallbackDetail, fetcher = fetch }) {
  if (!contactId || !token) return { ok: false, status: 0 }

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Version: GHL_API_VERSION,
  }
  const contactRes = await fetcher(`${GHL_BASE}/contacts/${encodeURIComponent(contactId)}`, {
    headers,
    signal: AbortSignal.timeout(15_000),
  })
  if (!contactRes.ok) return { ok: false, status: contactRes.status }

  const contactData = await contactRes.json()
  const customFields = Array.isArray(contactData?.contact?.customFields)
    ? contactData.contact.customFields
    : []
  const hasValue = (fieldId) => customFields.some((field) => {
    if (field?.id !== fieldId) return false
    return Boolean(clean(field?.value ?? field?.fieldValue ?? field?.field_value, 1000))
  })

  const attribution = deriveOriginalAttribution(data, fallbackDetail)
  const updates = []
  if (!hasValue(CF_ORIGINAL_SOURCE)) updates.push({ id: CF_ORIGINAL_SOURCE, fieldValue: attribution.source })
  if (!hasValue(CF_ORIGINAL_SOURCE_DETAIL)) updates.push({ id: CF_ORIGINAL_SOURCE_DETAIL, fieldValue: attribution.detail })
  if (!updates.length) return { ok: true, status: 200, unchanged: true }

  const updateRes = await fetcher(`${GHL_BASE}/contacts/${encodeURIComponent(contactId)}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ customFields: updates }),
    signal: AbortSignal.timeout(15_000),
  })
  return { ok: updateRes.ok, status: updateRes.status, unchanged: false }
}

// Cloudflare Pages keeps waitUntil tasks alive after the response is returned.
// Local callers without a request lifecycle hook fall back to awaiting the same
// task so attribution is not silently abandoned during tests or development.
export function scheduleOriginalAttribution({ waitUntil, label = 'lead', ...options }) {
  const task = persistOriginalAttribution(options)
    .then((result) => {
      if (!result.ok) console.warn(`[${label}] attribution fields unavailable (non-fatal)`, result.status)
      return result
    })
    .catch((err) => {
      console.warn(`[${label}] attribution fields failed (non-fatal)`, safeErrorName(err))
      return { ok: false, status: 0 }
    })

  if (typeof waitUntil === 'function') {
    try {
      waitUntil(task)
      return Promise.resolve({ ok: true, status: 202, scheduled: true })
    } catch (err) {
      console.warn(`[${label}] waitUntil unavailable; using synchronous fallback`, safeErrorName(err))
    }
  }

  return task
}
