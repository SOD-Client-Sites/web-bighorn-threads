// One-off: GSC + Bing month-by-month history for bighornthreads.com
import { readFileSync } from 'node:fs'
import { createSign } from 'node:crypto'
import { homedir } from 'node:os'
import { join } from 'node:path'

for (const line of readFileSync(join(homedir(), '.env'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/i)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}

function norm(p) {
  if (!p) return p
  const m = p.match(/^\/([a-zA-Z])\/(.*)$/)
  if (m) return `${m[1].toUpperCase()}:\\${m[2].replace(/\//g, '\\')}`
  return p
}

const key = JSON.parse(readFileSync(norm(process.env.GOOGLE_SERVICE_ACCOUNT_KEY), 'utf8'))
const b64 = (b) => Buffer.from(b).toString('base64url')

async function tok() {
  const now = Math.floor(Date.now() / 1000)
  const h = b64(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const c = b64(JSON.stringify({ iss: key.client_email, scope: 'https://www.googleapis.com/auth/webmasters.readonly', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }))
  const s = createSign('RSA-SHA256'); s.update(`${h}.${c}`)
  const jwt = `${h}.${c}.${b64(s.sign(key.private_key))}`
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}` })
  return (await r.json()).access_token
}

const SITE = 'sc-domain:bighornthreads.com'
async function gq(t, body) {
  const r = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`, { method: 'POST', headers: { Authorization: `Bearer ${t}`, 'content-type': 'application/json' }, body: JSON.stringify(body) })
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`)
  return r.json()
}

const t = await tok()
const d = await gq(t, { startDate: '2025-02-01', endDate: '2026-05-31', dimensions: ['date'], rowLimit: 25000 })
const gm = {}
for (const r of d.rows || []) { const mo = r.keys[0].slice(0, 7); gm[mo] = gm[mo] || { c: 0, i: 0 }; gm[mo].c += r.clicks; gm[mo].i += r.impressions }
console.log('=== GSC monthly (clicks / impressions) ===')
for (const mo of Object.keys(gm).sort()) console.log(`  ${mo}:  ${gm[mo].c} clk · ${gm[mo].i} impr`)

const sm = await (await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/sitemaps`, { headers: { Authorization: `Bearer ${t}` } })).json()
console.log('\n=== GSC sitemap indexing ===')
for (const s of sm.sitemap || []) for (const c of s.contents || []) console.log(`  ${c.type}: ${c.indexed}/${c.submitted} indexed (${s.path})`)

const bkey = process.env.BING_WEBMASTER_API_KEY
const base = 'https://ssl.bing.com/webmaster/api.svc/json/'
const H = { 'User-Agent': 'Mozilla/5.0' }
const parseD = (s) => new Date(parseInt(s.match(/\d+/)[0]))
const rt = await (await fetch(`${base}GetRankAndTrafficStats?siteUrl=${encodeURIComponent('https://bighornthreads.com/')}&apikey=${bkey}`, { headers: H })).json()
const bm = {}; let bmin, bmax
for (const r of rt.d || []) { const dt = parseD(r.Date); const mo = dt.toISOString().slice(0, 7); bm[mo] = bm[mo] || { c: 0, i: 0 }; bm[mo].c += r.Clicks; bm[mo].i += r.Impressions; if (!bmin || dt < bmin) bmin = dt; if (!bmax || dt > bmax) bmax = dt }
console.log('\n=== Bing monthly (clicks / impressions) ===')
console.log(`  data range: ${bmin && bmin.toISOString().slice(0, 10)} .. ${bmax && bmax.toISOString().slice(0, 10)} (${(rt.d || []).length} days)`)
for (const mo of Object.keys(bm).sort()) console.log(`  ${mo}:  ${bm[mo].c} clk · ${bm[mo].i} impr`)
const tc = Object.values(bm).reduce((a, b) => a + b.c, 0), ti = Object.values(bm).reduce((a, b) => a + b.i, 0)
console.log(`  TOTAL: ${tc} clk · ${ti} impr`)

const cs = await (await fetch(`${base}GetCrawlStats?siteUrl=${encodeURIComponent('https://bighornthreads.com/')}&apikey=${bkey}`, { headers: H })).json()
const last = (cs.d || []).slice(-1)[0]
const maxIdx = Math.max(...(cs.d || []).map((x) => x.InIndex || 0))
console.log('\n=== Bing crawl/index ===')
console.log(`  peak InIndex: ${maxIdx} · latest day InIndex: ${last && last.InIndex} · crawl errors latest: ${last && last.CrawlErrors}`)

try {
  const qs = await (await fetch(`${base}GetQueryStats?siteUrl=${encodeURIComponent('https://bighornthreads.com/')}&apikey=${bkey}`, { headers: H })).json()
  const qq = (qs.d || []).map((x) => ({ q: x.Query, i: x.Impressions, c: x.Clicks, pos: x.AvgImpressionPosition })).sort((a, b) => b.i - a.i).slice(0, 12)
  console.log('\n=== Bing top queries ===')
  for (const x of qq) console.log(`  ${String(x.i).padStart(4)} impr · ${x.c} clk · pos ${x.pos} · ${x.q}`)
} catch (e) { console.log('query stats err', e.message) }
