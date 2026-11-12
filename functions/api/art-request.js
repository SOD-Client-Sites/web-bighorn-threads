// /offers/vector-digitizing/ → GHL contact + art-request tags, artwork file in GHL media, note with the link.
// The lead is saved even if the file upload fails; the note then tells Steve to ask for the file.
import { CF, fail, ghlFetch, handleLead, str } from './_lead.js'
import { safeErrorName } from './_validation.js'
import { ART_FILE_TYPES, ART_MAX_BYTES, artServices } from '../../src/data/artServices.js'

async function uploadArtwork(file, token) {
  const body = new FormData()
  body.set('file', file, file.name)
  body.set('name', file.name)
  try {
    const res = await fetch('https://services.leadconnectorhq.com/medias/upload-file', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', Version: '2021-07-28' },
      body,
      signal: AbortSignal.timeout(30_000),
    })
    if (!res.ok) {
      console.error('[art-request] GHL request failed', { operation: 'media-upload', status: res.status })
      return null
    }
    const out = await res.json()
    return out?.url || out?.fileUrl || null
  } catch (err) {
    console.error('[art-request] GHL request threw', { operation: 'media-upload', error: safeErrorName(err) })
    return null
  }
}

export const onRequestPost = async (context) => {
  if (context.env?.GHL_LOCATION_ID !== 'lNyfWNCloQHAP34OSwIZ') {
    console.error('[art-request] missing GHL env vars')
    return fail('Server misconfigured', 500)
  }

  let form
  try {
    form = await context.request.formData()
  } catch (_) {
    return fail('Invalid body', 400)
  }
  const file = form.get('artwork')
  form.delete('artwork')
  if (!(file instanceof File) || !file.size) return fail('Please attach your logo or design file.', 400)
  if (file.size > ART_MAX_BYTES) return fail('File is too large. The limit is 10 MB.', 400)
  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  if (!ART_FILE_TYPES.includes(ext)) return fail(`Unsupported file type. Send one of: ${ART_FILE_TYPES.join(', ')}.`, 400)

  // handleLead reads the body itself, so hand it the text fields as JSON (headers kept for Turnstile's IP).
  const headers = new Headers(context.request.headers)
  headers.set('content-type', 'application/json')
  headers.delete('content-length')
  const request = new Request(context.request.url, {
    method: 'POST',
    headers,
    body: JSON.stringify(Object.fromEntries(form.entries())),
  })

  return handleLead({ ...context, request }, {
    label: 'art-request',
    required: ['service', 'email'],
    limits: { service: 50, details: 5_000 },
    build: (d) => {
      const id = str(d.service, 50)
      if (!Object.hasOwn(artServices, id)) return { error: 'Choose a service' }
      const service = artServices[id]
      return {
        name: str(d.contact, 200),
        company: str(d.company, 200),
        tags: ['art-request', `art-${id}`],
        fields: {
          [CF.product]: `${service.label} — $${service.price}`,
          [CF.message]: str(d.details),
        },
        pageUrl: d.sourceUrl,
        service,
        details: str(d.details),
      }
    },
    after: async ({ contactId, token, lead }) => {
      const url = await uploadArtwork(file, token)
      const note = [
        `Vector/digitizing request: ${lead.service.label} — $${lead.service.price} (no payment taken)`,
        url ? `Artwork: ${url}` : `Artwork upload FAILED (${file.name}). Ask the customer to email the file.`,
        lead.details && `Details: ${lead.details}`,
      ].filter(Boolean).join('\n')
      try {
        const res = await ghlFetch(`/contacts/${contactId}/notes`, token, { method: 'POST', body: JSON.stringify({ body: note }) })
        if (!res.ok) console.error('[art-request] GHL request failed', { operation: 'contact-note', status: res.status })
      } catch (err) {
        console.error('[art-request] GHL request threw', { operation: 'contact-note', error: safeErrorName(err) })
      }
      return { fileSaved: Boolean(url) }
    },
  })
}
