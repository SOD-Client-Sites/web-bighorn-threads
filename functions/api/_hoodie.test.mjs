import assert from 'node:assert/strict'
import test from 'node:test'
import { onRequestPost } from './lp-optin.js'

const locationId = 'lNyfWNCloQHAP34OSwIZ'
async function submit(overrides = {}, envOverrides = {}) {
  const calls = []
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), body: init.body ? JSON.parse(init.body) : null })
    const data = String(url).includes('siteverify') ? { success: true }
      : { contact: { id: 'hoodie-test', locationId, customFields: [] } }
    return Response.json(data)
  }
  try {
    const pending = []
    const result = await onRequestPost({
      request: new Request('https://bighornthreads.com/api/lp-optin', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ vertical: 'trades', offer: 'safety-hoodie-19', email: 'qa@example.com', quantity: '100', 'cf-turnstile-response': 'test', ...overrides }),
      }),
      env: { GHL_LOCATION_ID: locationId, GHL_PIT_TOKEN: 'test-token', TURNSTILE_SECRET: 'test-secret', ...envOverrides },
      waitUntil(promise) { pending.push(promise) },
    })
    await Promise.all(pending)
    return { status: result.status, data: await result.json(), calls }
  } finally { globalThis.fetch = originalFetch }
}

test('hoodie offer rejects quantities below 100 or non-integer counts', async () => {
  for (const quantity of ['99', '', '100.5', '100abc']) {
    const result = await submit({ quantity })
    assert.equal(result.status, 400, quantity)
    assert.equal(result.calls.some(({ url }) => url.includes('leadconnectorhq.com')), false)
  }
})

test('hoodie leads keep the offer, quantity and client-specific routing together', async () => {
  const result = await submit({ product: 'tampered', locationId: 'another-client', sourceUrl: 'https://bighornthreads.com/offers/safety-hoodie/' })
  assert.equal(result.status, 200)
  const upsert = result.calls.find(({ url }) => url.endsWith('/contacts/upsert')).body
  assert.equal(upsert.locationId, locationId)
  const field = (id) => upsert.customFields.find((f) => f.id === id)?.field_value
  assert.equal(field('sjfsg4TTMK4zutyPULCE'), 'Safety Yellow Cooling Performance Hoodie — $19 each')
  assert.equal(field('AuP8x0F7NvKOzWX0xxRh'), '100')
  const tags = result.calls.find(({ url }) => url.endsWith('/tags')).body.tags
  assert.deepEqual(tags, ['safety-hoodie-19', 'industry-trades'])
})

test('landing-page submissions fail closed for a different GHL location', async () => {
  const result = await submit({}, { GHL_LOCATION_ID: 'another-client' })
  assert.equal(result.status, 500)
  assert.equal(result.calls.some(({ url }) => url.includes('leadconnectorhq.com')), false)
})
