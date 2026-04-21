#!/usr/bin/env node
// Submit sitemap to Google Search Console via service account.
// Run after every deploy: `node scripts/gsc-submit.mjs`
// Requires env: GOOGLE_SERVICE_ACCOUNT_KEY (path to JSON file)

import { readFileSync, existsSync } from 'node:fs'
import { createSign } from 'node:crypto'
import { homedir } from 'node:os'
import { join } from 'node:path'

// Fall back to user's global .env if GOOGLE_SERVICE_ACCOUNT_KEY isn't set in current env.
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
const SITEMAP_URL = process.env.GSC_SITEMAP || 'https://bighornthreads.com/sitemap-index.xml'

// Normalize the key path — Git Bash exports /c/... style, but Node on Windows needs C:\...
function normalizePath(p) {
  if (!p) return p
  if (process.platform === 'win32') {
    const m = p.match(/^\/([a-zA-Z])\/(.*)$/)
    if (m) return `${m[1].toUpperCase()}:\\${m[2].replace(/\//g, '\\')}`
  }
  return p
}
const KEY_PATH = normalizePath(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)

if (!KEY_PATH) {
  console.error('GOOGLE_SERVICE_ACCOUNT_KEY env var missing (checked current env + ~/.env)')
  process.exit(1)
}

const key = JSON.parse(readFileSync(KEY_PATH, 'utf8'))

function b64url(buf) {
  return Buffer.from(buf).toString('base64url')
}

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000)
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claim = b64url(JSON.stringify({
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
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

async function main() {
  const token = await getAccessToken()
  const site = encodeURIComponent(SITE_URL)
  const sitemap = encodeURIComponent(SITEMAP_URL)

  // 1. Submit sitemap (PUT is idempotent — acts as refresh)
  const submitRes = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${site}/sitemaps/${sitemap}`,
    { method: 'PUT', headers: { Authorization: `Bearer ${token}` } },
  )
  console.log(`[gsc] sitemap submit: ${submitRes.status} ${submitRes.statusText}`)

  // 2. Read back status
  const listRes = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${site}/sitemaps`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  const list = await listRes.json()
  const entry = (list.sitemap || []).find((s) => s.path === SITEMAP_URL)
  if (entry) {
    console.log(`[gsc] sitemap status: submitted=${entry.lastSubmitted} warnings=${entry.warnings} errors=${entry.errors} pending=${entry.isPending}`)
    for (const c of entry.contents || []) {
      console.log(`[gsc]   ${c.type}: submitted=${c.submitted} indexed=${c.indexed}`)
    }
  } else {
    console.warn(`[gsc] sitemap not found in listing after submit`)
  }
}

main().catch((err) => {
  console.error('[gsc] failed:', err)
  process.exit(1)
})
