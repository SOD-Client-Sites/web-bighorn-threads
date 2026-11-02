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

const apparelCases = [
  {
    offer: 'embroidered-polo-40', minimum: 12,
    product: 'Polo — $40 each, embroidered logo up to 8,000 stitches included',
  },
  {
    offer: 'custom-hoodie-25', minimum: 24,
    product: 'Hoodie — $25 each, two-color logo included',
  },
]

for (const { offer, minimum, product } of apparelCases) {
  test(`${offer} rejects missing, below-minimum, fractional and unsafe quantities before GHL`, async () => {
    for (const quantity of [undefined, null, '', String(minimum - 1), '-1', `${minimum}.5`, `${minimum}abc`, '9007199254740992']) {
      const result = await submit({ offer, vertical: 'corporate', quantity })
      assert.equal(result.status, 400, `${offer}: ${String(quantity)}`)
      assert.equal(result.data.ok, false)
      assert.equal(result.calls.some(({ url }) => url.includes('leadconnectorhq.com')), false)
    }
  })

  test(`${offer} accepts the minimum and derives product and tags from the offer`, async () => {
    const result = await submit({
      offer, vertical: 'corporate', quantity: String(minimum),
      product: 'tampered product and price', locationId: 'another-client',
    })
    assert.equal(result.status, 200)
    assert.equal(result.data.ok, true)
    const upsert = result.calls.find(({ url }) => url.endsWith('/contacts/upsert')).body
    assert.equal(upsert.locationId, locationId)
    const field = (id) => upsert.customFields.find((f) => f.id === id)?.field_value
    assert.equal(field('sjfsg4TTMK4zutyPULCE'), product)
    assert.equal(field('AuP8x0F7NvKOzWX0xxRh'), String(minimum))
    assert.equal(Object.hasOwn(upsert, 'tags'), false, 'upsert must not replace existing tags')
    const tags = result.calls.find(({ url }) => url.endsWith('/tags')).body.tags
    assert.deepEqual(tags, [offer, 'industry-corporate'])
  })

  test(`${offer} rejects a different vertical before GHL`, async () => {
    const result = await submit({ offer, vertical: 'trades', quantity: String(minimum) })
    assert.equal(result.status, 400)
    assert.equal(result.calls.some(({ url }) => url.includes('leadconnectorhq.com')), false)
  })
}

test('landing-page offers reject unknown and inherited object keys before GHL', async () => {
  for (const offer of ['arbitrary-workflow-trigger', 'constructor', '__proto__', 'toString']) {
    const result = await submit({ offer, vertical: 'corporate', quantity: '100' })
    assert.equal(result.status, 400, offer)
    assert.deepEqual(result.data, { ok: false, error: 'Unknown offer' })
    assert.equal(result.calls.some(({ url }) => url.includes('leadconnectorhq.com')), false)
  }
})
