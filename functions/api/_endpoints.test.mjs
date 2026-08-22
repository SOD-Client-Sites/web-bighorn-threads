import assert from 'node:assert/strict'
import test from 'node:test'

import { onRequestPost as contact } from './contact.js'
import { onRequestPost as convertRequest } from './convert-request.js'
import { onRequestPost as demoOptin } from './demo-optin.js'
import { onRequestPost as eventOptin } from './event-optin.js'
import { onRequestPost as lpOptin } from './lp-optin.js'
import { onRequestPost as quoteRequest } from './quote-request.js'
import { normalizeSiteUrl } from './_validation.js'

const ENV = {
  GHL_LOCATION_ID: 'location-test',
  GHL_PIT_TOKEN: 'token-test',
  TURNSTILE_SECRET: 'turnstile-test',
}

function response(payload = {}, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function installFetchMock({ opportunityStatus = 200, tagStatus = 200, noteStatus = 200 } = {}) {
  const calls = []
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (input, init = {}) => {
    const url = String(input)
    const method = init.method || 'GET'
    calls.push({ url, method, body: init.body ? JSON.parse(init.body) : null })

    if (url.includes('/turnstile/v0/siteverify')) return response({ success: true })
    if (url.endsWith('/contacts/upsert')) return response({ contact: { id: 'contact-test' } })
    if (url.endsWith('/contacts/contact-test/tags')) return response({ tags: [] }, tagStatus)
    if (url.endsWith('/contacts/contact-test/notes')) return response({ note: { id: 'note-test' } }, noteStatus)
    if (url.endsWith('/contacts/contact-test') && method === 'GET') {
      return response({ contact: { id: 'contact-test', customFields: [] } })
    }
    if (url.endsWith('/contacts/contact-test') && method === 'PUT') return response({ contact: { id: 'contact-test' } })
    if (url.endsWith('/opportunities/')) {
      return opportunityStatus === 200
        ? response({ opportunity: { id: 'opportunity-test' } })
        : response({ message: 'sensitive upstream body must not be logged' }, opportunityStatus)
    }
    throw new Error(`Unexpected fetch in test: ${method} ${url}`)
  }
  return { calls, restore: () => { globalThis.fetch = originalFetch } }
}

async function invoke(handler, payload) {
  const lifecycle = []
  const request = new Request('https://www.bighornthreads.com/api/test', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      attribution: { sessionLandingPage: 'https://www.bighornthreads.com/test' },
      ...payload,
      'cf-turnstile-response': 'verified-token',
    }),
  })
  const result = await handler({
    request,
    env: ENV,
    waitUntil(task) { lifecycle.push(Promise.resolve(task)) },
  })
  await Promise.all(lifecycle)
  return result
}

test('all lead endpoints preserve existing tags by separating upsert and tag-add calls', { concurrency: false }, async () => {
  const cases = [
    {
      name: 'contact',
      handler: contact,
      body: { email: 'lead@example.com' },
      tags: ['contact-quote-request'],
    },
    {
      name: 'demo-optin',
      handler: demoOptin,
      body: { company: 'Acme', contact: 'Ava Lee', email: 'lead@example.com', trade: 'Electrical' },
      tags: ['company-store-demo', 'company-store-lead'],
    },
    {
      name: 'event-optin',
      handler: eventOptin,
      body: { firstName: 'Ava', lastName: 'Lee', email: 'lead@example.com', business: 'Acme', eventTag: 'event-golf-tournament' },
      tags: ['event-golf-tournament', 'event-optin'],
    },
    {
      name: 'lp-optin',
      handler: lpOptin,
      body: { vertical: 'trades', email: 'lead@example.com' },
      tags: ['company-store-lead', 'segment-trades', 'industry-trades'],
    },
    {
      name: 'quote-request',
      handler: quoteRequest,
      body: { name: 'Ava Lee', company: 'Acme', email: 'lead@example.com', qty: 24, productName: 'Work Shirt', productSpc: 'SPC-1' },
      tags: ['bighorn-quote-request'],
    },
    {
      name: 'convert-request',
      handler: convertRequest,
      body: { company: 'Acme', contact: 'Ava Lee', email: 'lead@example.com' },
      tags: ['company-store-convert-request', 'company-store-lead'],
    },
  ]

  for (const endpoint of cases) {
    const mock = installFetchMock()
    try {
      const result = await invoke(endpoint.handler, endpoint.body)
      assert.equal(result.status, 200, endpoint.name)

      const upsert = mock.calls.find((call) => call.url.endsWith('/contacts/upsert'))
      assert.ok(upsert, `${endpoint.name}: expected contact upsert`)
      assert.equal(Object.hasOwn(upsert.body, 'tags'), false, `${endpoint.name}: upsert must not replace contact tags`)

      const tagAdd = mock.calls.find((call) => call.url.endsWith('/contacts/contact-test/tags'))
      assert.ok(tagAdd, `${endpoint.name}: expected additive tag request`)
      assert.deepEqual(tagAdd.body.tags, endpoint.tags, `${endpoint.name}: intended tags`)
    } finally {
      mock.restore()
    }
  }
})

test('event opt-in rejects tags outside the server allowlist before contacting GHL', { concurrency: false }, async () => {
  const mock = installFetchMock()
  try {
    const result = await invoke(eventOptin, {
      firstName: 'Ava',
      lastName: 'Lee',
      email: 'lead@example.com',
      business: 'Acme',
      eventTag: 'arbitrary-workflow-trigger',
    })
    assert.equal(result.status, 400)
    assert.equal(mock.calls.some((call) => call.url.includes('services.leadconnectorhq.com')), false)
  } finally {
    mock.restore()
  }
})

test('convert request reports failure when GHL opportunity creation fails', { concurrency: false }, async () => {
  const mock = installFetchMock({ opportunityStatus: 503 })
  const originalConsoleError = console.error
  const errorLogs = []
  console.error = (...args) => { errorLogs.push(args) }
  try {
    const result = await invoke(convertRequest, {
      company: 'Acme',
      contact: 'Ava Lee',
      email: 'lead@example.com',
    })
    assert.equal(result.status, 502)
    assert.deepEqual(await result.json(), {
      ok: false,
      error: 'Contact saved, but opportunity creation failed',
    })
    assert.equal(JSON.stringify(errorLogs).includes('sensitive upstream body'), false)
  } finally {
    console.error = originalConsoleError
    mock.restore()
  }
})

test('all lead endpoints fail visibly when required routing tags are not saved', { concurrency: false }, async () => {
  const cases = [
    [contact, { email: 'lead@example.com' }],
    [demoOptin, { company: 'Acme', contact: 'Ava Lee', email: 'lead@example.com', trade: 'Electrical' }],
    [eventOptin, { firstName: 'Ava', lastName: 'Lee', email: 'lead@example.com', business: 'Acme', eventTag: 'event-golf-tournament' }],
    [lpOptin, { vertical: 'trades', email: 'lead@example.com' }],
    [quoteRequest, { name: 'Ava Lee', company: 'Acme', email: 'lead@example.com', qty: 24, productName: 'Work Shirt', productSpc: 'SPC-1' }],
    [convertRequest, { company: 'Acme', contact: 'Ava Lee', email: 'lead@example.com' }],
  ]

  const originalConsoleError = console.error
  console.error = () => {}
  try {
    for (const [handler, payload] of cases) {
      const mock = installFetchMock({ tagStatus: 503 })
      try {
        const result = await invoke(handler, payload)
        assert.equal(result.status, 502)
        assert.deepEqual(await result.json(), { ok: false, error: 'Contact saved, but lead routing failed' })
        assert.equal(mock.calls.some((call) => call.url.endsWith('/opportunities/')), false)
      } finally {
        mock.restore()
      }
    }
  } finally {
    console.error = originalConsoleError
  }
})

test('consent-bearing endpoints persist the audit note before applying routing tags', { concurrency: false }, async () => {
  const cases = [
    [contact, { email: 'lead@example.com', phone: '7025550100', smsTransactionalConsent: 'yes' }],
    [demoOptin, { company: 'Acme', contact: 'Ava Lee', email: 'lead@example.com', phone: '7025550100', trade: 'Electrical', smsMarketingConsent: 'yes' }],
    [eventOptin, { firstName: 'Ava', lastName: 'Lee', email: 'lead@example.com', phone: '7025550100', business: 'Acme', eventTag: 'event-golf-tournament', smsTransactionalConsent: 'yes' }],
    [lpOptin, { vertical: 'trades', email: 'lead@example.com', phone: '7025550100', smsMarketingConsent: 'yes' }],
    [quoteRequest, { name: 'Ava Lee', company: 'Acme', email: 'lead@example.com', phone: '7025550100', qty: 24, productName: 'Work Shirt', productSpc: 'SPC-1', smsTransactionalConsent: 'yes' }],
  ]

  for (const [handler, payload] of cases) {
    const mock = installFetchMock()
    try {
      const result = await invoke(handler, payload)
      assert.equal(result.status, 200)
      const noteIndex = mock.calls.findIndex((call) => call.url.endsWith('/contacts/contact-test/notes'))
      const tagIndex = mock.calls.findIndex((call) => call.url.endsWith('/contacts/contact-test/tags'))
      assert.ok(noteIndex >= 0 && tagIndex > noteIndex)
      assert.match(mock.calls[noteIndex].body.body, /Consented phone: 7025550100/)
    } finally {
      mock.restore()
    }
  }
})

test('consent-bearing endpoints do not apply routing tags when the audit note fails', { concurrency: false }, async () => {
  const cases = [
    [contact, { email: 'lead@example.com' }],
    [demoOptin, { company: 'Acme', contact: 'Ava Lee', email: 'lead@example.com', trade: 'Electrical' }],
    [eventOptin, { firstName: 'Ava', lastName: 'Lee', email: 'lead@example.com', business: 'Acme', eventTag: 'event-golf-tournament' }],
    [lpOptin, { vertical: 'trades', email: 'lead@example.com' }],
    [quoteRequest, { name: 'Ava Lee', company: 'Acme', email: 'lead@example.com', qty: 24, productName: 'Work Shirt', productSpc: 'SPC-1' }],
  ]

  const originalConsoleError = console.error
  console.error = () => {}
  try {
    for (const [handler, payload] of cases) {
      const mock = installFetchMock({ noteStatus: 503 })
      try {
        const result = await invoke(handler, payload)
        assert.equal(result.status, 502)
        assert.deepEqual(await result.json(), { ok: false, error: 'Contact saved, but consent record failed' })
        assert.equal(mock.calls.some((call) => call.url.endsWith('/contacts/contact-test/tags')), false)
      } finally {
        mock.restore()
      }
    }
  } finally {
    console.error = originalConsoleError
  }
})

test('quote upsert preserves an existing phone when the optional phone field is blank', { concurrency: false }, async () => {
  const mock = installFetchMock()
  try {
    const result = await invoke(quoteRequest, {
      name: 'Ava Lee', company: 'Acme', email: 'lead@example.com', phone: '',
      qty: 24, productName: 'Work Shirt', productSpc: 'SPC-1',
    })
    assert.equal(result.status, 200)
    const upsert = mock.calls.find((call) => call.url.endsWith('/contacts/upsert'))
    assert.equal(Object.hasOwn(upsert.body, 'phone'), false)
  } finally {
    mock.restore()
  }
})

test('site URL normalization strips query data and rejects external origins', () => {
  assert.equal(
    normalizeSiteUrl('https://www.bighornthreads.com/get-a-quote/?email=private@example.com#form'),
    'https://bighornthreads.com/get-a-quote/',
  )
  assert.equal(normalizeSiteUrl('https://evil.example/collect?email=private@example.com', 'fallback'), 'fallback')
})

test('SMS consent is rejected without a submitted phone number', { concurrency: false }, async () => {
  const cases = [
    [contact, { email: 'lead@example.com', smsTransactionalConsent: 'yes' }],
    [demoOptin, { company: 'Acme', contact: 'Ava Lee', email: 'lead@example.com', trade: 'Electrical', smsMarketingConsent: 'yes' }],
    [eventOptin, { firstName: 'Ava', lastName: 'Lee', email: 'lead@example.com', business: 'Acme', eventTag: 'event-golf-tournament', smsTransactionalConsent: 'yes' }],
    [lpOptin, { vertical: 'trades', email: 'lead@example.com', smsMarketingConsent: 'yes' }],
    [quoteRequest, { name: 'Ava Lee', company: 'Acme', email: 'lead@example.com', qty: 24, productName: 'Work Shirt', productSpc: 'SPC-1', smsTransactionalConsent: 'yes' }],
  ]

  for (const [handler, payload] of cases) {
    const mock = installFetchMock()
    try {
      const result = await invoke(handler, payload)
      assert.equal(result.status, 400)
      assert.deepEqual(await result.json(), { ok: false, error: 'Phone is required when SMS consent is selected' })
      assert.equal(mock.calls.some((call) => call.url.includes('services.leadconnectorhq.com')), false)
    } finally {
      mock.restore()
    }
  }
})

test('oversized fields are rejected before bot verification or GHL calls', { concurrency: false }, async () => {
  const mock = installFetchMock()
  try {
    const result = await invoke(contact, {
      email: 'lead@example.com',
      message: 'x'.repeat(5_001),
    })
    assert.equal(result.status, 400)
    assert.equal(mock.calls.length, 0)
  } finally {
    mock.restore()
  }
})

test('honeypots retain silent-success behavior without external calls', { concurrency: false }, async () => {
  const cases = [
    [contact, { bh_hp_field: 'bot' }],
    [convertRequest, { bh_hp_field: 'bot' }],
    [demoOptin, { bh_hp_field: 'bot' }],
    [eventOptin, { bh_hp_field: 'bot' }],
    [lpOptin, { bh_hp_field: 'bot' }],
    [quoteRequest, { website: 'bot' }],
  ]

  for (const [handler, payload] of cases) {
    const mock = installFetchMock()
    try {
      const result = await invoke(handler, payload)
      assert.equal(result.status, 200)
      assert.equal((await result.json()).spam, true)
      assert.equal(mock.calls.length, 0)
    } finally {
      mock.restore()
    }
  }
})
