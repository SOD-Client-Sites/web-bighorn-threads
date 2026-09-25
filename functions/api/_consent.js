// Shared A2P 10DLC SMS/email consent helpers for the lead-capture endpoints.
// Keep the canonical checkbox copy below in sync with src/components/SmsConsentFields.astro,
// public/scripts/quote-modal.js, and the Bighorn Threads A2P campaign registration.
//
// Files prefixed with "_" are not routed as endpoints by Cloudflare Pages Functions.

import { normalizeSiteUrl } from './_validation.js'

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
 * @returns {{marketing:boolean, transactional:boolean, any:boolean, tags:string[], note:string}}
 */
export function parseSmsConsent(data, sourceUrl) {
  const marketing = truthy(data && data.smsMarketingConsent)
  const transactional = truthy(data && data.smsTransactionalConsent)
  const any = marketing || transactional
  const types = [transactional && 'transactional', marketing && 'marketing'].filter(Boolean).join(' + ')
  const url = normalizeSiteUrl(sourceUrl || data?.consentUrl || data?.sourceUrl, 'https://bighornthreads.com/')
  const phone = any && data?.phone ? String(data.phone).trim() : ''
  // One line: which boxes, which phone, which page, when. The exact wording shown is SMS_CONSENT_COPY.
  const note = any ? `SMS consent (${types}) for ${phone} on ${url} at ${new Date().toISOString()}` : ''
  return { marketing, transactional, any, tags: any ? ['sms-opt-in'] : [], note }
}
