// Server-renders page 1 of a catalog category so crawlers see real products,
// not an empty grid. The browser script still re-renders the same grid.
import { onRequestGet as sageSearch } from '../api/sage/search.js'

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)

// Same markup as public/scripts/product-card.js renderProductCard.
export function renderCards(products) {
  return products.map((p) => {
    const name = p.name || p.prName || 'Untitled product'
    const img = p.thumbPic || 'https://placehold.co/600x600/0f172a/c19b3d?text=Bighorn'
    const href = `/product/?id=${encodeURIComponent(p.prodEId)}&slug=${slugify(name)}`
    const price = p.prc ? `<p class="mt-auto font-mono text-sm font-bold text-gold-700">$${esc(p.prc)}</p>` : ''
    const moq = p.minQty > 1 ? `<p class="font-mono text-[10px] text-ash">Min. ${esc(p.minQty)} pcs</p>` : ''
    return `<a href="${esc(href)}" class="group flex flex-col overflow-hidden rounded border border-hairline bg-panel transition-all duration-300 hover:border-gold-500/40 hover:shadow-lg hover:shadow-gold-500/5"><div class="aspect-square w-full overflow-hidden bg-white"><img src="${esc(img)}" alt="${esc(name)}" loading="lazy" decoding="async" class="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"></div><div class="flex flex-1 flex-col gap-2 px-4 py-3"><h3 class="line-clamp-2 font-heading text-sm font-bold leading-snug text-charcoal transition-colors group-hover:text-gold-700">${esc(name)}</h3>${price}${moq}</div></a>`
  }).join('')
}

export async function onRequestGet(context) {
  const res = await context.next()
  const url = new URL(context.request.url)
  const isHtml = (res.headers.get('content-type') || '').includes('text/html')
  // Only the plain first page; searches and later pages stay client-rendered.
  if (!res.ok || !isHtml || url.searchParams.has('q') || url.searchParams.has('page')) return res

  const html = await res.text()
  const cfgMatch = html.match(/<script type="application\/json" id="cat-config">([\s\S]*?)<\/script>/)
  if (!cfgMatch) return new Response(html, res)

  try {
    const cfg = JSON.parse(cfgMatch[1])
    const params = new URLSearchParams({ sort: cfg.sort || 'BESTMATCH', perPage: '24', page: '1', ref: `bh-${cfg.slug}`.slice(0, 15) })
    if (cfg.search?.categories) params.set('categories', cfg.search.categories)
    if (cfg.search?.keywords) params.set('keywords', cfg.search.keywords)
    // Reuses the API handler, including its edge cache.
    const apiRes = await sageSearch({ request: new Request(`${url.origin}/api/sage/search?${params}`), env: context.env })
    const data = await apiRes.json()
    if (!data.ok || !data.products?.length) return new Response(html, res)

    return new HTMLRewriter()
      .on('#products-grid', { element: (e) => e.setInnerContent(renderCards(data.products), { html: true }) })
      .on('#result-meta', { element: (e) => e.setInnerContent(`${Number(data.totalFound).toLocaleString('en-US')} products`) })
      .transform(new Response(html, res))
  } catch (err) {
    console.error('[catalog ssr]', err)
    return new Response(html, res)
  }
}
