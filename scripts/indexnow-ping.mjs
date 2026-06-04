#!/usr/bin/env node
// IndexNow ping — submits all sitemap URLs to Bing/Yandex (IndexNow shares
// submissions across all participating engines, so hitting one propagates).
// Run after every deploy: `node scripts/indexnow-ping.mjs`
//
// Resilient by design: each endpoint is attempted independently with a timeout,
// so a dead aggregator (api.indexnow.org has been ECONNRESET-ing) can't abort
// the run. Exit code is non-zero only if EVERY endpoint failed.
const KEY = 'af9b466356b46d29557e1fe047debd83';
const HOST = 'bighornthreads.com';
const SITEMAP = `https://${HOST}/sitemap-0.xml`;
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

// bing.com first — it's the reliable one and propagates to the shared index.
const ENDPOINTS = [
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
  'https://api.indexnow.org/IndexNow',
];

const sm = await fetch(SITEMAP).then(r => r.text());
const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
console.log(`Pinging IndexNow with ${urls.length} URLs`);

const body = JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: urls });

let anyOk = false;
for (const endpoint of ENDPOINTS) {
  try {
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body,
      signal: AbortSignal.timeout(20000),
    });
    console.log(`${endpoint} → ${r.status} ${r.statusText}`);
    if (r.ok) anyOk = true;
  } catch (e) {
    console.warn(`${endpoint} → FAILED (${e.cause?.code || e.name || e.message})`);
  }
}

if (!anyOk) {
  console.error('All IndexNow endpoints failed.');
  process.exit(1);
}
