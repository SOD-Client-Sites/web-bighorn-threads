// Shared A2P 10DLC SMS/email consent helpers for the lead-capture endpoints.
// Keep the canonical checkbox copy below in sync with src/components/SmsConsentFields.astro,
// public/scripts/quote-modal.js, and the Bighorn Threads A2P campaign registration.
//
// Files prefixed with "_" are not routed as endpoints by Cloudflare Pages Functions.

export const SMS_CONSENT_COPY = {
  transactional:
    'I consent to receive transactional (non-marketing) text messages from VP Promos LLC, d/b/a ' +
    'Bighorn Threads at the phone number provided — quote follow-ups, order and artwork-proof ' +
    'updates, production and delivery status, and appointment reminders. Message frequency may ' +
    'vary. Message & data rates may apply. Reply HELP for help or STOP to opt out.',
  marketing:
    'I consent to receive marketing and promotional text messages from VP Promos LLC, d/b/a ' +
    'Bighorn Threads at the phone number provided — special offers, discounts, new products, and ' +
    'seasonal promotions. Message frequency may vary. Message & data rates may apply. Reply HELP ' +
    'for help or STOP to opt out.',
}

function truthy(v) {
  return v === true || v === 'yes' || v === 'on' || v === '1' || v === 1
}

/**
 * Parse the two A2P consent checkboxes from a request body.
 * @param {object} data       parsed request body (JSON object or FormData entries object)
 * @param {string} [sourceUrl] page URL the form was submitted from
 * @returns {{marketing:boolean, transactional:boolean, any:boolean, tags:string[], noteBlock:string}}
 */
export function parseSmsConsent(data, sourceUrl) {
  const marketing = truthy(data && data.smsMarketingConsent)
  const transactional = truthy(data && data.smsTransactionalConsent)
  const any = marketing || transactional

  const tags = []
  if (any) tags.push('sms-opt-in')
  if (marketing) tags.push('sms-consent-marketing')
  if (transactional) tags.push('sms-consent-transactional')

  const url =
    (sourceUrl && String(sourceUrl).trim()) ||
    (data && data.consentUrl && String(data.consentUrl).trim()) ||
    (data && data.sourceUrl && String(data.sourceUrl).trim()) ||
    ''

  const lines = ['', '--- SMS / EMAIL CONSENT (A2P 10DLC) ---', `Captured: ${new Date().toISOString()}`]
  if (url) lines.push(`Source page: ${url}`)
  lines.push(`Marketing texts: ${marketing ? 'YES — opted in' : 'no'}`)
  lines.push(`Non-marketing texts: ${transactional ? 'YES — opted in' : 'no'}`)
  if (transactional) lines.push('', 'Non-marketing consent language shown:', SMS_CONSENT_COPY.transactional)
  if (marketing) lines.push('', 'Marketing consent language shown:', SMS_CONSENT_COPY.marketing)
  if (!any) lines.push('(User did not check either SMS consent box.)')

  return { marketing, transactional, any, tags, noteBlock: lines.join('\n') }
}
