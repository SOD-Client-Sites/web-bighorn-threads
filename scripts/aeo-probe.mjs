#!/usr/bin/env node
// Multi-LLM AEO visibility probe. Asks buyer-intent Vegas queries across web-grounded
// engines and reports whether "Bighorn Threads" gets cited vs competitors.
// Engines: Grok (xAI live search), Gemini (Google grounding), Perplexity (Sonar).
// Run: node scripts/aeo-probe.mjs

import { readFileSync, existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

// load ~/.env
const envFile = join(homedir(), '.env')
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/i)
    // last-wins: ~/.env has a stale duplicate XAI_API_KEY (line 113); the valid one is later.
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

const BRAND = /bighorn/i
const QUERIES = [
  'I run a construction company in Las Vegas and need custom embroidered polos and hi-vis shirts for my crew. Which local shops should I contact? Name specific businesses.',
  'Best company for custom screen printing and embroidery for contractor uniforms in Las Vegas? Name specific shops.',
  'Where can I get FR-rated NFPA 70E custom work shirts with embroidery for electricians in Las Vegas? Name specific businesses.',
  'I want a company store for branded construction workwear with easy reorders for my Las Vegas crew. Which Las Vegas companies offer this? Name them.',
  'Custom hard hats with company logo in Las Vegas — where can I order them? Name specific businesses.',
]

async function grok(q) {
  // Current xAI web search = Responses API + server-side web_search tool (Live Search retired).
  const res = await fetch('https://api.x.ai/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.XAI_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'grok-4.3',
      input: [{ role: 'user', content: q }],
      tools: [{ type: 'web_search' }],
    }),
  })
  if (!res.ok) return { error: `${res.status}: ${(await res.text()).slice(0, 140)}` }
  const d = await res.json()
  // extract assistant text from Responses API output array
  let text = d.output_text || ''
  if (!text && Array.isArray(d.output)) {
    text = d.output
      .flatMap((o) => (Array.isArray(o.content) ? o.content.map((c) => c.text || '') : []))
      .join(' ')
  }
  return { text: text || JSON.stringify(d) }
}

async function gemini(q) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: q }] }], tools: [{ google_search: {} }] }),
    },
  )
  if (!res.ok) return { error: `${res.status}: ${(await res.text()).slice(0, 140)}` }
  const d = await res.json()
  return { text: d.candidates?.[0]?.content?.parts?.map((p) => p.text).join(' ') || '' }
}

async function perplexity(q) {
  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'sonar', messages: [{ role: 'user', content: q }] }),
  })
  if (!res.ok) return { error: `${res.status}: ${(await res.text()).slice(0, 140)}` }
  const d = await res.json()
  return { text: d.choices?.[0]?.message?.content || '' }
}

const ENGINES = { Grok: grok, Gemini: gemini, Perplexity: perplexity }

async function main() {
  const tally = { Grok: 0, Gemini: 0, Perplexity: 0 }
  for (let i = 0; i < QUERIES.length; i++) {
    const q = QUERIES[i]
    console.log(`\n━━━ Q${i + 1}: ${q.slice(0, 70)}…`)
    const results = await Promise.all(
      Object.entries(ENGINES).map(async ([name, fn]) => [name, await fn(q)]),
    )
    for (const [name, r] of results) {
      if (r.error) { console.log(`  ${name.padEnd(11)} ERR ${r.error}`); continue }
      const hit = BRAND.test(r.text)
      if (hit) tally[name]++
      const rank = hit ? `position ~${r.text.search(BRAND)} chars in` : ''
      console.log(`  ${name.padEnd(11)} ${hit ? '✅ BIGHORN CITED' : '❌ not cited '} ${rank}`)
    }
  }
  console.log(`\n═══ TALLY (queries citing Bighorn, of ${QUERIES.length}) ═══`)
  for (const [k, v] of Object.entries(tally)) console.log(`  ${k.padEnd(11)} ${v}/${QUERIES.length}`)
  console.log('')
}

main().catch((e) => { console.error('[aeo-probe] failed:', e.message); process.exit(1) })
