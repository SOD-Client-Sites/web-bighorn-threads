import assert from 'node:assert/strict'
import test from 'node:test'
import { onRequestPost } from './art-request.js'

const ENV = { GHL_LOCATION_ID: 'lNyfWNCloQHAP34OSwIZ', GHL_PIT_TOKEN: 'test-token', TURNSTILE_SECRET: 'test-secret' }

async function submit({ fields = {}, file = new File(['png'], 'logo.png', { type: 'image/png' }), uploadStatus = 200 } = {}) {
  const calls = []
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url, init = {}) => {
    const target = String(url)
    calls.push({ url: target, body: typeof init.body === 'string' ? JSON.parse(init.body) : null })
    if (target.includes('siteverify')) return Response.json({ success: true })
    if (target.endsWith('/medias/upload-file')) return Response.json({ url: 'https://files.example/logo.png' }, { status: uploadStatus })
    return Response.json({ contact: { id: 'art-test' } })
  }
  try {
    const body = new FormData()
    for (const [key, value] of Object.entries({ service: 'vector-logo', email: 'qa@example.com', 'cf-turnstile-response': 'ok', ...fields })) body.set(key, value)
    if (file) body.set('artwork', file)
    const res = await onRequestPost({ request: new Request('https://bighornthreads.com/api/art-request', { method: 'POST', body }), env: ENV })
    return { status: res.status, data: await res.json(), calls }
  } finally { globalThis.fetch = originalFetch }
}

test('art request saves the lead, tags the service and notes the file link', async () => {
  const { status, data, calls } = await submit({ fields: { details: 'Navy and gold' } })
  assert.equal(status, 200)
  assert.equal(data.fileSaved, true)
  assert.deepEqual(calls.find((c) => c.url.endsWith('/tags')).body.tags, ['art-request', 'art-vector-logo'])
  const note = calls.find((c) => c.url.endsWith('/notes')).body.body
  assert.match(note, /Logo to vector — \$49/)
  assert.match(note, /https:\/\/files.example\/logo.png/)
})

test('a failed upload still saves the lead and flags the missing file', async () => {
  const { status, data, calls } = await submit({ uploadStatus: 401 })
  assert.equal(status, 200)
  assert.equal(data.fileSaved, false)
  assert.match(calls.find((c) => c.url.endsWith('/notes')).body.body, /upload FAILED/)
})

test('rejects a missing file, wrong type, or unknown service before GHL', async () => {
  for (const args of [{ file: null }, { file: new File(['x'], 'run.exe') }, { fields: { service: 'free-logo' } }]) {
    const { status, calls } = await submit(args)
    assert.equal(status, 400)
    assert.equal(calls.some((c) => c.url.includes('leadconnectorhq.com')), false)
  }
})

test('ad UTMs land in Original Source and Original Source Detail', async () => {
  const { calls } = await submit({ fields: { utm_source: 'facebook', utm_medium: 'paid', utm_campaign: 'bht-vector', utm_content: 'vector-magic', landing: '/offers/vector-digitizing/' } })
  const fields = calls.find((c) => c.url.endsWith('/contacts/upsert')).body.customFields
  const value = (id) => fields.find((f) => f.id === id)?.field_value
  assert.equal(value('1x3FBbe1ETiX3b3aQ9OL'), 'facebook / paid')
  assert.equal(value('hGMW3LfcGIAXOZL2bRim'), 'bht-vector | vector-magic | /offers/vector-digitizing/')
})
