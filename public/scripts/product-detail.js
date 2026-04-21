import { el, clearChildren } from './product-card.js'
import { openQuoteModal } from './quote-modal.js'

const loadingEl = document.getElementById('pdp-loading')
const errorEl = document.getElementById('pdp-error')
const contentEl = document.getElementById('pdp-content')
const breadcrumb = document.getElementById('pdp-breadcrumb')

loadPdp()

function getIdFromUrl() {
  const url = new URL(window.location.href)
  const id = (url.searchParams.get('id') || '').trim()
  return /^\d+$/.test(id) ? id : null
}

async function loadPdp() {
  const id = getIdFromUrl()
  if (!id) { showError(); return }

  try {
    const res = await fetch(`/api/sage/product?id=${encodeURIComponent(id)}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    if (!data.ok || !data.product) throw new Error('product missing')
    render(data.product)
  } catch (err) {
    console.error('[pdp]', err)
    showError()
  }
}

function showError() {
  loadingEl.classList.add('hidden')
  errorEl.classList.remove('hidden')
}

function render(p) {
  const title = p.prName || 'Product'
  document.title = `${title} — Custom-Branded | Bighorn Threads`

  // Breadcrumb category
  if (p.category) {
    const sep = el('span', { class: 'px-2 text-gray-600', text: '/' })
    const cat = el('span', { class: 'text-gray-300', text: p.category })
    breadcrumb.appendChild(sep)
    breadcrumb.appendChild(cat)
  }

  const images = Array.isArray(p.pics) ? p.pics.map((pic) => pic.url).filter(Boolean) : []
  const hero = images[0] || 'https://placehold.co/800x800/0f172a/c19b3d?text=Bighorn+Threads'

  const qtyTiers = []
  if (Array.isArray(p.qty) && Array.isArray(p.prc)) {
    for (let i = 0; i < p.qty.length; i++) {
      const qty = parseInt(p.qty[i], 10)
      const price = parseFloat(p.prc[i])
      const catPrice = Array.isArray(p.catPrc) ? parseFloat(p.catPrc[i]) : NaN
      if (qty > 0 && !isNaN(price) && price > 0) {
        qtyTiers.push({ qty, price, catPrice: !isNaN(catPrice) && catPrice > 0 ? catPrice : null })
      }
    }
  }
  const priceRange = qtyTiers.length
    ? (() => {
        const prices = qtyTiers.map((t) => t.price)
        const lo = Math.min(...prices), hi = Math.max(...prices)
        return lo === hi ? `$${lo.toFixed(2)}` : `$${lo.toFixed(2)} – $${hi.toFixed(2)}`
      })()
    : ''

  // Top grid: images + details
  const grid = el('div', { class: 'grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12' })

  // ---- Left column: gallery
  const galleryCol = el('div')
  const heroWrap = el('div', { class: 'relative aspect-square w-full overflow-hidden rounded-xl border border-navy-800/60 bg-white' })
  const heroImg = el('img', { id: 'pdp-hero-img', src: hero, alt: title, class: 'h-full w-full object-contain p-6' })
  heroWrap.appendChild(heroImg)
  galleryCol.appendChild(heroWrap)

  if (images.length > 1) {
    const thumbs = el('div', { class: 'mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6' })
    images.slice(0, 12).forEach((url, i) => {
      const btn = el('button', {
        type: 'button',
        class: `aspect-square overflow-hidden rounded-lg border ${i === 0 ? 'border-gold-500' : 'border-navy-700 hover:border-gold-500/50'} bg-white`,
        'aria-label': `View image ${i + 1}`,
      })
      btn.dataset.thumb = url
      btn.appendChild(el('img', { src: url, alt: `View ${i + 1}`, class: 'h-full w-full object-contain p-1.5', loading: 'lazy' }))
      btn.addEventListener('click', () => {
        heroImg.src = url
        thumbs.querySelectorAll('button').forEach((b) => {
          b.classList.remove('border-gold-500')
          if (!b.classList.contains('border-navy-700')) b.classList.add('border-navy-700')
        })
        btn.classList.remove('border-navy-700')
        btn.classList.add('border-gold-500')
      })
      thumbs.appendChild(btn)
    })
    galleryCol.appendChild(thumbs)
  }
  grid.appendChild(galleryCol)

  // ---- Right column: details
  const detailCol = el('div')
  if (p.lineName) {
    detailCol.appendChild(el('p', { class: 'mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gold-500', text: p.lineName }))
  }
  detailCol.appendChild(el('h1', { class: 'mb-3 font-heading text-2xl font-bold leading-tight text-white sm:text-3xl', text: title }))

  const badges = el('div', { class: 'mb-5 flex flex-wrap items-center gap-2' })
  if (p.verified == 1) {
    badges.appendChild(el('span', { class: 'rounded-full border border-gold-500/30 bg-gold-500/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-gold-400', text: 'Verified Supplier' }))
  }
  if (p.madeInCountry) {
    badges.appendChild(el('span', { class: 'rounded-full border border-navy-700 bg-navy-900/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-gray-300', text: `Made in ${p.madeInCountry}` }))
  }
  if (p.category) {
    badges.appendChild(el('span', { class: 'rounded-full border border-navy-700 bg-navy-900/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-gray-300', text: p.category }))
  }
  detailCol.appendChild(badges)

  if (priceRange) {
    const priceCard = el('div', { class: 'mb-5 rounded-xl border border-gold-500/30 bg-gold-500/5 p-4' })
    priceCard.appendChild(el('p', { class: 'font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gold-500', text: 'Starting at' }))
    priceCard.appendChild(el('p', { class: 'mt-1 font-heading text-2xl font-bold text-white', text: priceRange }))
    priceCard.appendChild(el('p', { class: 'mt-1 text-xs text-gray-400', text: 'Price depends on qty and decoration. Full breakdown below.' }))
    detailCol.appendChild(priceCard)
  }

  const ctaRow = el('div', { class: 'mb-6 flex flex-col gap-3 sm:flex-row' })
  const quoteBtn = el('button', {
    type: 'button',
    class: 'inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-gold-500 px-5 py-3 font-bold text-navy-950 transition-all hover:bg-gold-400 hover:shadow-lg hover:shadow-gold-500/25',
    text: 'Request a Quote',
  })
  quoteBtn.addEventListener('click', () => openQuoteModal(p))
  ctaRow.appendChild(quoteBtn)
  ctaRow.appendChild(el('a', {
    href: 'tel:+17252356196',
    class: 'inline-flex items-center justify-center gap-2 rounded-lg border border-navy-700 bg-navy-900 px-5 py-3 font-bold text-white transition-colors hover:border-gold-500/40 hover:text-gold-400',
    text: 'Call 725.235.6196',
  }))
  detailCol.appendChild(ctaRow)

  if (p.description) {
    const descCard = el('div', { class: 'mb-6 rounded-xl border border-navy-800/60 bg-navy-900/40 p-5' })
    descCard.appendChild(el('h2', { class: 'mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gold-500', text: 'Product Details' }))
    descCard.appendChild(el('p', { class: 'text-sm leading-relaxed text-gray-200', text: p.description }))
    detailCol.appendChild(descCard)
  }

  const dl = el('dl', { class: 'grid grid-cols-2 gap-3 text-sm' })
  appendDef(dl, 'Colors', p.colors, { colSpan: 2 })
  appendDef(dl, 'Dimensions', p.dimensions)
  appendDef(dl, 'Decoration', p.decorationMethod)
  appendDef(dl, 'Imprint Area', p.imprintArea ? `${p.imprintArea}${p.imprintLoc ? ` · ${p.imprintLoc}` : ''}` : '')
  appendDef(dl, 'Production Time', p.prodTime)
  appendDef(dl, 'Packaging', p.package)
  appendDef(dl, 'Price Includes', p.priceIncludes, { colSpan: 2 })
  if (dl.children.length) detailCol.appendChild(dl)

  grid.appendChild(detailCol)

  // ---- Quantity pricing table
  contentEl.appendChild(grid)

  if (qtyTiers.length) {
    const pricingBlock = el('div', { class: 'mt-10 rounded-xl border border-navy-800/60 bg-navy-900/40 p-6' })
    pricingBlock.appendChild(el('h2', { class: 'mb-1 font-heading text-lg font-bold text-white', text: 'Quantity Pricing' }))
    pricingBlock.appendChild(el('p', { class: 'mb-4 text-xs text-gray-400', text: 'Final price depends on decoration and options. Request a quote for a firm number.' }))

    const tableWrap = el('div', { class: 'overflow-x-auto' })
    const table = el('table', { class: 'w-full min-w-[400px] text-sm' })
    const hasCat = qtyTiers.some((t) => t.catPrice != null)

    const thead = el('thead')
    const trh = el('tr', { class: 'border-b border-navy-800 text-left' })
    trh.appendChild(el('th', { class: 'py-2 pr-4 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-gold-500', text: 'Qty' }))
    trh.appendChild(el('th', { class: 'py-2 pr-4 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-gold-500', text: 'Price Each' }))
    if (hasCat) trh.appendChild(el('th', { class: 'py-2 pr-4 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500', text: 'List Price' }))
    thead.appendChild(trh)
    table.appendChild(thead)

    const tbody = el('tbody')
    qtyTiers.forEach((t) => {
      const tr = el('tr', { class: 'border-b border-navy-800/50' })
      tr.appendChild(el('td', { class: 'py-2.5 pr-4 text-gray-200', text: `${t.qty.toLocaleString()}+` }))
      tr.appendChild(el('td', { class: 'py-2.5 pr-4 font-mono text-gold-400', text: `$${t.price.toFixed(2)}` }))
      if (hasCat) tr.appendChild(el('td', { class: 'py-2.5 pr-4 font-mono text-xs text-gray-500', text: t.catPrice ? `$${t.catPrice.toFixed(2)}` : '—' }))
      tbody.appendChild(tr)
    })
    table.appendChild(tbody)
    tableWrap.appendChild(table)
    pricingBlock.appendChild(tableWrap)

    contentEl.appendChild(pricingBlock)
  }

  loadingEl.classList.add('hidden')
  contentEl.classList.remove('hidden')
}

function appendDef(dl, label, value, { colSpan } = {}) {
  if (!value) return
  const wrap = el('div', { class: `rounded-lg border border-navy-800/60 bg-navy-900/30 p-3${colSpan === 2 ? ' col-span-2' : ''}` })
  wrap.appendChild(el('dt', { class: 'font-mono text-[10px] uppercase tracking-[0.15em] text-gold-500', text: label }))
  wrap.appendChild(el('dd', { class: 'mt-1 text-gray-200', text: String(value) }))
  dl.appendChild(wrap)
}
