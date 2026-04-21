import { resolveAuth, sagePost, publicizeProduct, jsonResponse, errorResponse } from './_lib.js'

const DEFAULT_PER_PAGE = 24
const MAX_PER_PAGE = 48

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url)
  const q = (url.searchParams.get('q') || '').trim()
  const categories = (url.searchParams.get('categories') || '').trim()
  const keywords = (url.searchParams.get('keywords') || '').trim()
  const sort = (url.searchParams.get('sort') || 'BESTMATCH').toUpperCase()
  const perPage = Math.min(MAX_PER_PAGE, Math.max(1, parseInt(url.searchParams.get('perPage') || String(DEFAULT_PER_PAGE), 10)))
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
  const startNum = (page - 1) * perPage + 1
  const ref = (url.searchParams.get('ref') || 'bighorn-search').slice(0, 15)

  const searchParams = {
    endBuyerSearch: true,
    endUserOnly: true,
    hideOldPricing: true,
    applyPsPriceAdjustments: true,
    thumbPicRes: 300,
    maxRecs: perPage,
    startNum,
    sort,
  }

  if (q) searchParams.quickSearch = q
  if (categories) searchParams.categories = categories
  if (keywords) {
    searchParams.keywords = keywords
    if (q && !searchParams.quickSearch) searchParams.quickSearch = q
  }

  try {
    const auth = resolveAuth(env, 'public')
    const data = await sagePost(103, { search: searchParams }, auth, ref)
    return jsonResponse({
      ok: true,
      totalFound: data.totalFound || 0,
      page,
      perPage,
      products: (data.products || []).map(publicizeProduct),
    })
  } catch (err) {
    console.error('[sage/search]', err)
    return errorResponse(err.message || 'search failed', 500)
  }
}
