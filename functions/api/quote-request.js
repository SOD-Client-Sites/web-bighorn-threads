// Product-page "Request a Quote" modal → same quote tag as the contact form.
import { CF, handleLead, json, str } from './_lead.js'

export const onRequestPost = (context) => handleLead(context, {
  label: 'quote-request',
  required: ['name', 'company', 'email', 'qty', 'productName'],
  limits: {
    qty: 20, productName: 500, productSpc: 200, productEId: 200, productCategory: 200, productImage: 2_048,
    color: 200, sizes: 1_000, decorationMethod: 200, decorationLocation: 200, inHandsDate: 100, notes: 5_000,
  },
  build: (d) => {
    const qty = str(d.qty, 20)
    if (!/^\d+$/.test(qty) || Number(qty) < 1 || Number(qty) > 1_000_000) {
      return { error: 'Quantity must be between 1 and 1000000' }
    }
    if (!str(d.productSpc) && !str(d.productEId)) return { error: 'Missing required product identifier (productSpc or productEId)' }
    const details = [
      ['Color', d.color], ['Sizes', d.sizes], ['Decoration', d.decorationMethod],
      ['Location', d.decorationLocation], ['In-hands date', d.inHandsDate], ['Notes', d.notes],
    ].filter(([, v]) => str(v)).map(([k, v]) => `${k}: ${str(v)}`).join('\n')
    return {
      name: str(d.name, 200),
      company: str(d.company, 200),
      tags: ['contact-quote-request'],
      fields: {
        [CF.product]: [str(d.productName, 500), str(d.productSpc, 200)].filter(Boolean).join(' — '),
        [CF.quantity]: qty,
        [CF.message]: details,
      },
      pageUrl: d.sourceUrl,
    }
  },
})

export const onRequestGet = () => json({ ok: true, endpoint: 'quote-request', method: 'POST' })
