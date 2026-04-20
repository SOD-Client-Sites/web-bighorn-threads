import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
const KEY = process.env.FAL_KEY
const OUT = resolve('public/images/generated')
await mkdir(OUT, { recursive: true })
const refBuf = await readFile(resolve('src/assets/steve-dodson-ref.jpg'))
const dataUrl = `data:image/jpeg;base64,${refBuf.toString('base64')}`

const editPrompt = "Keep the man's face and identity EXACTLY as shown in the reference photo — same facial features, same hair, same skin tone, same age, same expression. Only change his wardrobe: replace his current shirt with a crisp navy-blue embroidered polo shirt with a subtle gold 'Bighorn Threads' ram-horn logo patch on the left chest. Replace the background with a softly out-of-focus Las Vegas construction site at golden hour with desert mountains in the distance. Shot at 85mm f/2.8, warm golden-hour directional light from camera-left, Kodak Portra 400 film look, editorial commercial portrait, premium and confident. Keep the image photorealistic and preserve his likeness perfectly."

const models = [
  {
    id: 'founder-nanobanana',
    endpoint: 'fal-ai/nano-banana/edit',
    body: { prompt: editPrompt, image_urls: [dataUrl], num_images: 1, output_format: 'jpeg' },
  },
  {
    id: 'founder-kontext',
    endpoint: 'fal-ai/flux-pro/kontext',
    body: { prompt: editPrompt, image_url: dataUrl, num_images: 1, guidance_scale: 3.5, output_format: 'jpeg', aspect_ratio: '4:5' },
  },
  {
    id: 'founder-seedream',
    endpoint: 'fal-ai/bytedance/seedream/v4/edit',
    body: { prompt: editPrompt, image_urls: [dataUrl], num_images: 1, image_size: { width: 1024, height: 1280 } },
  },
  {
    id: 'founder-qwen',
    endpoint: 'fal-ai/qwen-image-edit',
    body: { prompt: editPrompt, image_url: dataUrl, num_inference_steps: 30, guidance_scale: 4, output_format: 'jpeg' },
  },
]

async function run(m) {
  console.log(`[${m.id}] submitting to ${m.endpoint}...`)
  const submit = await fetch(`https://queue.fal.run/${m.endpoint}`, {
    method: 'POST',
    headers: { Authorization: `Key ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(m.body),
  })
  if (!submit.ok) {
    throw new Error(`[${m.id}] submit ${submit.status}: ${await submit.text()}`)
  }
  const { status_url, response_url } = await submit.json()
  for (let i = 0; i < 200; i++) {
    await new Promise(r => setTimeout(r, 3000))
    const s = await fetch(status_url, { headers: { Authorization: `Key ${KEY}` } })
    const sj = await s.json()
    if (sj.status === 'COMPLETED') break
    if (sj.status === 'FAILED' || sj.status === 'ERROR') {
      throw new Error(`[${m.id}] ${sj.status}: ${JSON.stringify(sj)}`)
    }
  }
  const r = await fetch(response_url, { headers: { Authorization: `Key ${KEY}` } })
  const rj = await r.json()
  const url = rj.images?.[0]?.url || rj.image?.url || rj.output?.url
  if (!url) throw new Error(`[${m.id}] no url: ${JSON.stringify(rj).slice(0, 500)}`)
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer())
  const out = resolve(OUT, `${m.id}.jpg`)
  await writeFile(out, buf)
  return { id: m.id, out, kb: (buf.length / 1024).toFixed(0) }
}

const results = await Promise.allSettled(models.map(run))
for (const [i, r] of results.entries()) {
  const id = models[i].id
  if (r.status === 'fulfilled') console.log(`  OK ${id} → ${r.value.out} (${r.value.kb} KB)`)
  else console.log(`  FAIL ${id}: ${r.reason.message.slice(0, 300)}`)
}
