import assert from 'node:assert/strict'
import test from 'node:test'

import {
  deriveOriginalAttribution,
  persistOriginalAttribution,
  scheduleOriginalAttribution,
} from './_attribution.js'

test('derives paid channel from first-touch click identifiers', () => {
  const result = deriveOriginalAttribution({
    attribution: {
      firstNonDirectTouch: {
        gclid: 'test-click-id',
        utm_campaign: 'Vegas Crews',
        landingPage: '/get-a-quote/',
      },
    },
  }, 'Quote form')

  assert.equal(result.source, 'Google')
  assert.equal(result.detail, 'Quote form | Campaign: Vegas Crews | Landing: /get-a-quote/')
})

test('keeps populated first-touch fields immutable', async () => {
  const requests = []
  const fetcher = async (url, init) => {
    requests.push({ url, init })
    return new Response(JSON.stringify({
      contact: {
        customFields: [
          { id: '1x3FBbe1ETiX3b3aQ9OL', value: 'Referral Partner' },
          { id: 'hGMW3LfcGIAXOZL2bRim', value: 'Existing detail' },
        ],
      },
    }), { status: 200 })
  }

  const result = await persistOriginalAttribution({
    contactId: 'contact-1',
    token: 'not-a-real-token',
    data: { attribution: { firstNonDirectTouch: { fbclid: 'test' } } },
    fallbackDetail: 'Form',
    fetcher,
  })

  assert.deepEqual(result, { ok: true, status: 200, unchanged: true })
  assert.equal(requests.length, 1)
})

test('writes only missing first-touch fields', async () => {
  const requests = []
  const fetcher = async (url, init) => {
    requests.push({ url, init })
    if (!init.method) {
      return new Response(JSON.stringify({
        contact: { customFields: [{ id: '1x3FBbe1ETiX3b3aQ9OL', value: 'Website' }] },
      }), { status: 200 })
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  }

  const result = await persistOriginalAttribution({
    contactId: 'contact-2',
    token: 'not-a-real-token',
    data: { attribution: { sessionLandingPage: '/contact/' } },
    fallbackDetail: 'Contact form',
    fetcher,
  })

  assert.equal(result.ok, true)
  assert.equal(requests.length, 2)
  const payload = JSON.parse(requests[1].init.body)
  assert.deepEqual(payload.customFields, [
    { id: 'hGMW3LfcGIAXOZL2bRim', fieldValue: 'Contact form | Landing: /contact/' },
  ])
})

test('schedules enrichment on the Cloudflare request lifecycle', async () => {
  let releaseFetch
  const fetchGate = new Promise((resolve) => { releaseFetch = resolve })
  /** @type {Promise<unknown> | undefined} */
  let lifecycleTask
  const waitUntil = (task) => { lifecycleTask = Promise.resolve(task) }
  const fetcher = async () => {
    await fetchGate
    return new Response(JSON.stringify({ contact: { customFields: [] } }), { status: 200 })
  }

  const result = await scheduleOriginalAttribution({
    waitUntil,
    label: 'test-lead',
    contactId: 'contact-3',
    token: 'not-a-real-token',
    data: {},
    fallbackDetail: 'Test form',
    fetcher,
  })

  assert.deepEqual(result, { ok: true, status: 202, scheduled: true })
  assert.ok(lifecycleTask instanceof Promise)
  releaseFetch()
  const lifecycleResult = await lifecycleTask
  assert.equal(lifecycleResult.ok, true)
})

test('awaits enrichment when no request lifecycle hook exists', async () => {
  let completed = false
  const fetcher = async (_url, init) => {
    if (!init.method) {
      return new Response(JSON.stringify({ contact: { customFields: [] } }), { status: 200 })
    }
    completed = true
    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  }

  const result = await scheduleOriginalAttribution({
    label: 'test-lead',
    contactId: 'contact-4',
    token: 'not-a-real-token',
    data: {},
    fallbackDetail: 'Test form',
    fetcher,
  })

  assert.equal(result.ok, true)
  assert.equal(completed, true)
})
