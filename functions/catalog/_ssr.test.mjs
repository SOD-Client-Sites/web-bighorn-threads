import test from 'node:test'
import assert from 'node:assert/strict'
import { renderCards } from './[category].js'

test('renders escaped product cards with link, price and minimum', () => {
  const html = renderCards([{ prodEId: 42, name: 'Polo <Pro> & "Co"', thumbPic: 'https://x/y.jpg', prc: '12.50', minQty: 24 }])
  assert.match(html, /href="\/product\/\?id=42&amp;slug=polo-pro-co"/)
  assert.match(html, /Polo &lt;Pro&gt; &amp; &quot;Co&quot;/)
  assert.match(html, /\$12\.50/)
  assert.match(html, /Min\. 24 pcs/)
  assert.doesNotMatch(html, /<Pro>/)
})
