// /get-started/<vertical>/ landing pages and the $19 safety-hoodie offer
// → company-store-lead (or safety-hoodie-19) + one industry-<vertical> tag.
import { CF, fail, handleLead, json, str } from './_lead.js'
import { apparelOffers } from '../../src/data/apparelOffers.js'

const VERTICALS = ['corporate', 'education', 'government', 'healthcare', 'gaming-hospitality', 'events', 'trades']

export const onRequestPost = (context) => {
  // This form is Bighorn-only; refuse to write leads into any other GHL location.
  if (context.env?.GHL_LOCATION_ID !== 'lNyfWNCloQHAP34OSwIZ') {
    console.error('[lp-optin] missing GHL env vars')
    return fail('Server misconfigured', 500)
  }
  return handleLead(context, {
    label: 'lp-optin',
    required: ['vertical', 'email'],
    limits: { vertical: 100, quantity: 100, product: 500, details: 5_000, offer: 50 },
    build: (d) => {
      const vertical = str(d.vertical, 100)
      if (!VERTICALS.includes(vertical)) return { error: `Unknown vertical: ${vertical}` }
      const offer = str(d.offer, 50)
      if (offer && !Object.hasOwn(apparelOffers, offer)) return { error: 'Unknown offer' }
      const offerDetails = offer ? apparelOffers[offer] : undefined
      const quantity = str(d.quantity, 100)
      if (offerDetails && (vertical !== offerDetails.vertical || !/^\d+$/.test(quantity) || Number(quantity) < offerDetails.minimum || !Number.isSafeInteger(Number(quantity)))) {
        return { error: `This offer requires at least ${offerDetails.minimum} ${offerDetails.noun}s in a whole-number quantity.` }
      }
      return {
        name: str(d.contact, 200),
        company: str(d.company, 200),
        tags: [offerDetails ? offer : 'company-store-lead', `industry-${vertical}`],
        fields: {
          [CF.quantity]: quantity,
          [CF.product]: offerDetails ? offerDetails.product : str(d.product, 500),
          [CF.message]: str(d.details),
        },
        pageUrl: d.sourceUrl,
      }
    },
  })
}

export const onRequestGet = () => json({ ok: true, endpoint: 'lp-optin', method: 'POST' })
