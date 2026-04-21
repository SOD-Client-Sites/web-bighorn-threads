import { resolveAuth, sagePost, publicizeProduct, jsonResponse, errorResponse } from './_lib.js'

const DEFAULT_PER_PAGE = 24
const MAX_PER_PAGE = 48

// Bighorn audience = construction/trades. Cap free-text search to apparel +
// jobsite-relevant categories so the SAGE 1.7M-product firehose doesn't return
// fidget spinners, novelty pens, etc. Per-category browse pages override this
// via their own `categories` param. Names verified against SAGE Module 101 list.
const BIGHORN_DEFAULT_CATEGORIES = [
  'Shirts', 'Hoodies', 'Sweaters', 'Sweats', 'Pants', 'Shorts',
  'Jackets', 'Coats', 'Vests', 'Uniforms',
  'Caps', 'Hats', 'Beanies', 'Hard Hats',
  'Bags', 'Backpacks',
  'Bottles', 'Mugs', 'Tumblers',
  'Gloves',
].join(',')

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
  if (categories) {
    searchParams.categories = categories
  } else if (q) {
    searchParams.categories = BIGHORN_DEFAULT_CATEGORIES
  }
  if (keywords) {
    searchParams.keywords = keywords
    if (q && !searchParams.quickSearch) searchParams.quickSearch = q
  }

  // Build a stable cache key from the normalized search params
  const cacheUrl = new URL(request.url)
  cacheUrl.pathname = '/cache/sage/search'
  cacheUrl.search = new URLSearchParams({
    q: searchParams.quickSearch || '',
    cat: categories,
    sort,
    pp: perPage,
    pg: page,
  }).toString()
  const cacheKey = new Request(cacheUrl.toString(), { method: 'GET' })
  const cache = caches.default

  const cached = await cache.match(cacheKey)
  if (cached) return cached

  try {
    const auth = resolveAuth(env, 'public')
    const data = await sagePost(103, { search: searchParams }, auth, ref)

    // Free-text searches: 2 min. Category-only browsing: 5 min.
    const maxAge = q ? 120 : 300
    const response = new Response(
      JSON.stringify({
        ok: true,
        totalFound: data.totalFound || 0,
        page,
        perPage,
        products: (data.products || []).map(publicizeProduct),
      }),
      {
        status: 200,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': `public, max-age=${maxAge}, s-maxage=300`,
        },
      },
    )

    await cache.put(cacheKey, response.clone())
    return response
  } catch (err) {
    console.error('[sage/search]', err)
    return errorResponse(err.message || 'search failed', 500)
  }
}
