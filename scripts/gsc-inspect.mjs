#!/usr/bin/env node
// Real index coverage via URL Inspection API. Samples sitemap URLs (or all with --all).
// Run: node scripts/gsc-inspect.mjs [--all]

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
const ALL = process.argv.includes('--all')

function normalizePath(p) {
  if (!p) return p
  if (process.platform === 'win32') {
    const m = p.match(/^\/([a-zA-Z])\/(.*)$/)
    if (m) return `${m[1].toUpperCase()}:\\${m[2].replace(/\//g, '\\')}`
  }
  return p
}
const key = JSON.parse(readFileSync(normalizePath(process.env.GOOGLE_SERVICE_ACCOUNT_KEY), 'utf8'))
const b64url = (buf) => Buffer.from(buf).toString('base64url')

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
  const jwt = `${header}.${claim}.${b64url(signer.sign(key.private_key))}`
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  })
  const data = await res.json()
  if (!data.access_token) throw new Error(`Token exchange failed: ${JSON.stringify(data)}`)
  return data.access_token
}

async function inspect(token, url) {
  const res = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ inspectionUrl: url, siteUrl: SITE_URL }),
  })
  if (!res.ok) return { url, error: `${res.status}: ${(await res.text()).slice(0, 120)}` }
  const r = (await res.json()).inspectionResult?.indexStatusResult || {}
  return { url, verdict: r.verdict, coverage: r.coverageState, lastCrawl: r.lastCrawlTime, robots: r.robotsTxtState, indexing: r.indexingState }
}

async function main() {
  const token = await getAccessToken()
  const xml = await (await fetch('https://bighornthreads.com/sitemap-0.xml')).text()
  let urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])

  if (!ALL) {
    // representative sample across page types
    const want = ['/', '/about/', '/services/', '/contact/', '/safety-compliance/',
      '/custom-team-shirts-las-vegas/', '/custom-hard-hats-las-vegas/', '/industries/',
      '/industries/electrical-contractors-las-vegas/', '/catalog/', '/catalog/hi-vis/',
      '/blog/', '/blog/welder-uniforms-fr-shirts-las-vegas/', '/service-areas/henderson-nv/',
      '/brands/carhartt-custom-las-vegas/']
    urls = urls.filter((u) => want.includes(u.replace('https://bighornthreads.com', '') || '/'))
  }

  console.log(`\n=== URL Inspection · ${SITE_URL} · ${urls.length} URLs ===\n`)
  const tally = {}
  for (const u of urls) {
    const r = await inspect(token, u)
    const path = r.url.replace('https://bighornthreads.com', '') || '/'
    if (r.error) { console.log(`  ERR  ${path}  →  ${r.error}`); tally.ERROR = (tally.ERROR || 0) + 1; continue }
    const cov = r.coverage || r.verdict || 'UNKNOWN'
    tally[cov] = (tally[cov] || 0) + 1
    const crawl = r.lastCrawl ? r.lastCrawl.slice(0, 10) : 'never'
    console.log(`  ${(r.verdict || '?').padEnd(8)} ${cov.padEnd(34)} crawl:${crawl}  ${path}`)
    await new Promise((res) => setTimeout(res, 350)) // gentle on quota
  }
  console.log('\nSUMMARY')
  for (const [k, v] of Object.entries(tally)) console.log(`  ${String(v).padStart(3)} · ${k}`)
  console.log('')
}

main().catch((e) => { console.error('[gsc-inspect] failed:', e.message); process.exit(1) })
