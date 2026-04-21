import { renderProductCard, renderStatusMessage, clearChildren, el } from './product-card.js'

const cfgEl = document.getElementById('cat-config')
const cfg = cfgEl ? JSON.parse(cfgEl.textContent) : null
if (cfg) loadCategoryPage()

function getUrlState() {
  const url = new URL(window.location.href)
  return {
    q: (url.searchParams.get('q') || '').trim(),
    page: Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1),
  }
}

async function loadCategoryPage() {
  const grid = document.getElementById('products-grid')
  const meta = document.getElementById('result-meta')
  const pageMeta = document.getElementById('pagination-meta')
  const pager = document.getElementById('pagination')
  if (!grid || !meta || !pageMeta || !pager) return

  const { q, page } = getUrlState()
  const perPage = 24

  const params = new URLSearchParams()
  if (cfg.search.categories) params.set('categories', cfg.search.categories)
  const keywords = [cfg.search.keywords, q].filter(Boolean).join(' ').trim()
  if (keywords) params.set('keywords', keywords)
  params.set('sort', cfg.sort || 'BESTMATCH')
  params.set('perPage', String(perPage))
  params.set('page', String(page))
  params.set('ref', `bh-${cfg.slug}`.slice(0, 15))

  try {
    const res = await fetch(`/api/sage/search?${params.toString()}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    if (!data.ok) throw new Error(data.error || 'search failed')

    const totalPages = Math.max(1, Math.ceil(data.totalFound / perPage))
    meta.textContent = data.totalFound === 0
      ? 'No matches found.'
      : `${data.totalFound.toLocaleString()} products${q ? ` matching "${q}"` : ''}`
    pageMeta.textContent = totalPages > 1 ? `Page ${page} of ${totalPages.toLocaleString()}` : ''

    clearChildren(grid)
    clearChildren(pager)

    if (!data.products.length) {
      grid.appendChild(buildEmptyState())
      return
    }

    data.products.forEach((p) => grid.appendChild(renderProductCard(p)))
    renderPagination(pager, page, totalPages, q)
  } catch (err) {
    console.error('[catalog-category]', err)
    meta.textContent = 'Could not load products.'
    clearChildren(grid)
    grid.appendChild(renderStatusMessage('Live catalog is temporarily unavailable. Please refresh or contact us.', 'error'))
  }
}

function buildEmptyState() {
  const wrap = el('div', { class: 'col-span-full rounded-xl border border-navy-800/60 bg-navy-900/40 p-10 text-center' })
  wrap.appendChild(el('p', { class: 'font-heading text-lg text-white', text: 'Nothing matched that search.' }))
  wrap.appendChild(el('p', { class: 'mt-2 text-sm text-gray-400', text: 'Try broader keywords, or browse another category.' }))
  wrap.appendChild(el('a', {
    href: '/catalog/',
    class: 'mt-5 inline-block font-mono text-xs font-bold uppercase tracking-[0.2em] text-gold-500 hover:text-gold-400',
    text: '← All Categories',
  }))
  return wrap
}

function renderPagination(pager, page, totalPages, q) {
  if (totalPages <= 1) return
  const linkClass = 'rounded-md border border-navy-700 bg-navy-900 px-4 py-2 font-mono text-xs text-gray-200 hover:border-gold-500/40 hover:text-gold-400'
  const currentClass = 'rounded-md border border-gold-500/40 bg-navy-900 px-4 py-2 font-mono text-xs text-gold-400'
  const makeHref = (p) => '?' + new URLSearchParams({ ...(q && { q }), page: String(p) })

  if (page > 1) {
    pager.appendChild(el('a', { href: makeHref(page - 1), class: linkClass, text: '← Prev' }))
  }
  pager.appendChild(el('span', { class: currentClass, text: `${page} / ${totalPages}` }))
  if (page < totalPages) {
    pager.appendChild(el('a', { href: makeHref(page + 1), class: linkClass, text: 'Next →' }))
  }
}
