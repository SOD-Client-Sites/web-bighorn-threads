import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
const KEY = process.env.FAL_KEY
const OUT = resolve('public/images/generated')
const REF_BUF = await readFile(resolve('src/assets/steve-dodson-ref.jpg'))
const REF_URL = `data:image/jpeg;base64,${REF_BUF.toString('base64')}`
const prompt = 'Professional editorial headshot portrait of a confident Las Vegas construction apparel shop founder, mid-50s, confident warm but direct expression. Wearing a navy embroidered polo shirt with a subtle gold logo patch on the chest. Framed from chest up, slight left-quarter angle, looking directly at camera. Shot on 85mm at f/2.8, warm golden-hour directional light from camera-left creating soft shadow on right side of face. Background: softly out-of-focus Las Vegas construction site with desert mountains at sunset, cohesive navy and amber color grade, bokeh. Kodak Portra 400 film look, editorial commercial photography, premium warm and weighty.'
const negative = 'cartoon, illustration, 3d render, plastic skin, over-smooth, blurry, low detail, watermark, text, caricature, deformed'
console.log('Submitting to fal-ai/flux-pulid with uploaded reference URL...')
const submit = await fetch('https://queue.fal.run/fal-ai/flux-pulid', {
  method: 'POST',
  headers: { Authorization: `Key ${KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt,
    reference_image_url: REF_URL,
    num_inference_steps: 28,
    guidance_scale: 4,
    true_cfg: 1,
    id_weight: 1,
    negative_prompt: negative,
    image_size: 'portrait_4_3',
    num_images: 2,
    enable_safety_checker: true,
  }),
})
if (!submit.ok) { console.error('submit failed:', submit.status, await submit.text()); process.exit(1) }
const { status_url, response_url, request_id } = await submit.json()
console.log('request_id:', request_id)
let last = ''
for (let i = 0; i < 200; i++) {
  await new Promise(r => setTimeout(r, 3000))
  const sj = await (await fetch(status_url, { headers: { Authorization: `Key ${KEY}` } })).json()
  if (sj.status !== last) { console.log(`[${i*3}s]`, sj.status); last = sj.status }
  if (sj.status === 'COMPLETED') break
  if (sj.status === 'FAILED' || sj.status === 'ERROR') { console.error('FAILED:', JSON.stringify(sj, null, 2)); process.exit(1) }
}
const rj = await (await fetch(response_url, { headers: { Authorization: `Key ${KEY}` } })).json()
await mkdir(OUT, { recursive: true })
const imgs = rj.images || []
if (imgs.length === 0) { console.error('No images in response:', JSON.stringify(rj).slice(0, 500)); process.exit(1) }
for (const [i, img] of imgs.entries()) {
  const buf = Buffer.from(await (await fetch(img.url)).arrayBuffer())
  const out = resolve(OUT, `founder-steve-v${i+1}.jpg`)
  await writeFile(out, buf)
  console.log(`  OK v${i+1} → ${out} (${(buf.length/1024).toFixed(0)} KB)`)
}
