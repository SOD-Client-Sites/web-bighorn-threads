import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
const KEY = process.env.FAL_KEY
const OUT = resolve('public/images/generated')
await mkdir(OUT, { recursive: true })
const refBuf = await readFile(resolve('src/assets/steve-dodson-ref.jpg'))
const dataUrl = `data:image/jpeg;base64,${refBuf.toString('base64')}`
const prompt = "Keep the man's face and identity EXACTLY as shown in the reference photo — same facial features, same hair, same skin tone, same age, same expression. Only change his wardrobe: replace his current shirt with a crisp navy-blue embroidered polo shirt with a subtle gold 'Bighorn Threads' ram-horn logo patch on the left chest. Replace the background with a softly out-of-focus Las Vegas construction site at golden hour with desert mountains in the distance. Shot at 85mm f/2.8, warm golden-hour directional light from camera-left, Kodak Portra 400 film look, editorial commercial portrait."
const submit = await fetch('https://queue.fal.run/fal-ai/flux-pro/kontext', {
  method: 'POST',
  headers: { Authorization: `Key ${KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt, image_url: dataUrl, num_images: 1, guidance_scale: 3.5, output_format: 'jpeg', aspect_ratio: '3:4' }),
})
if (!submit.ok) { console.error('submit:', submit.status, await submit.text()); process.exit(1) }
const { status_url, response_url } = await submit.json()
for (let i = 0; i < 120; i++) {
  await new Promise(r => setTimeout(r, 3000))
  const sj = await (await fetch(status_url, { headers: { Authorization: `Key ${KEY}` } })).json()
  if (sj.status === 'COMPLETED') break
  if (sj.status === 'FAILED' || sj.status === 'ERROR') { console.error(sj); process.exit(1) }
}
const rj = await (await fetch(response_url, { headers: { Authorization: `Key ${KEY}` } })).json()
const url = rj.images?.[0]?.url
if (!url) { console.error('no url:', JSON.stringify(rj).slice(0, 500)); process.exit(1) }
const buf = Buffer.from(await (await fetch(url)).arrayBuffer())
const out = resolve(OUT, 'founder-kontext.jpg')
await writeFile(out, buf)
console.log(`OK → ${out} (${(buf.length/1024).toFixed(0)} KB)`)
