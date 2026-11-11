export interface BighornCategory {
  slug: string
  title: string
  shortTitle: string
  blurb: string
  seoIntro: string
  seoBullets: string[]
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
    seoIntro:
      "Tees are what a crew actually wears every day, so pick for the job: heavyweight cotton for durability, poly-cotton blends to reduce shrink, pocket tees and long sleeves for sun. Send your logo and count, and you get a price and a proof before anything is printed.",
    seoBullets: [
      'Heavyweight cotton, poly-blend, ringspun: sized so a 3XL fits a 3XL',
      'Screen printing and transfer options, based on the order',
      'Carhartt, Bayside, Gildan, Port & Company: brands crews recognize',
      'Proof review before approved production',
      'Availability confirmed for your selected brand and style',
    ],
    search: { categories: 'Shirts', keywords: 'tee t-shirt' },
    sort: 'BESTMATCH',
  },
  {
    slug: 'polos',
    title: 'Embroidered Polo Shirts',
    shortTitle: 'Polos',
    blurb: 'Branded polos for office staff, project managers, and client-facing teams. Performance and traditional cotton options.',
    seoIntro:
      "Embroidered polos give project managers, estimators, and anyone meeting customers a consistent look. Cotton piqué feels traditional, and performance fabric resists snags and handles heat better. Send your logo and thread colors, and you see the placement on a proof first. If you reorder often, ask about a company store.",
    seoBullets: [
      'Port Authority, Nike, Cutter & Buck, OGIO, Carhartt',
      'Order minimum confirmed for your selected product and partner',
      'Performance, snag-resistant, and traditional cotton piqué',
      'Proof and written approval before production',
      'Managed company store options for repeat ordering',
    ],
    search: { categories: 'Shirts', keywords: 'polo' },
    sort: 'BESTMATCH',
  },
  {
    slug: 'hi-vis',
    title: 'Hi-Vis & Safety Apparel',
    shortTitle: 'Hi-Vis',
    blurb: 'ANSI Class 2 and Class 3 hi-vis shirts, vests, and jackets. Custom-branded for road, utility, and night-shift crews.',
    seoIntro:
      "Hi-vis gear is for road, utility, traffic-control, paving, and night-shift crews. Your safety lead picks the ANSI class. We find garments rated for it and check the maker's instructions before a logo goes on, because decoration can't be allowed to cut into the visibility material.",
    seoBullets: [
      'Class 2 and Class 3 garment options, subject to program review',
      'ML Kishigo, Bulwark, Radians, OccuNomix, Tingley',
      'Lime-yellow, orange-red, and FR hi-vis options',
      'Decoration planned around manufacturer instructions',
      'Product documentation confirmed with your quote',
    ],
    search: { keywords: 'hi-vis high visibility ANSI reflective safety' },
    sort: 'POPULARITY',
  },
  {
    slug: 'fr-clothing',
    title: 'FR (Flame-Resistant) Clothing',
    shortTitle: 'FR',
    blurb: 'FR shirts, pants, and coveralls for eligible workplace programs. Confirm current ratings and product documentation before ordering.',
    seoIntro:
      "FR workwear is for crews facing arc-flash or flash-fire hazards. Your safety lead sets the protection level from your hazard assessment. We find garments that meet it and check the maker's instructions first, because the wrong thread or heat transfer can compromise an FR garment.",
    seoBullets: [
      'NFPA 70E and NFPA 2112 garment options',
      'Bulwark FR, Carhartt FR, Wrangler FR',
      'Decoration options reviewed against manufacturer guidance',
      'Protection ratings and documentation confirmed by product',
      'For electrical, solar, welding, oil & gas, and data centers',
    ],
    search: { keywords: 'flame resistant FR NFPA arc rated' },
    sort: 'BESTMATCH',
  },
  {
    slug: 'hoodies-sweatshirts',
    title: 'Hoodies & Sweatshirts',
    shortTitle: 'Hoodies',
    blurb: 'Pullover and zip-up hoodies, crewnecks, and quarter-zips. Heavyweight options for early-morning jobsites.',
    seoIntro:
      "Hoodies and sweatshirts give crews a layer for cold mornings and give everyone else something they'll wear on weekends. Choose pullover, full zip, crewneck, or quarter zip. Big back prints suit screen printing, and small chest logos suit embroidery. Send your design and count, and we'll tell you which fits.",
    seoBullets: [
      'Carhartt, Champion, Gildan, Independent Trading, Port & Company',
      'Pullover, full-zip, crewneck, quarter-zip styles',
      'Screen print, embroidery, and DTF transfer decoration',
      'Heavyweight 12oz and midweight 9oz options',
      'Brand, color, and size availability confirmed per order',
    ],
    search: { keywords: 'hoodie sweatshirt pullover zip-up' },
    sort: 'BESTMATCH',
  },
  {
    slug: 'jackets-outerwear',
    title: 'Jackets & Outerwear',
    shortTitle: 'Jackets',
    blurb: 'Softshells, insulated jackets, vests, and rain gear. Branded outerwear that holds up season over season.',
    seoIntro:
      "A good jacket gets worn for years, on the job and off it. Compare softshells, insulated jackets, fleece, vests, and rain shells. Seams, zippers, and waterproof shells limit where a logo can go, so send your logo and we'll show the placement on a proof.",
    seoBullets: [
      'Carhartt, Port Authority, Helly Hansen, Eddie Bauer, The North Face',
      'Softshell, insulated, fleece, vest, and rain shell styles',
      'Embroidery on chest, back yoke, sleeve, or all three',
      '3D puff and flat satin stitch options',
      'Ask whether a pre-production sample is available',
    ],
    search: { keywords: 'jacket outerwear softshell insulated' },
    sort: 'BESTMATCH',
  },
  {
    slug: 'work-shirts',
    title: 'Work Shirts & Uniform Shirts',
    shortTitle: 'Work Shirts',
    blurb: 'Button-up work shirts for mechanics, HVAC, plumbing, and industrial trades. Short and long sleeve.',
    seoIntro:
      "Work shirts give mechanical, HVAC, plumbing, fleet, and maintenance crews a uniform that holds up. Choose short or long sleeves, snap or button front, then add your logo and name patches. If your shirts go through industrial laundry, tell us so we can pick a garment and decoration that survive it.",
    seoBullets: [
      'Red Kap, Cornerstone, Bulwark, Dickies',
      'Short sleeve, long sleeve, snap front, button front',
      'Name patches, certification embroidery, stripe trim',
      'Industrial laundry compatibility for fleet uniform programs',
      'Sizing audit forms for accurate first orders',
    ],
    search: { categories: 'Shirts', keywords: 'industrial work shirt' },
    sort: 'BESTMATCH',
  },
  {
    slug: 'work-pants',
    title: 'Work Pants',
    shortTitle: 'Work Pants',
    blurb: 'Durable work pants, cargos, and dungarees. Reinforced knees and tool pockets for trade professionals.',
    seoIntro:
      "Pick work pants by the job: cargos for tools, double-knee for kneeling, and rated garments where your safety lead requires them. Send sizes and how the pants will be used, and we'll tell you which styles fit and whether they can take a logo.",
    seoBullets: [
      'Carhartt, Dickies, Bulwark FR, Wrangler Workwear, Red Kap',
      'Cargo, dungaree, double-knee, and FR-rated styles',
      'Hemming to spec on bulk orders',
      'Trade-specific sizing recommendations',
      'Company store integration with employee-specific sizing',
    ],
    search: { keywords: 'work pants cargo dungaree' },
    sort: 'BESTMATCH',
  },
  {
    slug: 'caps-hats',
    title: 'Caps & Beanies',
    shortTitle: 'Caps',
    blurb: 'Branded caps, trucker hats, beanies, and hard hat stickers. The fastest piece of branded gear to get right.',
    seoIntro:
      "Caps put your logo at eye level, on the job and away from it. Compare structured caps, trucker hats, snapbacks, beanies, and patches. Flat embroidery suits most logos, puff suits bold letters, and patches hold more detail. Send your logo and count for a price and a proof.",
    seoBullets: [
      'Richardson, Flexfit, Yupoong, Imperial, New Era',
      '3D puff embroidery, flat embroidery, leather patch, PVC patch',
      'Hard hat decals available, subject to manufacturer guidance',
      'Order minimum confirmed for your selected cap and partner',
      'Style and color availability confirmed per order',
    ],
    search: { keywords: 'cap hat beanie' },
    sort: 'POPULARITY',
  },
  {
    slug: 'bags',
    title: 'Bags & Backpacks',
    shortTitle: 'Bags',
    blurb: 'Tool bags, duffels, backpacks, and coolers. Branded gear that crews actually use off the clock.',
    seoIntro:
      "Bags work for crews, travelers, client gifts, and events. Compare tool bags, duffels, backpacks, coolers, and rolling luggage. Pockets and seams limit where a logo fits, so you see the placement on a proof before anything is made.",
    seoBullets: [
      'Carhartt, OGIO, Veto Pro Pac, Klein Tools, Yeti',
      'Tool bags, backpacks, duffels, coolers, rolling luggage',
      'Embroidery and screen print decoration',
      'Position mockups before every approval',
      'Order minimum confirmed for your selected product and partner',
    ],
    search: { keywords: 'bag backpack duffel tool' },
    sort: 'POPULARITY',
  },
  {
    slug: 'drinkware',
    title: 'Drinkware & Tumblers',
    shortTitle: 'Drinkware',
    blurb: 'Insulated tumblers, water bottles, and travel mugs. Gifts and giveaways that land with trades.',
    seoIntro:
      "Branded drinkware can support client gifts, employee recognition, jobsite programs, and event giveaways. Bighorn Threads helps you compare tumblers, bottles, mugs, and available decoration methods. We coordinate approved production through selected partners. Engraving, printing, minimums, pricing, and lead times vary by product and partner. Tell us your audience, quantity, and deadline so we can confirm suitable options.",
    seoBullets: [
      'Yeti, Stanley, Hydro Flask, RTIC, CamelBak',
      'Laser engraving for premium gift programs',
      'Pad printing for full-color giveaway runs',
      'Hydration-station bulk programs for jobsite launches',
      'Client gifts, employee anniversaries, trade show swag',
    ],
    search: { keywords: 'tumbler water bottle drinkware insulated' },
    sort: 'POPULARITY',
  },
  {
    slug: 'promotional-products',
    title: 'Promotional Products',
    shortTitle: 'Promo',
    blurb: 'Giveaways, client gifts, and trade show swag. 1.7M+ products in the catalog. Start here if you don\'t know what you want.',
    seoIntro:
      "When you don't know what you want, start here. Bighorn Threads can help you search the SAGE supplier network for promotional products. Options can include pens, notebooks, drinkware, decals, tools, gifts, kits, awards, and event giveaways. Tell us your event, audience, budget, and timeline. We'll narrow the catalog and confirm current products, minimums, pricing, decoration, and production terms.",
    seoBullets: [
      '1.7M+ promotional products via SAGE supplier network',
      'Picks narrowed to your audience and budget',
      'Challenge coins, hard hat stickers, branded tools, tape measures',
      'Custom event and trade show giveaway programs',
      'Curated quotes with decoration mockups',
    ],
    search: { keywords: 'promotional giveaway' },
    sort: 'POPULARITY',
  },
]

export function findCategory(slug: string): BighornCategory | undefined {
  return bighornCategories.find((c) => c.slug === slug)
}
