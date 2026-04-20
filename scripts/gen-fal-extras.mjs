import { writeFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
const OUT = resolve('public/images/generated')
const KEY = process.env.FAL_KEY
const PROMPTS = [
  { id: 'kit-concrete', model: 'fal-ai/flux-pro/v1.1', aspect_ratio: '4:5', prompt: 'Flat-lay top-down photograph on dark raw concrete surface of a commercial concrete and masonry crew kit: ANSI hi-vis safety tee, heavy-duty embroidered work jacket, branded white hard hat, concrete trowel, rubber work gloves, steel-toe boot, tape measure, knee pads. Warm dramatic side lighting, premium editorial commercial photography, gray concrete and amber-gold tones with yellow hi-vis accent.' },
  { id: 'kit-steel', model: 'fal-ai/flux-pro/v1.1', aspect_ratio: '4:5', prompt: 'Flat-lay overhead photograph on brushed steel plate surface of an ironworker and structural steel crew kit: embroidered navy long-sleeve FR work shirt, heavy leather welding gloves, branded hard hat with chin strap, welding helmet lens, tie-off harness webbing, spud wrench, bolt bag. Dramatic high-contrast studio lighting, premium editorial commercial photography, moody industrial steel-blue and gold tones.' },
  { id: 'kit-datacenter', model: 'fal-ai/flux-pro/v1.1', aspect_ratio: '4:5', prompt: 'Flat-lay top-down photograph on clean dark matte surface of a data center and mission-critical contractor kit: embroidered navy FR-rated NFPA 70E button-up work shirt, charcoal embroidered softshell jacket, hard hat with chin strap and branded decal, LAN network cable tester, fiber patch cables coiled, bolt cutters, CR2032 tools, safety glasses, arc-rated gloves. Cool blue and amber lighting suggesting a server room environment, premium editorial commercial photography, navy and steel tones with gold accents.' },
]
async function gen(p) {
  const body = { prompt: p.prompt, num_inference_steps: 28, guidance_scale: 3.5, enable_safety_checker: true, aspect_ratio: p.aspect_ratio }
  const submit = await fetch(`https://queue.fal.run/${p.model}`, { method: 'POST', headers: { Authorization: `Key ${KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  if (!submit.ok) throw new Error(`[${p.id}] submit ${submit.status}: ${await submit.text()}`)
  const { status_url, response_url } = await submit.json()
  for (let i = 0; i < 120; i++) {
    await new Promise(r => setTimeout(r, 3000))
    const sj = await (await fetch(status_url, { headers: { Authorization: `Key ${KEY}` } })).json()
    if (sj.status === 'COMPLETED') break
    if (sj.status === 'FAILED' || sj.status === 'ERROR') throw new Error(`[${p.id}] ${sj.status}`)
  }
  const rj = await (await fetch(response_url, { headers: { Authorization: `Key ${KEY}` } })).json()
  const url = rj.images?.[0]?.url
  if (!url) throw new Error(`[${p.id}] no url`)
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer())
  const out = resolve(OUT, `${p.id}.jpg`)
  await writeFile(out, buf)
  return { id: p.id, out, kb: (buf.length/1024).toFixed(0) }
}
await mkdir(OUT, { recursive: true })
const res = await Promise.allSettled(PROMPTS.map(gen))
for (const [i,r] of res.entries()) {
  const id = PROMPTS[i].id
  if (r.status === 'fulfilled') console.log(`  OK ${id} → ${r.value.out} (${r.value.kb} KB)`)
  else console.log(`  FAIL ${id}: ${r.reason.message}`)
}
