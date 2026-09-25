import test from 'node:test'
import assert from 'node:assert/strict'
import { sagePost } from './_lib.js'

const auth = { acctId: 1, loginId: '', key: 'k' }
const respond = (body) => { globalThis.fetch = async () => new Response(JSON.stringify(body)) }

test('product detail (104) succeeds without an ok field', async () => {
  respond({ legalNote: '', product: { prName: 'Polo' } })
  assert.equal((await sagePost(104, {}, auth)).product.prName, 'Polo')
})

test('explicit failures still throw', async () => {
  respond({ ok: false })
  await assert.rejects(sagePost(103, {}, auth))
  respond({ errNum: 5, errMsg: 'bad' })
  await assert.rejects(sagePost(104, {}, auth), /err 5: bad/)
})
