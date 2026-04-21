#!/usr/bin/env node
// Pull search performance from GSC — last 28 days: totals + top queries + top pages + indexed count.
// Run: node scripts/gsc-stats.mjs

import { readFileSync, existsSync } from 'node:fs'
import { createSign } from 'node:crypto'
import { homedir } from 'node:os'
import { join } from 'node:path'

if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
  const globalEnv = join(homedir(), '.env')
  if (existsSync(globalEnv)) {
    for (const line of readFileSync(globalEnv, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/i)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  }
}

const SITE_URL = process.env.GSC_SITE || 'sc-domain:bighornthreads.com'

function normalizePath(p) {
  if (!p) return p
  if (process.platform === 'win32') {
    const m = p.match(/^\/([a-zA-Z])\/(.*)$/)
    if (m) return `${m[1].toUpperCase()}:\\${m[2].replace(/\//g, '\\')}`
  }
  return p
}
const KEY_PATH = normalizePath(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
if (!KEY_PATH) { console.error('GOOGLE_SERVICE_ACCOUNT_KEY missing'); process.exit(1) }
const key = JSON.parse(readFileSync(KEY_PATH, 'utf8'))

function b64url(buf) { return Buffer.from(buf).toString('base64url') }

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000)
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claim = b64url(JSON.stringify({
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
  }))
  const signer = createSign('RSA-SHA256')
  signer.update(`${header}.${claim}`)
  const signature = b64url(signer.sign(key.private_key))
  const jwt = `${header}.${claim}.${signature}`
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  })
  const data = await res.json()
  if (!data.access_token) throw new Error(`Token exchange failed: ${JSON.stringify(data)}`)
  return data.access_token
}

function fmtDate(d) { return d.toISOString().slice(0, 10) }

async function query(token, body) {
  const site = encodeURIComponent(SITE_URL)
  const res = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${site}/searchAnalytics/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`query ${res.status}: ${await res.text()}`)
  return res.json()
}

async function main() {
  const token = await getAccessToken()
  const end = new Date()
  const start = new Date(end); start.setDate(end.getDate() - 28)
  const startDate = fmtDate(start), endDate = fmtDate(end)

  console.log(`\n=== bighornthreads.com · Search Console · ${startDate} → ${endDate} ===\n`)

  // Totals
  const totals = await query(token, { startDate, endDate, dimensions: [] })
  const t = totals.rows?.[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 }
  console.log(`TOTALS`)
  console.log(`  clicks:       ${t.clicks}`)
  console.log(`  impressions:  ${t.impressions}`)
  console.log(`  ctr:          ${(t.ctr * 100).toFixed(2)}%`)
  console.log(`  avg position: ${t.position?.toFixed(1) ?? 'n/a'}`)

  // Top queries
  console.log(`\nTOP QUERIES (by impressions)`)
  const q = await query(token, { startDate, endDate, dimensions: ['query'], rowLimit: 15 })
  if (!q.rows?.length) console.log('  (none yet)')
  else for (const r of q.rows) {
    console.log(`  ${String(r.impressions).padStart(5)} impr · ${String(r.clicks).padStart(3)} clk · pos ${r.position.toFixed(1).padStart(5)} · ${r.keys[0]}`)
  }

  // Top pages
  console.log(`\nTOP PAGES (by impressions)`)
  const p = await query(token, { startDate, endDate, dimensions: ['page'], rowLimit: 10 })
  if (!p.rows?.length) console.log('  (none yet)')
  else for (const r of p.rows) {
    const path = r.keys[0].replace('https://bighornthreads.com', '') || '/'
    console.log(`  ${String(r.impressions).padStart(5)} impr · ${String(r.clicks).padStart(3)} clk · pos ${r.position.toFixed(1).padStart(5)} · ${path}`)
  }

  // Sitemap status for context
  const site = encodeURIComponent(SITE_URL)
  const smRes = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${site}/sitemaps`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const sm = await smRes.json()
  console.log(`\nSITEMAP INDEXING`)
  for (const s of sm.sitemap || []) {
    for (const c of s.contents || []) {
      console.log(`  ${c.type}: ${c.indexed}/${c.submitted} indexed  (${s.path})`)
    }
  }
  console.log('')
}

main().catch((err) => { console.error('[gsc-stats] failed:', err.message); process.exit(1) })
