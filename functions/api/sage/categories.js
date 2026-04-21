import { resolveAuth, sagePost, jsonResponse, errorResponse } from './_lib.js'

export async function onRequestGet({ env }) {
  try {
    const auth = resolveAuth(env, 'public')
    const data = await sagePost(101, { listType: 'categories' }, auth, 'bighorn-cats')
    return jsonResponse({ ok: true, items: data.items || [] })
  } catch (err) {
    console.error('[sage/categories]', err)
    return errorResponse(err.message || 'fetch failed', 500)
  }
}
