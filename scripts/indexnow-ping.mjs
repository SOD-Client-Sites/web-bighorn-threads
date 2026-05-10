#!/usr/bin/env node
// IndexNow ping — submits all sitemap URLs to Bing/Yandex/Naver/Seznam.
// Run after every deploy: `node scripts/indexnow-ping.mjs`
const KEY = 'af9b466356b46d29557e1fe047debd83';
const HOST = 'bighornthreads.com';
const SITEMAP = `https://${HOST}/sitemap-0.xml`;
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const sm = await fetch(SITEMAP).then(r => r.text());
const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
console.log(`Pinging IndexNow with ${urls.length} URLs`);

const body = { host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: urls };

for (const endpoint of ['https://api.indexnow.org/IndexNow', 'https://www.bing.com/indexnow']) {
  const r = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body)
  });
  console.log(`${endpoint} → ${r.status}`);
}
