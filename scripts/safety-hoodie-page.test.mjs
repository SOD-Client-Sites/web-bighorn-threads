import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync, existsSync } from 'node:fs'

test('hoodie landing page has a dedicated offer and matching lead form', () => {
  const page = new URL('../src/pages/offers/safety-hoodie/index.astro', import.meta.url)
  assert.ok(existsSync(page), 'dedicated hoodie landing page exists')
  const html = readFileSync(page, 'utf8')
  assert.match(html, /Cooling hoodies<br\s*\/>with your logo\./)
  assert.doesNotMatch(html, /Hard work\.<br/)
  assert.match(html, /offer="safety-hoodie-19"/)
  assert.match(html, /100-piece minimum/)
  assert.match(html, /\$19/)
  assert.match(html, /\/images\/offers\/safety-hoodie/)
  assert.match(html, /href="#request"/)
})

test('offer form requires quantity and reports a request, not a payment', () => {
  const form = readFileSync(new URL('../src/components/LeadCaptureForm.astro', import.meta.url), 'utf8')
  assert.match(form, /min=\{isHoodieOffer \? 100/)
  assert.match(form, /required=\{isHoodieOffer\}/)
  assert.match(form, /offer: form.dataset.offer/)
  assert.match(form, /No payment has been taken/)
})
