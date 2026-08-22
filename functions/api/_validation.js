// Shared, dependency-free request validation for public lead endpoints.
// Keep payloads bounded before copying values into GHL fields or notes.

const MAX_PAYLOAD_CHARS = 64_000

export function validatePayload(data, limits = {}) {
  let serialized
  try {
    serialized = JSON.stringify(data)
  } catch (_) {
    return 'Invalid body'
  }
  if (!serialized || serialized.length > MAX_PAYLOAD_CHARS) return 'Request body is too large'

  for (const [field, max] of Object.entries(limits)) {
    const value = data?.[field]
    if (value === undefined || value === null || value === '') continue
    if (field === 'attribution' && typeof value === 'object' && !Array.isArray(value)) {
      if (JSON.stringify(value).length > max) return `Field is too long: ${field}`
      continue
    }
    if (typeof value === 'object') return `Invalid field: ${field}`
    if (String(value).length > max) return `Field is too long: ${field}`
  }
  return null
}

export const COMMON_FIELD_LIMITS = Object.freeze({
  email: 320,
  phone: 50,
  firstName: 100,
  lastName: 100,
  name: 200,
  contact: 200,
  company: 200,
  business: 200,
  sourceUrl: 2_048,
  consentUrl: 2_048,
  previewUrl: 2_048,
  externalLeadId: 120,
  eventId: 120,
  attribution: 12_000,
  'cf-turnstile-response': 2_048,
  bh_hp_field: 500,
  website: 500,
})

export function safeErrorName(error) {
  return error && typeof error === 'object' && typeof error.name === 'string'
    ? error.name
    : 'Error'
}

export function normalizeSiteUrl(value, fallback = '') {
  const raw = String(value || '').trim()
  if (!raw) return fallback
  try {
    const url = new URL(raw, 'https://bighornthreads.com')
    const hostname = url.hostname.toLowerCase().replace(/^www\./, '')
    if (hostname !== 'bighornthreads.com') return fallback
    return `https://bighornthreads.com${url.pathname || '/'}`
  } catch (_) {
    return fallback
  }
}
