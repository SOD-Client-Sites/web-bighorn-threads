#!/usr/bin/env node
// Generate 14 Bighorn Threads images via fal.ai → public/images/generated/
import { writeFile, mkdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = resolve(__dirname, '..', 'public', 'images', 'generated')
const FAL_KEY = process.env.FAL_KEY
if (!FAL_KEY) throw new Error('FAL_KEY missing from env')

const PROMPTS = [
  { id: 'hero-foreman', model: 'fal-ai/flux-pro/v1.1-ultra', aspect_ratio: '4:5', prompt: 'Cinematic wide shot of a construction foreman wearing a navy embroidered polo shirt and a yellow hard hat, standing on a Las Vegas high-rise construction site at golden hour. Out-of-focus Las Vegas skyline and desert mountains in the background. Warm directional sunlight from the left, deep navy and amber tones, shallow depth of field. Professional editorial photography, Kodak Portra 400 film look, 35mm lens, slightly grainy. Subject centered, framed chest up, confident neutral expression.' },
  { id: 'services-flatlay-bg', model: 'fal-ai/flux-pro/v1.1', image_size: 'landscape_16_9', prompt: 'Overhead flat-lay photograph of folded construction workwear arranged in a grid on dark slate concrete: a navy embroidered polo, a yellow hi-vis safety tee, a charcoal hoodie, a tan canvas work jacket, a branded hard hat, a beanie. Shot from directly above, studio lighting, high contrast shadows, muted earth tones accented with gold and hi-vis yellow, editorial commercial photography.' },
  { id: 'service-screen-printing', model: 'fal-ai/flux-pro/v1.1', image_size: 'square_hd', prompt: 'Close-up macro shot of a silkscreen squeegee pulling navy ink across a fine mesh screen onto a black work t-shirt. A sharp, crisp logo is forming beneath the screen. Industrial screen printing shop environment, warm tungsten lighting, golden hour through dusty windows, shallow depth of field. Highly detailed, professional commercial photography, Hasselblad look.' },
  { id: 'service-embroidery', model: 'fal-ai/flux-pro/v1.1', image_size: 'square_hd', prompt: 'Extreme macro close-up of a commercial embroidery machine stitching a logo onto a navy polo shirt. Gold and white thread visible, needle in motion slightly blurred. Shallow depth of field, warm directional lighting, rich navy fabric texture visible. Professional commercial product photography, clean and premium.' },
  { id: 'service-branded-apparel', model: 'fal-ai/flux-pro/v1.1', image_size: 'square_hd', prompt: 'Studio product photograph of a folded stack of construction workwear on a dark concrete surface: navy embroidered polo on top, yellow ANSI hi-vis t-shirt, charcoal hoodie, tan canvas Carhartt-style work jacket, branded hard hat resting on top. Dramatic side lighting, deep shadows, premium editorial quality, muted earth tones with gold accent.' },
  { id: 'service-company-stores', model: 'fal-ai/flux-pro/v1.1', image_size: 'square_hd', prompt: 'A modern laptop sitting on a rugged wooden workbench in a construction office, screen displaying a clean branded employee apparel portal interface with product thumbnails (polos, hi-vis shirts, jackets). A yellow hard hat, blueprints, and a coffee mug rest on the bench beside it. Warm natural window light from the side, shallow depth of field, cinematic color grade with navy and gold tones.' },
  { id: 'company-stores-hero', model: 'fal-ai/flux-pro/v1.1-ultra', aspect_ratio: '16:9', prompt: 'Split scene concept: left side shows a construction worker in a navy embroidered polo using a smartphone to place an order on a branded apparel portal. Right side shows packaged branded workwear being delivered to a construction office. Modern editorial commercial photography, cohesive navy and gold color palette, warm natural lighting, shallow depth of field.' },
  { id: 'kit-gc', model: 'fal-ai/flux-pro/v1.1', aspect_ratio: '4:5', prompt: 'Flat-lay photograph on dark concrete of a complete general contractor crew uniform kit: navy embroidered polo shirt with embroidered logo, yellow ANSI hi-vis tee, branded yellow hard hat, work gloves, notebook, and safety glasses. Shot from directly above, dramatic side lighting, premium editorial commercial photography, warm earth tones with gold accents.' },
  { id: 'kit-electrical', model: 'fal-ai/flux-pro/v1.1', aspect_ratio: '4:5', prompt: 'Flat-lay photograph on dark slate surface of a full electrician team uniform kit: navy FR-rated button-up work shirt with embroidered patches, charcoal embroidered softshell jacket, black beanie with embroidered logo, insulated work gloves, voltage tester. Top-down view, studio lighting with deep shadows, premium commercial editorial look, muted tones.' },
  { id: 'kit-plumbing-hvac', model: 'fal-ai/flux-pro/v1.1', aspect_ratio: '4:5', prompt: 'Flat-lay top-down photograph on dark wood of a plumbing and HVAC service team uniform kit: navy embroidered service polo, matching navy work jacket with embroidered logo, branded ball cap, utility belt, a pipe wrench, clipboard. Warm dramatic lighting, premium editorial commercial photography, navy and steel tones with gold accents.' },
  { id: 'kit-roofing', model: 'fal-ai/flux-pro/v1.1', aspect_ratio: '4:5', prompt: 'Flat-lay photograph on weathered wood planks of a roofing crew uniform kit: yellow ANSI hi-vis t-shirt with screen-printed logo, bucket hat with embroidered logo, embroidered charcoal hoodie, leather work gloves, hammer. Overhead view, warm directional lighting, premium commercial editorial photography, earth tones with yellow hi-vis accent.' },
  { id: 'kit-landscaping', model: 'fal-ai/flux-pro/v1.1', aspect_ratio: '4:5', prompt: 'Flat-lay photograph on dark earth-toned surface of a landscaping crew uniform kit: moisture-wicking green performance t-shirt with screen-printed logo, tan embroidered trucker cap, olive embroidered quarter-zip pullover, pruning shears, work gloves. Top-down view, warm golden hour lighting, premium editorial commercial photography, earth and olive tones.' },
  { id: 'kit-office-sales', model: 'fal-ai/flux-pro/v1.1', aspect_ratio: '4:5', prompt: 'Flat-lay photograph on clean dark concrete of a professional office and sales team uniform kit: crisp white embroidered polo shirt, navy embroidered quarter-zip pullover, charcoal embroidered softshell jacket, leather portfolio, pen. Top-down view, soft directional studio lighting, premium editorial commercial photography, clean navy-and-white palette with gold accents.' },
  { id: 'cta-bluehour', model: 'fal-ai/flux-pro/v1.1-ultra', aspect_ratio: '16:9', prompt: 'Wide establishing shot of a Las Vegas construction site at blue hour. Silhouetted construction crew in branded hi-vis and hard hats standing together reviewing plans, Las Vegas skyline and desert mountains backdrop, dramatic cinematic lighting with deep navy sky and warm tungsten worksite lights. Professional editorial photography, shallow depth of field, cohesive navy and gold color palette. Dark and atmospheric for text overlay.' },
]

async function generate(p) {
  const body = { prompt: p.prompt, num_inference_steps: 28, guidance_scale: 3.5, enable_safety_checker: true }
  if (p.aspect_ratio) body.aspect_ratio = p.aspect_ratio
  else if (p.image_size) body.image_size = p.image_size
  const submit = await fetch(`https://queue.fal.run/${p.model}`, {
    method: 'POST',
    headers: { Authorization: `Key ${FAL_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!submit.ok) throw new Error(`[${p.id}] submit ${submit.status}: ${await submit.text()}`)
  const { status_url: statusUrl, response_url: resultUrl } = await submit.json()
  if (!statusUrl || !resultUrl) throw new Error(`[${p.id}] missing urls in submit response`)
  for (let i = 0; i < 120; i++) {
    await new Promise((r) => setTimeout(r, 3000))
    const s = await fetch(statusUrl, { headers: { Authorization: `Key ${FAL_KEY}` } })
    const sj = await s.json()
    if (sj.status === 'COMPLETED') break
    if (sj.status === 'FAILED' || sj.status === 'ERROR') {
      throw new Error(`[${p.id}] ${sj.status}: ${JSON.stringify(sj)}`)
    }
  }
  const r = await fetch(resultUrl, { headers: { Authorization: `Key ${FAL_KEY}` } })
  const rj = await r.json()
  const url = rj.images?.[0]?.url
  if (!url) throw new Error(`[${p.id}] no url: ${JSON.stringify(rj).slice(0, 400)}`)
  const img = await fetch(url)
  const buf = Buffer.from(await img.arrayBuffer())
  const ext = (url.split('.').pop() || 'jpg').split('?')[0]
  const outPath = resolve(OUT_DIR, `${p.id}.${ext}`)
  await writeFile(outPath, buf)
  return { id: p.id, path: outPath, bytes: buf.length }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  console.log(`Generating ${PROMPTS.length} images...`)
  const results = await Promise.allSettled(PROMPTS.map(generate))
  let ok = 0, fail = 0
  for (const [i, r] of results.entries()) {
    const id = PROMPTS[i].id
    if (r.status === 'fulfilled') {
      ok++
      console.log(`  OK  ${id}  →  ${r.value.path}  (${(r.value.bytes / 1024).toFixed(0)} KB)`)
    } else {
      fail++
      console.log(`  FAIL ${id}: ${r.reason.message}`)
    }
  }
  console.log(`\nDone. ${ok} ok, ${fail} failed.`)
}

main().catch((e) => { console.error(e); process.exit(1) })
