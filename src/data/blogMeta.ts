import { productPhotos as p } from './productPhotos'

type Key = keyof typeof p
export type Lead = { src: string; alt: string; product: boolean }

const items = (...keys: Key[]): Lead[] => keys.map((k) => ({ ...p[k], product: true }))

// Supplier product photography matched to each article.
const leads: Record<string, Lead[]> = {
  'how-to-order-company-logo-shirts': items('polo', 'workShirt'),
  'polo-vs-work-shirt-vs-t-shirt-for-employees': items('polo', 'workShirt'),
  'logo-placement-size-guide-company-shirts': items('polo', 'cap'),
  'how-to-start-a-company-uniform-program': items('workShirt', 'polo'),
  'does-nevada-require-fr-clothing-electricians': items('fr', 'frKhaki'),
  'who-pays-for-work-uniforms-ppe-nevada': items('workShirt', 'vest'),
  'what-to-wear-construction-las-vegas-heat': items('hivisLong', 'boonie'),
  'camisas-fr-ropa-ignifuga-normas': items('fr', 'frCoverall'),
  'ansi-107-class-2-vs-class-3-hi-vis-las-vegas': items('vest', 'hivisLong'),
  'apprentice-journeyman-uniforms-differentiation': items('workShirt', 'hardHatCap'),
  'branded-workwear-data-center-contractors-las-vegas': items('frKhaki', 'hardHat'),
  'bulwark-fr-shirts-vegas-heat': items('fr', 'frKhaki'),
  'carhartt-custom-embroidery-las-vegas': items('carharttJacket', 'carharttTee'),
  'company-store-vs-bulk-ordering': items('polo', 'hoodie'),
  'custom-branded-sweatshirts-vs-embroidered-hoodies': items('hoodie', 'softshell'),
  'custom-embroidered-aprons-trade-businesses': items('apron'),
  'custom-embroidered-hoodies-sweatshirts': items('hoodie'),
  'custom-embroidered-t-shirts-buyer-guide': items('tee', 'carharttTee'),
  'custom-hard-hats-las-vegas-buyer-guide': items('hardHat', 'hardHatCap'),
  'custom-hard-hats-osha-z89-decals-las-vegas': items('hardHatCap'),
  'custom-hats-embroidered-screen-printed': items('cap', 'beanie'),
  'custom-polo-shirts-las-vegas': items('polo', 'poloWhite'),
  'custom-safety-vests-ansi-compliance': items('vest'),
  'dtf-printing-vs-screen-printing-custom-apparel': items('tee', 'hoodie'),
  'embroidery-file-formats-explained': items('polo', 'cap'),
  'embroidery-shop-las-vegas-guide': items('cap', 'beanie'),
  'foreman-supervisor-shirts-visual-authority': items('workShirt', 'vest'),
  'hi-vis-class-3-when-you-need-it-over-class-2': items('vest', 'hivisLong'),
  'how-many-shirts-per-crew-member-vegas': items('tee', 'polo'),
  'how-much-to-embroider-a-polo': items('polo'),
  'how-much-to-embroider-a-shirt': items('polo', 'cap'),
  'how-to-outfit-a-construction-crew-vegas': items('workShirt', 'vest'),
  'hvac-uniforms-service-tech-apparel': items('workShirt', 'workShirtBlack'),
  'logo-digitizing-101-embroidery': items('polo', 'cap'),
  'minimum-order-quantity-embroidery-screen-printing': items('tee', 'hoodie'),
  'nevada-osha-heat-rules-2026-workwear': items('hivisLong', 'boonie'),
  'new-hire-workwear-checklist-las-vegas-contractors': items('polo', 'backpack'),
  'nfpa-2112-fr-coveralls-buyer-guide': items('frCoverall'),
  'nfpa-70e-fr-shirts-vegas-electricians': items('fr'),
  'plastisol-vs-water-based-ink-workwear': items('tee', 'hoodie'),
  'port-authority-polos-vs-alternatives': items('polo', 'quarterZip'),
  'ppe-branded-workwear-regulations-construction-las-vegas': items('vest', 'hivisLong'),
  'red-kap-industrial-work-shirts-buyer-guide': items('workShirt', 'coverall'),
  'rush-order-shirts-las-vegas-2-day-3-day-options': items('tee', 'polo'),
  'rush-order-shirts-las-vegas-whats-possible': items('tee', 'polo'),
  'screen-printing-shop-las-vegas-guide': items('tee', 'hoodie'),
  'screen-printing-vs-embroidery-construction': items('tee', 'polo'),
  'sublimation-printing-custom-apparel-guide': items('hivisTee'),
  'trade-show-apparel-booth-crew': items('polo', 'tumbler'),
  'vector-logo-file-setup-for-embroidery': items('polo', 'cap'),
  'welder-uniforms-fr-shirts-las-vegas': items('frCoverall', 'fr'),
  'welder-uniforms-las-vegas-buyer-guide': items('frCoverall', 'pants'),
  'what-is-a-company-shirt': items('quarterZip', 'polo'),
  'what-is-embroidery-buyers-guide': items('cap', 'beanie'),
  'what-is-screen-printing': items('tee', 'hoodie'),
}

export const leadFor = (slug: string): Lead[] => leads[slug] ?? items('tee', 'hoodie')
export const slugFromPath = (path: string) => path.split('/').filter(Boolean).pop() ?? ''

const field = (src: string, name: string) => {
  const m = src.match(new RegExp(`${name}:\\s*(?:'((?:[^'\\\\]|\\\\.)*)'|"([^"]*)")`))
  return (m?.[1] ?? m?.[2] ?? '').replace(/\\'/g, "'")
}

const raw = import.meta.glob('/src/pages/blog/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
// Posts canonicalized to another URL; keep them out of "Keep reading" so internal links hit the canonical.
const canonicalizedAway = new Set(['rush-order-shirts-las-vegas-2-day-3-day-options', 'screen-printing-vs-embroidery-construction'])
export const blogPosts = Object.entries(raw)
  .filter(([f]) => !f.endsWith('/index.astro'))
  .filter(([f]) => !canonicalizedAway.has(f.split('/').pop()!.replace('.astro', '')))
  .map(([f, src]) => ({ slug: f.split('/').pop()!.replace('.astro', ''), title: field(src, 'title'), category: field(src, 'category') }))
  .sort((a, b) => a.slug.localeCompare(b.slug))

// Stable pick: same category first, then the next posts alphabetically.
export const relatedTo = (slug: string, count = 3) => {
  const i = blogPosts.findIndex((x) => x.slug === slug)
  const ring = [...blogPosts.slice(i + 1), ...blogPosts.slice(0, Math.max(i, 0))]
  const category = blogPosts[i]?.category
  return [...ring.filter((x) => x.category === category), ...ring.filter((x) => x.category !== category)].slice(0, count)
}
