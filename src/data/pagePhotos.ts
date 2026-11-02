import manifest from '../../public/images/photos/manifest.json'

// Illustrative photos, disclosed in the footer. Never captioned as a customer or as Steve.
const bySlug = Object.fromEntries(manifest.map((p) => [p.slug, p]))
export const photo = (slug: string) => bySlug[slug]

const heroes: [RegExp, string][] = [
  [/company-stores/, ''],
  [/screen-print|t-shirts|team-shirts|dtf-printing/, 'screen-printing-closeup'],
  [/embroider|custom-hats|patches/, 'embroidered-caps'],
  [/casino|gaming|hospitality/, 'hotel-front-desk'],
  [/education/, 'school-staff-polos'],
  [/government|safety-vests|kishigo/, 'public-works-crew'],
  [/trade-show|\/events\//, 'trade-show-booth'],
  [/onboarding|corporate|promo-products/, 'new-hire-kit'],
  [/construction|general-contractors|custom-work-shirts/, 'home-hero-jobsite-crew'],
  [/^\/services\/$|custom-uniforms|company-uniforms|company-shirts/, 'apparel-flat-lay'],
]

export const heroPhotoForPath = (path: string) => {
  const slug = heroes.find(([re]) => re.test(path))?.[1]
  return slug ? bySlug[slug] : undefined
}
