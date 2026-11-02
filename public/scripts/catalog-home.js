import { renderProductCard, renderStatusMessage, clearChildren } from './product-card.js'

const grid = document.getElementById('featured-grid')
if (grid) loadFeatured()

async function loadFeatured() {
  try {
    // One search per category: the API treats multiple keywords as all-must-match.
    const results = await Promise.all(['safety vest', 'work shirt', 'polo', 'trucker cap'].map(async (q) => {
      const res = await fetch(`/api/sage/search?q=${encodeURIComponent(q)}&perPage=3&ref=bighorn-featured`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return (await res.json()).products || []
    }))
    const data = { products: results.flat() }
    clearChildren(grid)
    if (data.products.length === 0) {
      grid.appendChild(renderStatusMessage('No featured products available right now.'))
      return
    }
    data.products.forEach((p) => grid.appendChild(renderProductCard(p)))
  } catch (err) {
    console.error('[catalog-home] featured load failed:', err)
    clearChildren(grid)
    grid.appendChild(renderStatusMessage('Could not load featured products. Please refresh.'))
  }
}
