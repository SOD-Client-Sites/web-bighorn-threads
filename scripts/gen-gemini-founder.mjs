import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

const KEY = process.env.GEMINI_API_KEY
if (!KEY) {
  console.error('GEMINI_API_KEY is missing')
  process.exit(1)
}

const OUT_DIR = resolve('public/images/generated')
const REF_PATH = resolve('src/assets/steve-dodson-ref.jpg')

async function run() {
  console.log('Reading reference image...')
  const refBuf = await readFile(REF_PATH)
  const refBase64 = refBuf.toString('base64')

  const prompt = 'Professional editorial headshot portrait of a confident Las Vegas construction apparel shop founder, mid-50s, confident warm but direct expression. Wearing a navy embroidered polo shirt with a subtle gold logo patch on the chest. Framed from chest up, slight left-quarter angle, looking directly at camera. Shot on 85mm at f/2.8, warm golden-hour directional light from camera-left creating soft shadow on right side of face. Background: softly out-of-focus Las Vegas construction site with desert mountains at sunset, cohesive navy and amber color grade, bokeh. Kodak Portra 400 film look, editorial commercial photography, premium warm and weighty.'

  const payload = {
    contents: [{
      parts: [
        { text: prompt },
        {
          inline_data: {
            mime_type: 'image/jpeg',
            data: refBase64
          }
        }
      ]
    }],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
      candidateCount: 1
    }
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${KEY}`

  console.log('Submitting to Gemini 2.5 Flash Image (nano-banana)...')
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    console.error('API request failed:', response.status, await response.text())
    process.exit(1)
  }

  const result = await response.json()
  const candidates = result.candidates || []
  if (candidates.length === 0) {
    console.error('No candidates in response:', JSON.stringify(result))
    process.exit(1)
  }

  const parts = candidates[0].content.parts
  const imagePart = parts.find(p => p.inlineData || p.inline_data)
  
  if (!imagePart) {
    console.error('No image part in response:', JSON.stringify(parts))
    process.exit(1)
  }

  const imageData = imagePart.inlineData?.data || imagePart.inline_data?.data
  const mimeType = imagePart.inlineData?.mimeType || imagePart.inline_data?.mime_type || 'image/png'
  
  const imgBuf = Buffer.from(imageData, 'base64')
  await mkdir(OUT_DIR, { recursive: true })
  
  const ext = mimeType.split('/')[1] || 'png'
  const outPath = resolve(OUT_DIR, `founder-gemini-v1.${ext}`)
  
  await writeFile(outPath, imgBuf)
  console.log(`Successfully generated image: ${outPath} (${(imgBuf.length / 1024).toFixed(0)} KB)`)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
