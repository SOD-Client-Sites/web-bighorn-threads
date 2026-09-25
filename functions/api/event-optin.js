// Event QR opt-in (/win). Event tags are allowlisted server-side so visitors
// cannot apply arbitrary tags that trigger unrelated GHL workflows.
import { handleLead, json, str } from './_lead.js'

const EVENTS = { 'event-golf-tournament': 'Golf Tournament 2026' }

export const onRequestPost = (context) => handleLead(context, {
  label: 'event-optin',
  required: ['firstName', 'lastName', 'email', 'business'],
  limits: { eventTag: 100 },
  build: (d) => {
    const eventTag = str(d.eventTag, 100) || 'event-golf-tournament'
    if (!EVENTS[eventTag]) return { error: 'Unknown event' }
    return {
      firstName: str(d.firstName, 100),
      lastName: str(d.lastName, 100),
      name: `${str(d.firstName, 100)} ${str(d.lastName, 100)}`,
      company: str(d.business, 200),
      tags: [eventTag],
      fields: {},
      pageUrl: d.consentUrl || 'https://bighornthreads.com/win/',
    }
  },
})

export const onRequestGet = () => json({ ok: true, endpoint: 'event-optin', method: 'POST' })
