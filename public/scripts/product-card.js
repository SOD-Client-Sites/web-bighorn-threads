// Shared DOM helpers + product card renderer. No innerHTML; all elements created via DOM APIs.

export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue
    if (k === 'class') node.className = String(v)
    else if (k === 'text') node.textContent = String(v)
    else node.setAttribute(k, String(v))
  }
  const kids = Array.isArray(children) ? children : [children]
  for (const c of kids) {
    if (c == null) continue
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c)
  }
  return node
}

export function clearChildren(node) {
  while (node && node.firstChild) node.removeChild(node.firstChild)
}

function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
}

export function productHref(p) {
  const name = p.name || p.prName || 'product'
  return `/product/?id=${p.prodEId}&slug=${slugify(name)}`
}

export function renderProductCard(p) {
  const name = p.name || p.prName || 'Untitled product'
  const img = p.thumbPic || 'https://placehold.co/600x600/0f172a/c19b3d?text=Bighorn'
  const prc = p.prc ? `$${p.prc}` : ''

  const anchor = el('a', {
    href: productHref(p),
    class: 'group flex flex-col overflow-hidden rounded-xl border border-navy-800/60 bg-navy-900/40 transition-all duration-300 hover:border-gold-500/40 hover:shadow-lg hover:shadow-gold-500/5',
  })

  const imgWrap = el('div', { class: 'aspect-square w-full overflow-hidden bg-white' })
  imgWrap.appendChild(el('img', {
    src: img,
    alt: name,
    loading: 'lazy',
    decoding: 'async',
    class: 'h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105',
  }))
  anchor.appendChild(imgWrap)

  const meta = el('div', { class: 'flex flex-1 flex-col gap-2 px-4 py-3' })
  meta.appendChild(el('h3', {
    class: 'line-clamp-2 font-heading text-sm font-bold leading-snug text-white transition-colors group-hover:text-gold-400',
    text: name,
  }))
  if (prc) {
    meta.appendChild(el('p', {
      class: 'mt-auto font-mono text-xs text-gold-400',
      text: prc,
    }))
  }
  // MOQ from lowest price tier (exposed as minQty by publicizeProduct)
  const moq = p.minQty ?? null
  if (moq && moq > 1) {
    meta.appendChild(el('p', {
      class: 'font-mono text-[10px] text-gray-500',
      text: `Min. ${moq} pcs`,
    }))
  }
  anchor.appendChild(meta)

  return anchor
}

export function renderStatusMessage(text, variant = 'muted') {
  const cls = variant === 'error'
    ? 'col-span-full rounded-xl border border-red-500/40 bg-red-500/5 p-8 text-center text-sm text-gray-200'
    : 'col-span-full py-10 text-center text-sm text-gray-400'
  return el('p', { class: cls, text })
}
