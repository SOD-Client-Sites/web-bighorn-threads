export interface BighornCategory {
  slug: string
  title: string
  shortTitle: string
  blurb: string
  search: {
    categories?: string
    keywords?: string
  }
  sort?: string
}

export const bighornCategories: BighornCategory[] = [
  {
    slug: 't-shirts',
    title: 'T-Shirts & Work Tees',
    shortTitle: 'T-Shirts',
    blurb: 'Screen-printed and embroidered tees for crews. Cotton, poly-blend, pocket tees, and long-sleeve. Built to take a jobsite beating.',
    search: { categories: 'Shirts', keywords: 'tee t-shirt' },
    sort: 'BESTMATCH',
  },
  {
    slug: 'polos',
    title: 'Embroidered Polo Shirts',
    shortTitle: 'Polos',
    blurb: 'Branded polos for office staff, project managers, and client-facing teams. Performance and traditional cotton options.',
    search: { categories: 'Shirts', keywords: 'polo' },
    sort: 'BESTMATCH',
  },
  {
    slug: 'hi-vis',
    title: 'Hi-Vis & Safety Apparel',
    shortTitle: 'Hi-Vis',
    blurb: 'ANSI Class 2 and Class 3 hi-vis shirts, vests, and jackets. Custom-branded for road, utility, and night-shift crews.',
    search: { keywords: 'hi-vis high visibility ANSI reflective safety' },
    sort: 'POPULARITY',
  },
  {
    slug: 'fr-clothing',
    title: 'FR (Flame-Resistant) Clothing',
    shortTitle: 'FR',
    blurb: 'NFPA 70E and NFPA 2112 compliant shirts, pants, and coveralls. For electricians, welders, and oil & gas crews.',
    search: { keywords: 'flame resistant FR NFPA arc rated' },
    sort: 'BESTMATCH',
  },
  {
    slug: 'hoodies-sweatshirts',
    title: 'Hoodies & Sweatshirts',
    shortTitle: 'Hoodies',
    blurb: 'Pullover and zip-up hoodies, crewnecks, and quarter-zips. Heavyweight options for early-morning jobsites.',
    search: { keywords: 'hoodie sweatshirt pullover zip-up' },
    sort: 'BESTMATCH',
  },
  {
    slug: 'jackets-outerwear',
    title: 'Jackets & Outerwear',
    shortTitle: 'Jackets',
    blurb: 'Softshells, insulated jackets, vests, and rain gear. Branded outerwear that holds up season over season.',
    search: { keywords: 'jacket outerwear softshell insulated' },
    sort: 'BESTMATCH',
  },
  {
    slug: 'work-shirts',
    title: 'Work Shirts & Uniform Shirts',
    shortTitle: 'Work Shirts',
    blurb: 'Button-up work shirts for mechanics, HVAC, plumbing, and industrial trades. Short and long sleeve.',
    search: { keywords: 'work shirt uniform industrial mechanic' },
    sort: 'BESTMATCH',
  },
  {
    slug: 'work-pants',
    title: 'Work Pants',
    shortTitle: 'Work Pants',
    blurb: 'Durable work pants, cargos, and dungarees. Reinforced knees and tool pockets for trade professionals.',
    search: { keywords: 'work pants cargo dungaree' },
    sort: 'BESTMATCH',
  },
  {
    slug: 'caps-hats',
    title: 'Caps & Beanies',
    shortTitle: 'Caps',
    blurb: 'Branded caps, trucker hats, beanies, and hard hat stickers. The fastest piece of branded gear to get right.',
    search: { keywords: 'cap hat beanie' },
    sort: 'POPULARITY',
  },
  {
    slug: 'bags',
    title: 'Bags & Backpacks',
    shortTitle: 'Bags',
    blurb: 'Tool bags, duffels, backpacks, and coolers. Branded gear that crews actually use off the clock.',
    search: { keywords: 'bag backpack duffel tool' },
    sort: 'POPULARITY',
  },
  {
    slug: 'drinkware',
    title: 'Drinkware & Tumblers',
    shortTitle: 'Drinkware',
    blurb: 'Insulated tumblers, water bottles, and travel mugs. Gifts and giveaways that land with trades.',
    search: { keywords: 'tumbler water bottle drinkware insulated' },
    sort: 'POPULARITY',
  },
  {
    slug: 'promotional-products',
    title: 'Promotional Products',
    shortTitle: 'Promo',
    blurb: 'Giveaways, client gifts, and trade show swag. 1.7M products in the catalog — start here if you don\'t know what you want.',
    search: { keywords: 'promotional giveaway' },
    sort: 'POPULARITY',
  },
]

export function findCategory(slug: string): BighornCategory | undefined {
  return bighornCategories.find((c) => c.slug === slug)
}
