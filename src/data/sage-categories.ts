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
      "Custom t-shirts are the workhorse of a Las Vegas construction crew's wardrobe. Bighorn Threads helps you select tees for your crew and coordinates decoration through selected production partners. Options can include heavyweight cotton, poly-cotton blends, pocket tees, long sleeves, and ringspun cotton. Available brands, decoration methods, minimums, and timelines depend on the product and partner. You review the proposed product and proof before production begins.",
    seoBullets: [
      'Heavyweight cotton, poly-blend, ringspun — sized so a 3XL fits a 3XL',
      'Screen printing and transfer options, based on the order',
      'Carhartt, Bayside, Gildan, Port & Company — brands crews recognize',
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
      "Embroidered polos help project managers, estimators, and client-facing crews look consistent. Bighorn Threads helps you compare polo options and coordinates approved decoration through selected production partners. Choices can include traditional cotton piqué, snag-resistant performance fabric, and moisture-wicking styles. Placement, thread colors, minimums, pricing, and timelines depend on the approved product and partner. Ask about a managed company store if your team needs repeat ordering.",
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
      "Hi-vis apparel can support road, utility, traffic-control, paving, and night-shift crews. The correct class depends on the work and governing requirements. Bighorn Threads helps you compare eligible garments and coordinates approved decoration through selected production partners. Decoration must follow the garment manufacturer's instructions and the program's safety requirements. Product availability, documentation, decoration limits, and timelines are confirmed for each order. Your safety lead should approve the final garment and decoration plan before use.",
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
      "FR workwear may be required where crews face arc-flash or flash-fire hazards. The employer's hazard assessment determines the garment and protection level. Bighorn Threads helps you compare FR options and coordinates approved decoration through selected production partners. Product certifications, ratings, decoration requirements, and care instructions vary by garment. Your safety lead should review the product documentation and decoration plan before ordering.",
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
      "Branded hoodies and sweatshirts give crews a practical layer for cool mornings. Bighorn Threads helps you compare pullovers, full zips, crewnecks, and quarter zips. We then coordinate the approved decoration through selected production partners. Screen print, embroidery, and transfer availability depend on the design, fabric, quantity, and partner. Product availability and timelines are confirmed for each order.",
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
      "Branded jackets can anchor an apparel program for field, office, and event teams. Bighorn Threads helps you compare softshells, insulated jackets, fleece, vests, and rain shells. We coordinate approved decoration through selected production partners. Placement and decoration options depend on the garment's construction. Ask whether a pre-production sample is available for your selected product and partner.",
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
      "Industrial work shirts give mechanical, HVAC, plumbing, fleet, and maintenance crews a consistent uniform. Bighorn Threads helps you compare short-sleeve, long-sleeve, snap-front, and button-front options. We coordinate approved logos and name patches through selected production partners. Available placements, sizing tools, laundry-program compatibility, and replacement timelines depend on the selected product and program.",
    seoBullets: [
      'Red Kap, Cornerstone, Bulwark, Dickies',
      'Short sleeve, long sleeve, snap front, button front',
      'Name patches, certification embroidery, stripe trim',
      'Industrial laundry compatibility for fleet uniform programs',
      'Sizing audit forms for accurate first orders',
    ],
    search: { keywords: 'work shirt uniform industrial mechanic' },
    sort: 'BESTMATCH',
  },
  {
    slug: 'work-pants',
    title: 'Work Pants',
    shortTitle: 'Work Pants',
    blurb: 'Durable work pants, cargos, and dungarees. Reinforced knees and tool pockets for trade professionals.',
    seoIntro:
      "The right work-pant spec depends on the job. Bighorn Threads helps you compare cargos, dungarees, double-knee styles, and rated garments. We coordinate approved alterations and decoration through selected production partners when available. Product ratings, sizing, decoration, and alteration options must be confirmed for the selected garment. Managed company stores can support employee-specific product lists and sizes.",
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
      "Branded caps can keep your logo visible on jobsites and away from work. Bighorn Threads helps you compare structured caps, trucker hats, snapbacks, beanies, and patch options. We coordinate approved decoration through selected production partners. Flat embroidery, puff embroidery, and patch availability depend on the design, cap, quantity, and partner. Ask for current minimums and product availability before planning your order.",
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
      "Branded bags can support crews, travelers, client gifts, and event programs. Bighorn Threads helps you compare tool bags, duffels, backpacks, coolers, and rolling luggage. We coordinate approved decoration through selected production partners. Placement, method, minimums, and timelines depend on the bag and partner. You review the proposed placement before production begins.",
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
    blurb: 'Giveaways, client gifts, and trade show swag. 1.7M products in the catalog — start here if you don\'t know what you want.',
    seoIntro:
      "When you don't know what you want, start here. Bighorn Threads can help you search the SAGE supplier network for promotional products. Options can include pens, notebooks, drinkware, decals, tools, gifts, kits, awards, and event giveaways. Tell us your event, audience, budget, and timeline. We'll narrow the catalog and confirm current products, minimums, pricing, decoration, and production terms.",
    seoBullets: [
      '1.7M+ promotional products via SAGE supplier network',
      'Curated picks based on Las Vegas trade audience',
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
