// /preview "Make my store real" → company-store-lead + an opportunity in
// 01 Sales Pipeline → Company Store Requested.
import { CF, fail, ghlFetch, handleLead, json, str } from './_lead.js'
import { safeErrorName } from './_validation.js'
import { tradeOption } from './demo-optin.js'

const PIPELINE_ID = 'PKybkPYN4ITvoEfxEifG'
const STAGE_ID = '66aaf645-b6c9-40e1-813d-620671bab354'

export const onRequestPost = (context) => handleLead(context, {
  label: 'convert-request',
  required: ['company', 'contact', 'email'],
  limits: { trade: 200, crewSize: 20, notes: 5_000 },
  build: (d) => ({
    name: str(d.contact, 200),
    company: str(d.company, 200),
    tags: ['company-store-lead'],
    fields: {
      [CF.trade]: tradeOption(d.trade),
      [CF.crewSize]: str(d.crewSize, 20),
      [CF.message]: [str(d.notes, 2_000), str(d.previewUrl, 2_048) && `Preview: ${str(d.previewUrl, 2_048)}`].filter(Boolean).join('\n'),
    },
    pageUrl: 'https://bighornthreads.com/preview/',
  }),
  after: async ({ contactId, token, locationId, lead }) => {
    try {
      const res = await ghlFetch('/opportunities/', token, {
        method: 'POST',
        body: JSON.stringify({
          pipelineId: PIPELINE_ID, pipelineStageId: STAGE_ID, locationId, contactId,
          name: `${lead.company} — Company Store`, status: 'open',
        }),
      })
      const opportunityId = res.ok ? ((await res.json())?.opportunity?.id || null) : null
      if (opportunityId) return { opportunityId }
      console.error('[convert-request] GHL request failed', { operation: 'opportunity-create', status: res.status })
    } catch (err) {
      console.error('[convert-request] GHL request threw', { operation: 'opportunity-create', error: safeErrorName(err) })
    }
    return fail('Contact saved, but opportunity creation failed', 502)
  },
})

export const onRequestGet = () => json({ ok: true, endpoint: 'convert-request', method: 'POST' })
