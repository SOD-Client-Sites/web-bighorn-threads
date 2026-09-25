// /demo company-store preview form → company-store-lead with Trade + Crew Size fields.
// The logo data URL is intentionally not sent to GHL (too large; it lives in the preview URL).
import { CF, handleLead, json, str } from './_lead.js'

// Must match the GHL "Trade" dropdown options exactly, or GHL rejects the value.
export const TRADES = [
  'General Contractor', 'Electrical', 'Mechanical & HVAC', 'Plumbing', 'Concrete & Masonry',
  'Steel & Ironworkers', 'Roofing & Solar', 'Data Center / Mission-Critical', 'Other',
]
export const tradeOption = (v) => (TRADES.includes(str(v)) ? str(v) : str(v) ? 'Other' : '')

export const onRequestPost = (context) => handleLead(context, {
  label: 'demo-optin',
  required: ['company', 'contact', 'email', 'trade'],
  limits: { trade: 200, crewSize: 20 },
  build: (d) => ({
    name: str(d.contact, 200),
    company: str(d.company, 200),
    tags: ['company-store-lead'],
    fields: { [CF.trade]: tradeOption(d.trade), [CF.crewSize]: str(d.crewSize, 20) },
    pageUrl: d.sourceUrl || 'https://bighornthreads.com/demo/',
  }),
})

export const onRequestGet = () => json({ ok: true, endpoint: 'demo-optin', method: 'POST' })
