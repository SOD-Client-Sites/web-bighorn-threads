import { renderProductCard, renderStatusMessage, clearChildren, el } from './product-card.js'

const grid = document.getElementById('products-grid')
const title = document.getElementById('search-title')
const meta = document.getElementById('result-meta')
const empty = document.getElementById('empty-state')
const pager = document.getElementById('pagination')

runSearch()

function getUrlState() {
  const url = new URL(window.location.href)
  return {
    q: (url.searchParams.get('q') || '').trim(),
    page: Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1),
  }
}

async function runSearch() {
  const { q, page } = getUrlState()
  if (!q) {
    empty.classList.remove('hidden')
    title.textContent = 'Search Products'
    return
  }

  empty.classList.add('hidden')
  clearChildren(grid)
  clearChildren(pager)

  // Update the H1 without innerHTML
  clearChildren(title)
  title.appendChild(document.createTextNode('Results for '))
  const qSpan = el('span', { class: 'text-gold-500', text: `"${q}"` })
  title.appendChild(qSpan)

  meta.textContent = 'Searching…'

  const perPage = 24
  const params = new URLSearchParams({
    q,
    perPage: String(perPage),
    page: String(page),
    sort: 'BESTMATCH',
    ref: 'bighorn-search',
  })

  try {
    const res = await fetch(`/api/sage/search?${params.toString()}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    if (!data.ok) throw new Error(data.error || 'search failed')

    const totalPages = Math.max(1, Math.ceil(data.totalFound / perPage))
    meta.textContent = data.totalFound === 0
      ? `No results for "${q}"`
      : `${data.totalFound.toLocaleString()} results · page ${page} of ${totalPages.toLocaleString()}`

    if (!data.products.length) {
      grid.appendChild(renderStatusMessage(`No matches for "${q}". Try broader keywords.`))
      return
    }

    data.products.forEach((p) => grid.appendChild(renderProductCard(p)))
    renderPagination(page, totalPages, q)
  } catch (err) {
    console.error('[catalog-search]', err)
    meta.textContent = 'Could not complete search.'
    grid.appendChild(renderStatusMessage('Live search is temporarily unavailable. Please refresh.', 'error'))
  }
}

function renderPagination(page, totalPages, q) {
  if (totalPages <= 1) return
  const linkClass = 'rounded-md border border-navy-700 bg-navy-900 px-4 py-2 font-mono text-xs text-gray-200 hover:border-gold-500/40 hover:text-gold-400'
  const currentClass = 'rounded-md border border-gold-500/40 bg-navy-900 px-4 py-2 font-mono text-xs text-gold-400'
  const makeHref = (p) => '?' + new URLSearchParams({ q, page: String(p) })

  if (page > 1) {
    pager.appendChild(el('a', { href: makeHref(page - 1), class: linkClass, text: '← Prev' }))
  }
  pager.appendChild(el('span', { class: currentClass, text: `${page} / ${totalPages}` }))
  if (page < totalPages) {
    pager.appendChild(el('a', { href: makeHref(page + 1), class: linkClass, text: 'Next →' }))
  }
}
