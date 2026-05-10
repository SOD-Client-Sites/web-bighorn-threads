#!/usr/bin/env node
// Daily ranking pulse for bighornthreads.com.
// Read-only — pulls GSC + Bing stats, appends one line to ranking-log.md.
// Run via Windows Task Scheduler at 8am daily.
//
// No external deps — uses native fetch + node:crypto for SA JWT signing.

import { readFileSync, existsSync, appendFileSync, writeFileSync } from 'node:fs';
import { createSign } from 'node:crypto';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import nodemailer from 'nodemailer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOG = join(__dirname, '..', 'ranking-log.md');
const SA_KEY_PATH = 'C:/dev/tools/seo-aeo-agent/seo-agent-key.json';
const ENV_PATH = join(homedir(), '.env');
const SITE = 'bighornthreads.com';

function loadEnvVar(name) {
  for (const line of readFileSync(ENV_PATH, 'utf8').split('\n')) {
    if (line.startsWith(`${name}=`)) return line.slice(name.length + 1).trim();
  }
  return null;
}

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function getGoogleAccessToken() {
  const sa = JSON.parse(readFileSync(SA_KEY_PATH, 'utf8'));
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${claims}`);
  const sig = b64url(signer.sign(sa.private_key));
  const jwt = `${header}.${claims}.${sig}`;

  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  if (!r.ok) throw new Error(`Token exchange failed: ${r.status} ${await r.text()}`);
  return (await r.json()).access_token;
}

async function gscQuery(token, startDate, endDate, dimensions = [], rowLimit = 10) {
  const r = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent('sc-domain:' + SITE)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate, dimensions, rowLimit }),
    }
  );
  if (!r.ok) throw new Error(`GSC query failed: ${r.status} ${await r.text()}`);
  return (await r.json()).rows || [];
}

function dateNDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

async function bingStats() {
  const key = loadEnvVar('BING_WEBMASTER_API_KEY');
  const r = await fetch(
    `https://ssl.bing.com/webmaster/api.svc/json/GetRankAndTrafficStats?siteUrl=https://${SITE}/&apikey=${key}`,
    { headers: { 'User-Agent': 'Mozilla/5.0' } }
  );
  if (!r.ok) throw new Error(`Bing query failed: ${r.status}`);
  const rows = (await r.json()).d || [];
  if (!rows.length) return { clicks: 0, impressions: 0 };
  const latest = rows[rows.length - 1];
  return { clicks: latest.Clicks, impressions: latest.Impressions };
}

const today = new Date().toISOString().slice(0, 10);
const yday = dateNDaysAgo(1);
const sevenAgo = dateNDaysAgo(7);

let line, emailBody;
try {
  const token = await getGoogleAccessToken();
  const gYdayRows = await gscQuery(token, yday, yday, []);
  const g7dRows = await gscQuery(token, sevenAgo, yday, []);
  const topPages = await gscQuery(token, sevenAgo, yday, ['page'], 5);
  const topQueries = await gscQuery(token, sevenAgo, yday, ['query'], 5);

  const gYday = gYdayRows[0] || { clicks: 0, impressions: 0, position: 0 };
  const g7d = g7dRows[0] || { clicks: 0, impressions: 0, position: 0 };
  const avg = g7d.impressions ? (g7d.impressions / 7).toFixed(1) : '0.0';
  const b = await bingStats();

  line = `- ${today} | Google: ${String(gYday.impressions).padStart(3)} imp / ${gYday.clicks} clk / pos ${(gYday.position || 0).toFixed(1)}  (7d avg imp/day: ${avg})  | Bing: ${b.impressions} imp / ${b.clicks} clk\n`;

  const fmtPage = (p) => p.replace('https://bighornthreads.com', '').slice(0, 55).padEnd(55);
  const pagesBlock = topPages.length
    ? topPages.map(r => `  ${fmtPage(r.keys[0])}  imp ${String(r.impressions).padStart(4)}  clk ${String(r.clicks).padStart(3)}  pos ${r.position.toFixed(1)}`).join('\n')
    : '  (no page data — too few impressions to surface)';
  const queriesBlock = topQueries.length
    ? topQueries.map(r => `  ${r.keys[0].slice(0, 50).padEnd(50)}  imp ${String(r.impressions).padStart(4)}  clk ${String(r.clicks).padStart(3)}  pos ${r.position.toFixed(1)}`).join('\n')
    : '  (no query data — Google anonymizes queries below volume threshold)';

  emailBody = [
    `Bighorn Threads — Daily Ranking Pulse`,
    `Date: ${today}`,
    ``,
    `=== YESTERDAY (${yday}) ===`,
    `Google:  ${gYday.impressions} impressions / ${gYday.clicks} clicks / avg position ${(gYday.position || 0).toFixed(1)}`,
    `Bing:    ${b.impressions} impressions / ${b.clicks} clicks (latest reported day)`,
    ``,
    `=== LAST 7 DAYS (${sevenAgo} → ${yday}) ===`,
    `Google:  ${g7d.impressions} impressions / ${g7d.clicks} clicks / avg position ${(g7d.position || 0).toFixed(1)}`,
    `Daily impression avg: ${avg}`,
    ``,
    `=== TOP 5 PAGES (Google, last 7d) ===`,
    pagesBlock,
    ``,
    `=== TOP 5 QUERIES (Google, last 7d) ===`,
    queriesBlock,
    ``,
    `---`,
    `Site: https://bighornthreads.com`,
    `Full log: C:\\dev\\clients\\bighorn-threads\\site-marketing\\ranking-log.md`,
  ].join('\n');
} catch (e) {
  line = `- ${today} | ERROR: ${e.message}\n`;
  emailBody = `Bighorn ranking pulse FAILED on ${today}\n\n${e.message}\n\n${e.stack || ''}`;
}

if (!existsSync(LOG)) {
  writeFileSync(LOG, '# Bighorn Threads — Daily Ranking Pulse\n\nOne line per day. Generated by `scripts/daily-ranking-pulse.mjs`.\n\n');
}
appendFileSync(LOG, line);
process.stdout.write(line);

// Email the day's pulse
try {
  const gmailUser = loadEnvVar('GMAIL_USER');
  const gmailPass = loadEnvVar('GMAIL_APP_PASSWORD');
  const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: gmailUser, pass: gmailPass },
  });
  await transport.sendMail({
    from: `"Bighorn Pulse" <${gmailUser}>`,
    to: 'charles@salesondemand.io',
    subject: `Bighorn ranking pulse — ${today}`,
    text: emailBody,
  });
  process.stdout.write('  → emailed\n');
} catch (e) {
  process.stdout.write(`  → email failed: ${e.message}\n`);
}
