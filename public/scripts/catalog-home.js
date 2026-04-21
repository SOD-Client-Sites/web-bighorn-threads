import { renderProductCard, renderStatusMessage, clearChildren } from './product-card.js'

const grid = document.getElementById('featured-grid')
if (grid) loadFeatured()

async function loadFeatured() {
  try {
    const res = await fetch('/api/sage/search?keywords=hi-vis%20polo%20jacket%20tumbler%20hat&sort=POPULARITY&perPage=12&ref=bighorn-home')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    clearChildren(grid)
    if (!data.ok || !Array.isArray(data.products) || data.products.length === 0) {
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
