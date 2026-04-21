import { resolveAuth, sagePost, publicizeProduct, jsonResponse, errorResponse } from './_lib.js'

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url)
  const id = (url.searchParams.get('id') || '').trim()

  if (!id) return errorResponse('missing id', 400)

  try {
    const auth = resolveAuth(env, 'public')
    const data = await sagePost(
      104,
      { prodEId: id, applyPsPriceAdjustments: true },
      auth,
      'bighorn-pdp',
    )
    if (!data.product) return errorResponse('not found', 404)
    return jsonResponse({ ok: true, product: publicizeProduct(data.product) })
  } catch (err) {
    console.error('[sage/product]', err)
    return errorResponse(err.message || 'fetch failed', 500)
  }
}
