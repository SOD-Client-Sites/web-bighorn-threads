// Inline product-page quote modal. DOM-API only (no innerHTML), focus-trap, ESC to close.
// Submits to /api/quote-request which posts to GoHighLevel.

import { el, clearChildren } from './product-card.js'

const DECORATION_METHODS = [
  'Screen Print',
  'Embroidery',
  'DTF',
  'Heat Transfer',
  'Not sure — recommend something',
]

const DECORATION_LOCATIONS = [
  'Left Chest',
  'Full Back',
  'Sleeve',
  'Multiple Locations',
  'Not sure — recommend something',
]

let activeModal = null
let lastFocused = null

export function openQuoteModal(product) {
  if (activeModal) return // single instance
  lastFocused = document.activeElement

  const overlay = buildOverlay(product)
  document.body.appendChild(overlay)
  document.body.style.overflow = 'hidden'
  activeModal = overlay

  // Focus the first interactive element
  requestAnimationFrame(() => {
    const firstInput = overlay.querySelector('input[name="qty"]')
    if (firstInput) firstInput.focus()
  })

  document.addEventListener('keydown', onKeydown)
}

function closeModal() {
  if (!activeModal) return
  document.removeEventListener('keydown', onKeydown)
  activeModal.remove()
  activeModal = null
  document.body.style.overflow = ''
  if (lastFocused && typeof lastFocused.focus === 'function') {
    try { lastFocused.focus() } catch (_) { /* noop */ }
  }
  lastFocused = null
}

function onKeydown(e) {
  if (!activeModal) return
  if (e.key === 'Escape') {
    e.preventDefault()
    closeModal()
    return
  }
  if (e.key === 'Tab') {
    trapFocus(e)
  }
}

function trapFocus(e) {
  const focusables = activeModal.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )
  if (!focusables.length) return
  const first = focusables[0]
  const last = focusables[focusables.length - 1]
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}

function buildOverlay(product) {
  const overlay = el('div', {
    class: 'fixed inset-0 z-[100] flex items-stretch justify-center overflow-y-auto bg-navy-950/85 px-0 py-0 backdrop-blur-sm sm:items-center sm:px-4 sm:py-8',
    role: 'presentation',
  })

  // Click-outside to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal()
  })

  const dialog = el('div', {
    class: 'relative my-auto flex w-full max-w-2xl flex-col overflow-hidden border-y border-gold-500/30 bg-navy-950 shadow-2xl shadow-gold-500/10 sm:rounded-xl sm:border sm:border-gold-500/40',
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': 'quote-modal-title',
  })
  dialog.addEventListener('click', (e) => e.stopPropagation())

  dialog.appendChild(buildHeader(product))
  dialog.appendChild(buildBody(product))

  overlay.appendChild(dialog)
  return overlay
}

function buildHeader(product) {
  const wrap = el('div', {
    class: 'sticky top-0 z-10 flex items-start gap-4 border-b border-navy-800 bg-navy-900/95 px-5 py-4 backdrop-blur-md sm:px-7 sm:py-5',
  })

  // Product thumb
  const images = Array.isArray(product.pics) ? product.pics.map((p) => p.url).filter(Boolean) : []
  const thumb = images[0] || product.thumbPic || 'https://placehold.co/120x120/0f172a/c19b3d?text=BH'
  const thumbWrap = el('div', { class: 'flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-navy-700 bg-white' })
  thumbWrap.appendChild(el('img', { src: thumb, alt: '', class: 'h-full w-full object-contain p-1', loading: 'lazy' }))
  wrap.appendChild(thumbWrap)

  // Title + meta
  const meta = el('div', { class: 'min-w-0 flex-1' })
  meta.appendChild(el('p', {
    class: 'font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gold-500',
    text: 'Request a Quote',
  }))
  meta.appendChild(el('h2', {
    id: 'quote-modal-title',
    class: 'mt-0.5 truncate font-heading text-base font-bold leading-tight text-white sm:text-lg',
    text: product.prName || 'Product',
  }))
  const ref = product.spc ? `SPC ${product.spc}` : (product.prodEId ? `# ${product.prodEId}` : '')
  if (ref) {
    meta.appendChild(el('p', {
      class: 'mt-0.5 font-mono text-[11px] text-gray-500',
      text: ref,
    }))
  }
  wrap.appendChild(meta)

  // Close button
  const closeBtn = el('button', {
    type: 'button',
    class: 'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-navy-700 text-gray-400 transition-colors hover:border-gold-500/40 hover:bg-navy-900 hover:text-gold-400',
    'aria-label': 'Close quote request',
  })
  // X icon (svg via DOM)
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('fill', 'none')
  svg.setAttribute('stroke', 'currentColor')
  svg.setAttribute('stroke-width', '2')
  svg.setAttribute('class', 'h-4 w-4')
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('stroke-linecap', 'round')
  path.setAttribute('stroke-linejoin', 'round')
  path.setAttribute('d', 'M6 18L18 6M6 6l12 12')
  svg.appendChild(path)
  closeBtn.appendChild(svg)
  closeBtn.addEventListener('click', closeModal)
  wrap.appendChild(closeBtn)

  return wrap
}

function buildBody(product) {
  const body = el('div', { class: 'flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6' })

  const form = el('form', {
    id: 'quote-modal-form',
    novalidate: '',
    class: 'space-y-6',
  })

  // Honeypot
  const hpWrap = el('div', { class: 'absolute -left-[9999px]', 'aria-hidden': 'true' })
  hpWrap.appendChild(el('label', { for: 'qm-website', text: 'Website' }))
  hpWrap.appendChild(el('input', { type: 'text', name: 'website', id: 'qm-website', tabindex: '-1', autocomplete: 'off' }))
  form.appendChild(hpWrap)

  // ---------- PRODUCT SECTION ----------
  const productSection = section('Product')

  // Quantity tier buttons (if product.qty array exists)
  const qtyTiers = parseQtyTiers(product)
  if (qtyTiers.length) {
    const tierWrap = el('div')
    tierWrap.appendChild(label('Common quantities', 'qm-qty', { hint: 'Tap a tier or type your own.' }))
    const tierRow = el('div', { class: 'mt-2 flex flex-wrap gap-2' })
    qtyTiers.forEach((t) => {
      const btn = el('button', {
        type: 'button',
        'data-qty-tier': String(t.qty),
        class: 'rounded-md border border-navy-700 bg-navy-900/60 px-3 py-1.5 font-mono text-xs font-bold text-gray-200 transition-colors hover:border-gold-500/50 hover:bg-gold-500/10 hover:text-gold-300',
        text: t.qty.toLocaleString(),
      })
      btn.addEventListener('click', () => {
        const qtyInput = form.elements.namedItem('qty')
        if (qtyInput) {
          qtyInput.value = String(t.qty)
          qtyInput.focus()
        }
        // visual select state
        tierRow.querySelectorAll('button').forEach((b) => {
          b.classList.remove('border-gold-500', 'bg-gold-500/15', 'text-gold-300')
          if (!b.classList.contains('border-navy-700')) b.classList.add('border-navy-700')
        })
        btn.classList.remove('border-navy-700')
        btn.classList.add('border-gold-500', 'bg-gold-500/15', 'text-gold-300')
      })
      tierRow.appendChild(btn)
    })
    tierWrap.appendChild(tierRow)
    productSection.appendChild(tierWrap)
  }

  // Quantity input
  productSection.appendChild(field({
    label: 'Quantity',
    name: 'qty',
    type: 'number',
    required: true,
    placeholder: 'e.g. 96',
    inputmode: 'numeric',
    min: '1',
  }))

  // Color (select if comma-separated, else text)
  const colorOptions = typeof product.colors === 'string'
    ? product.colors.split(',').map((s) => s.trim()).filter(Boolean)
    : []
  if (colorOptions.length > 1) {
    productSection.appendChild(selectField({
      label: 'Color',
      name: 'color',
      options: ['Pick a color…', ...colorOptions, 'Open to suggestions'],
      placeholder: true,
    }))
  } else {
    productSection.appendChild(field({
      label: 'Color',
      name: 'color',
      type: 'text',
      placeholder: colorOptions[0] || 'e.g. Charcoal, Safety Yellow',
    }))
  }

  // Sizes / split
  productSection.appendChild(textareaField({
    label: 'Sizes / split',
    name: 'sizes',
    placeholder: 'S:6  M:12  L:18  XL:6',
    rows: 2,
    hint: 'Approximate is fine — we can refine on the call.',
  }))
  form.appendChild(productSection)

  // ---------- DECORATION SECTION ----------
  const decoSection = section('Decoration')
  decoSection.appendChild(selectField({
    label: 'Method',
    name: 'decorationMethod',
    options: ['Pick one…', ...DECORATION_METHODS],
    placeholder: true,
  }))
  decoSection.appendChild(selectField({
    label: 'Location',
    name: 'decorationLocation',
    options: ['Pick one…', ...DECORATION_LOCATIONS],
    placeholder: true,
  }))
  decoSection.appendChild(field({
    label: 'In-hands date',
    name: 'inHandsDate',
    type: 'date',
    hint: 'Optional — when do you need them on the job site?',
  }))
  decoSection.appendChild(textareaField({
    label: 'Notes',
    name: 'notes',
    placeholder: 'Logo placement, PMS colors, anything we should know…',
    rows: 3,
  }))
  form.appendChild(decoSection)

  // ---------- CONTACT SECTION ----------
  const contactSection = section('Your info')
  const contactGrid = el('div', { class: 'grid gap-4 sm:grid-cols-2' })
  contactGrid.appendChild(field({ label: 'Name', name: 'name', type: 'text', required: true, autocomplete: 'name', placeholder: 'Jordan Reyes' }))
  contactGrid.appendChild(field({ label: 'Company', name: 'company', type: 'text', required: true, autocomplete: 'organization', placeholder: 'Reyes Concrete' }))
  contactGrid.appendChild(field({ label: 'Email', name: 'email', type: 'email', required: true, autocomplete: 'email', placeholder: 'jordan@reyesgrading.com' }))
  contactGrid.appendChild(field({ label: 'Phone', name: 'phone', type: 'tel', autocomplete: 'tel', placeholder: '(702) 555-0187' }))
  contactSection.appendChild(contactGrid)
  form.appendChild(contactSection)

  // Status region
  const statusEl = el('div', {
    id: 'qm-status',
    role: 'status',
    'aria-live': 'polite',
    class: 'min-h-[1.25rem] text-sm',
  })
  form.appendChild(statusEl)

  // Submit row
  const submitRow = el('div', { class: 'flex flex-col-reverse gap-3 border-t border-navy-800 pt-5 sm:flex-row sm:items-center sm:justify-between' })
  submitRow.appendChild(el('p', {
    class: 'text-xs text-gray-500',
    text: 'Quotes back inside 24 hours. No setup fees, no spam.',
  }))
  const submitBtn = el('button', {
    type: 'submit',
    class: 'inline-flex min-h-[44px] items-center justify-center rounded-lg bg-gold-500 px-6 py-3 font-bold text-navy-950 transition-all hover:bg-gold-400 hover:shadow-lg hover:shadow-gold-500/25 disabled:cursor-not-allowed disabled:opacity-60',
    text: 'Request Quote',
  })
  submitRow.appendChild(submitBtn)
  form.appendChild(submitRow)

  // Submit handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    await submitForm(form, product, statusEl, submitBtn, body)
  })

  body.appendChild(form)
  return body
}

// ---------------- form widget helpers ----------------
function section(title) {
  const wrap = el('div', { class: 'space-y-4' })
  wrap.appendChild(el('h3', {
    class: 'font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gold-500',
    text: title,
  }))
  return wrap
}

function label(text, htmlFor, opts = {}) {
  const wrap = el('div', { class: 'flex items-baseline justify-between gap-3' })
  const labelEl = el('label', {
    for: htmlFor,
    class: 'block text-sm font-semibold text-white',
    text,
  })
  if (opts.required) {
    labelEl.appendChild(el('span', { class: 'ml-1 text-gold-500', text: '*' }))
  }
  wrap.appendChild(labelEl)
  if (opts.hint) {
    wrap.appendChild(el('span', { class: 'text-[11px] text-gray-500', text: opts.hint }))
  }
  return wrap
}

const inputBase =
  'mt-1.5 block w-full min-h-[44px] rounded-lg border border-navy-700/60 bg-navy-950/60 px-3.5 py-2.5 text-sm text-white placeholder-gray-500 transition-colors focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/30'

function field({ label: text, name, type = 'text', required = false, placeholder = '', autocomplete, inputmode, hint, min }) {
  const wrap = el('div')
  const id = `qm-${name}`
  wrap.appendChild(label(text, id, { required, hint }))
  const attrs = {
    type,
    name,
    id,
    class: inputBase + (type === 'date' ? ' font-mono' : type === 'number' ? ' font-mono' : ''),
  }
  if (required) attrs.required = ''
  if (placeholder) attrs.placeholder = placeholder
  if (autocomplete) attrs.autocomplete = autocomplete
  if (inputmode) attrs.inputmode = inputmode
  if (min != null) attrs.min = String(min)
  wrap.appendChild(el('input', attrs))
  return wrap
}

function selectField({ label: text, name, options, required = false, placeholder = false }) {
  const wrap = el('div')
  const id = `qm-${name}`
  wrap.appendChild(label(text, id, { required }))
  const attrs = { name, id, class: inputBase + ' appearance-none bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat pr-10' }
  if (required) attrs.required = ''
  // Inline chevron via background-image (data URI, gold)
  attrs.style = "background-image:url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20' stroke='%23c19b3d' stroke-width='2'><path stroke-linecap='round' stroke-linejoin='round' d='M6 8l4 4 4-4'/></svg>\")"
  const select = el('select', attrs)
  options.forEach((opt, i) => {
    const o = el('option', { value: placeholder && i === 0 ? '' : opt, text: opt })
    if (placeholder && i === 0) o.setAttribute('disabled', '')
    if (placeholder && i === 0) o.setAttribute('selected', '')
    select.appendChild(o)
  })
  wrap.appendChild(select)
  return wrap
}

function textareaField({ label: text, name, placeholder = '', rows = 3, required = false, hint }) {
  const wrap = el('div')
  const id = `qm-${name}`
  wrap.appendChild(label(text, id, { required, hint }))
  const attrs = {
    name,
    id,
    rows: String(rows),
    class: inputBase + ' min-h-[auto] py-3 leading-relaxed',
  }
  if (required) attrs.required = ''
  if (placeholder) attrs.placeholder = placeholder
  wrap.appendChild(el('textarea', attrs))
  return wrap
}

function parseQtyTiers(product) {
  const out = []
  if (!Array.isArray(product.qty)) return out
  for (let i = 0; i < product.qty.length; i++) {
    const q = parseInt(product.qty[i], 10)
    if (q > 0) out.push({ qty: q })
  }
  // Dedupe + sort
  const seen = new Set()
  return out.filter((t) => {
    if (seen.has(t.qty)) return false
    seen.add(t.qty)
    return true
  }).sort((a, b) => a.qty - b.qty).slice(0, 6)
}

// ---------------- submit ----------------
function setStatus(statusEl, msg, tone) {
  statusEl.textContent = msg
  const toneCls = tone === 'error' ? 'text-red-400' : tone === 'success' ? 'text-gold-400' : 'text-gray-400'
  statusEl.className = `min-h-[1.25rem] text-sm ${toneCls}`
}

async function submitForm(form, product, statusEl, submitBtn, bodyEl) {
  // Honeypot
  const hp = form.querySelector('input[name="website"]')
  if (hp && hp.value) {
    showSuccessState(bodyEl, product) // silently succeed for bots
    return
  }

  // Client-side validation
  const required = ['name', 'company', 'email', 'qty']
  for (const fname of required) {
    const elNode = form.elements.namedItem(fname)
    if (!elNode || !String(elNode.value || '').trim()) {
      setStatus(statusEl, 'Fill in your name, company, email, and quantity so we can quote.', 'error')
      if (elNode && typeof elNode.focus === 'function') elNode.focus()
      return
    }
  }

  const emailEl = form.elements.namedItem('email')
  if (emailEl && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(emailEl.value).trim())) {
    setStatus(statusEl, 'That email does not look right — mind double-checking?', 'error')
    emailEl.focus()
    return
  }

  const qtyEl = form.elements.namedItem('qty')
  const qty = parseInt(String(qtyEl.value || ''), 10)
  if (!(qty > 0)) {
    setStatus(statusEl, 'Quantity needs to be a number greater than zero.', 'error')
    qtyEl.focus()
    return
  }

  const payload = {
    productSpc: product.spc || '',
    productEId: product.prodEId ? String(product.prodEId) : '',
    productName: product.prName || '',
    productCategory: product.category || '',
    productImage: (Array.isArray(product.pics) && product.pics[0]?.url) || product.thumbPic || '',
    qty,
    color: getVal(form, 'color'),
    sizes: getVal(form, 'sizes'),
    decorationMethod: getVal(form, 'decorationMethod'),
    decorationLocation: getVal(form, 'decorationLocation'),
    inHandsDate: getVal(form, 'inHandsDate'),
    notes: getVal(form, 'notes'),
    name: getVal(form, 'name'),
    company: getVal(form, 'company'),
    email: getVal(form, 'email'),
    phone: getVal(form, 'phone'),
    website: '', // honeypot value (empty by client check above)
    sourceUrl: window.location.href,
  }

  setStatus(statusEl, 'Sending your request…', 'info')
  submitBtn.disabled = true
  submitBtn.textContent = 'Sending…'

  try {
    const res = await fetch('/api/quote-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.ok) {
      throw new Error(data.error || `Request failed (${res.status})`)
    }
    showSuccessState(bodyEl, product)
  } catch (err) {
    console.error('[quote-modal]', err)
    setStatus(statusEl, 'Something broke on our end. Call 725.235.6196 or email info@bighornthreads.com — we will handle it.', 'error')
    submitBtn.disabled = false
    submitBtn.textContent = 'Request Quote'
  }
}

function getVal(form, name) {
  const node = form.elements.namedItem(name)
  return node ? String(node.value || '').trim() : ''
}

function showSuccessState(bodyEl, product) {
  clearChildren(bodyEl)

  const wrap = el('div', { class: 'py-8 text-center' })

  // Stamp graphic — gold check inside ring
  const stamp = el('div', { class: 'mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold-500/60 bg-gold-500/10 text-gold-400' })
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('fill', 'none')
  svg.setAttribute('stroke', 'currentColor')
  svg.setAttribute('stroke-width', '2.5')
  svg.setAttribute('class', 'h-8 w-8')
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('stroke-linecap', 'round')
  path.setAttribute('stroke-linejoin', 'round')
  path.setAttribute('d', 'M5 13l4 4L19 7')
  svg.appendChild(path)
  stamp.appendChild(svg)
  wrap.appendChild(stamp)

  wrap.appendChild(el('p', {
    class: 'font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-gold-500',
    text: 'Request Received',
  }))
  wrap.appendChild(el('h3', {
    class: 'mt-2 font-heading text-xl font-bold text-white sm:text-2xl',
    text: 'Got it. We are on it.',
  }))
  wrap.appendChild(el('p', {
    class: 'mx-auto mt-4 max-w-md text-sm leading-relaxed text-gray-300',
    text: `Steve or someone on the Bighorn team will reply within 2 business hours with pricing on the ${product.prName || 'product'} you picked. Full quote inside 24.`,
  }))

  // Action row
  const actions = el('div', { class: 'mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row' })
  const closeBtn = el('button', {
    type: 'button',
    class: 'inline-flex min-h-[44px] items-center justify-center rounded-lg border border-navy-700 bg-navy-900 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:border-gold-500/40 hover:text-gold-400',
    text: 'Keep browsing',
  })
  closeBtn.addEventListener('click', closeModal)
  const callLink = el('a', {
    href: 'tel:+17252356196',
    class: 'inline-flex min-h-[44px] items-center justify-center rounded-lg bg-gold-500 px-5 py-2.5 text-sm font-bold text-navy-950 transition-colors hover:bg-gold-400',
    text: 'Or call 725.235.6196',
  })
  actions.appendChild(closeBtn)
  actions.appendChild(callLink)
  wrap.appendChild(actions)

  bodyEl.appendChild(wrap)

  // Re-focus close button so screen-readers land on it
  requestAnimationFrame(() => closeBtn.focus())
}
