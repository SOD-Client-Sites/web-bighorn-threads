// /contact and /get-a-quote forms → GHL contact tagged contact-quote-request.
import { CF, handleLead, json, str } from './_lead.js'

export const onRequestPost = (context) => handleLead(context, {
  label: 'contact',
  required: ['email'],
  limits: { quantity: 100, product: 500, message: 5_000 },
  build: (d) => ({
    name: str(d.name, 200),
    company: str(d.company, 200),
    tags: ['contact-quote-request'],
    fields: { [CF.quantity]: str(d.quantity, 100), [CF.product]: str(d.product, 500), [CF.message]: str(d.message) },
    pageUrl: d.consentUrl || d.sourceUrl,
  }),
})

export const onRequestGet = () => json({ ok: true, endpoint: 'contact', method: 'POST' })
