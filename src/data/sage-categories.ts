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
      "Custom screen-printed and embroidered t-shirts are the workhorse of any Las Vegas construction crew's wardrobe. Bighorn Threads outfits general contractors, framing crews, concrete teams, MEP subs, and service trades with branded tees that survive the Vegas summer, the wash cycle, and the daily abuse of a real jobsite. We stock heavyweight 100% cotton tees from Bayside, Gildan, Hanes, Carhartt, and Port & Company, plus poly-cotton blends for crews that need moisture-wicking performance. Pocket tees for foremen who actually use the pocket, long-sleeve options for sun protection on summer roofs, and ringspun cotton for the office staff who want a softer hand. Every shirt gets digitally proofed before printing, every order ships inside the Las Vegas Valley on qualifying orders, and every job leaves the shop with the same crew name spelled the same way it was last time. Screen printing starts at 24 pieces per design. Under 24? We switch you to DTF transfers — same look, no minimum.",
    seoBullets: [
      'Heavyweight cotton, poly-blend, ringspun — sized so a 3XL fits a 3XL',
      'Screen printing 24+ pieces · DTF transfers under 24 (no setup)',
      'Carhartt, Bayside, Gildan, Port & Company — brands crews recognize',
      'Free Las Vegas Valley delivery on qualifying orders',
      'Rush turnaround as fast as on rush when blanks are in stock',
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
      "Embroidered polo shirts are the go-to for project managers, estimators, superintendents, and client-facing crews who need to look sharp without sacrificing durability. Bighorn Threads embroiders polos from Port Authority, Nike, Cutter & Buck, OGIO, and Carhartt for Las Vegas contractors, real estate developers, and trade companies that show up to client meetings, plan reviews, and pre-bid walks. We carry traditional cotton piqué for the classic look, snag-resistant performance polos for outdoor field work, and moisture-wicking technical polos for crews working in 110-degree summers. Every polo gets a free digital mockup and a written approval step before the embroidery machines start. Standard left-chest logo placement is included; sleeve hits, back yokes, and contrasting thread colors are quoted up front, no surprises. Orders of 24+ qualify for our standard pricing tier, and our company store program lets you preload approved polos with employee names already digitized so new hires get their gear on day one.",
    seoBullets: [
      'Port Authority, Nike, Cutter & Buck, OGIO, Carhartt',
      'Embroidery has no minimum — single piece or 200',
      'Performance, snag-resistant, and traditional cotton piqué',
      'Free digital proofs · written approval before stitching',
      'Company store integration with pre-digitized employee names',
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
      "ANSI 107-compliant hi-vis apparel — branded the right way — is non-negotiable for road crews, utility contractors, traffic control, paving, signal, and any night-shift trade in Las Vegas. Bighorn Threads supplies and decorates hi-vis shirts, vests, and outerwear from ML Kishigo, Bulwark, Radians, OccuNomix, and Tingley to GC subs, NDOT contractors, and municipal crews across Clark County. We know the difference between Class 2 and Class 3, why sleeves matter for night work near 50+ mph traffic, and how to embroider or screen print a logo without compromising the certification. Decoration on hi-vis garments has rules — heat transfer area limits, embroidery placement zones to keep retroreflective tape unbroken — and we follow them so your gear stays compliant on the inspection that actually matters. Lime-yellow and orange-red base colors in stock, with FR hi-vis options for electrical and arc-flash environments. Free digital mockups, written compliance notes attached to every quote, and a dedicated rep who knows Las Vegas trades.",
    seoBullets: [
      'ANSI 107 Class 2 and Class 3 — compliant decoration',
      'ML Kishigo, Bulwark, Radians, OccuNomix, Tingley',
      'Lime-yellow, orange-red, and FR hi-vis stock',
      'Decoration that preserves retroreflective tape integrity',
      'Quotes include written compliance notes for inspections',
    ],
    search: { keywords: 'hi-vis high visibility ANSI reflective safety' },
    sort: 'POPULARITY',
  },
  {
    slug: 'fr-clothing',
    title: 'FR (Flame-Resistant) Clothing',
    shortTitle: 'FR',
    blurb: 'NFPA 70E and NFPA 2112 compliant shirts, pants, and coveralls. For electricians, welders, and oil & gas crews.',
    seoIntro:
      "Flame-resistant (FR) workwear is required PPE for Las Vegas electrical contractors, solar techs, welders, oil and gas crews, and any trade exposed to arc flash or flash fire hazards. Bighorn Threads stocks and decorates NFPA 70E and NFPA 2112 compliant FR shirts, pants, coveralls, and outerwear from Bulwark FR, Carhartt FR, and Wrangler FR — all certified to retain their arc rating after laundering. The decoration matters as much as the garment: standard polyester thread and screen-printed logos can compromise FR certification. We use only certified FR-safe inks and Nomex thread on FR-rated apparel, and every quote includes the arc rating documentation so your safety officer has what they need for the job hazard analysis. Class 1 (cal/cm² 4–8) for general electrical, Class 2 (cal/cm² 8–25) for substation and 480V+ work, and CAT 4 for high-energy environments. We can outfit a single new electrician or a full crew on a fast-track data center build — same FR compliance standards, same documentation, same Las Vegas turnaround.",
    seoBullets: [
      'NFPA 70E and NFPA 2112 compliant — certified after wash',
      'Bulwark FR, Carhartt FR, Wrangler FR',
      'FR-safe ink and Nomex thread only on FR garments',
      'CAT 1 through CAT 4 — arc rating documentation included',
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
      "Branded hoodies and sweatshirts are the most-worn piece of gear on any Las Vegas crew from October through April — early-morning concrete pours, dawn framing starts, and high-desert mountain jobs all start cold. Bighorn Threads decorates pullover hoodies, full-zip hoodies, crewnecks, and quarter-zips from Carhartt, Champion, Gildan, Independent Trading Co, and Port & Company. We screen print, embroider, and apply DTF transfers depending on the volume and the design — full-color art that wouldn't work on a screen press still lands clean as a transfer. Heavyweight 12oz options for the coldest mornings, midweight 9oz for shoulder-season layering, and tech-fleece quarter-zips for office and field staff who want to look the part on a Zoom call too. Every hoodie order over 24 pieces ships free inside the Vegas Valley, and we keep blanks on the shelf in the brands and colorways that move the most so rush orders for new-hire onboarding or trade show season are realistic.",
    seoBullets: [
      'Carhartt, Champion, Gildan, Independent Trading, Port & Company',
      'Pullover, full-zip, crewneck, quarter-zip styles',
      'Screen print, embroidery, and DTF transfer decoration',
      'Heavyweight 12oz and midweight 9oz options',
      'Stock blanks on hand for rush new-hire orders',
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
      "Branded jackets and outerwear are the showpiece of any company's apparel program — they're worn off the clock, on flights to trade shows, at industry events, and the first thing a project manager grabs when a client meeting runs into a January morning walk. Bighorn Threads embroiders softshell jackets, insulated parkas, fleece, vests, and rain shells from Carhartt, Port Authority, Helly Hansen, Eddie Bauer, and The North Face for Las Vegas contractors, developers, and trade leadership. Embroidery is the standard for jackets — left chest, back yoke, sleeve, or all three — and we offer 3D puff embroidery for caps and a flat satin stitch for everything else. Quarter-zip fleece for office layers, insulated parkas for early-morning concrete pours, full-zip softshells for daily field wear, and high-vis rain shells for any crew that works in inclement weather. Every jacket gets a free pre-production sample option for brand-critical orders so you can hold the final product before committing the whole crew.",
    seoBullets: [
      'Carhartt, Port Authority, Helly Hansen, Eddie Bauer, The North Face',
      'Softshell, insulated, fleece, vest, and rain shell styles',
      'Embroidery on chest, back yoke, sleeve, or all three',
      '3D puff and flat satin stitch options',
      'Pre-production samples available for brand-critical orders',
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
      "Industrial work shirts are the uniform of choice for Las Vegas mechanical contractors, HVAC techs, plumbers, fleet drivers, and industrial maintenance crews who need a sharp, durable, identifying garment that holds up to grease, solvents, and heavy wash cycles. Bighorn Threads supplies and embroiders work shirts from Red Kap, Cornerstone, Bulwark, and Dickies — short sleeve, long sleeve, snap front, button front, with optional name patches and stripe trim. We embroider company logos, employee names, and trade certifications (HVAC EPA 608, plumbing journeyman, etc.) directly onto the shirt, and we can integrate with your industrial laundry program if you use one. Standard left-chest logo with right-chest name is the most common spec; we also do back yoke logos for trade fleet visibility. Every order includes a written sizing audit form for new crews so we get the size split right the first time, and we keep a backup stock of the most-ordered sizes (M, L, XL, 2XL) for fast replacements when a shirt gets ruined on the job.",
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
      "Durable work pants are the foundation of every Las Vegas trade uniform — and the spec depends entirely on the work. Bighorn Threads supplies, hems, and decorates work pants, cargos, dungarees, and FR pants from Carhartt, Dickies, Bulwark FR, Wrangler Workwear, and Red Kap for general contractors, electricians, plumbers, HVAC techs, welders, and fleet crews. Reinforced double-knee pants for crews that kneel on concrete and rebar, multi-pocket cargos for trades that carry tools all day, FR-rated pants for arc-flash environments, and traditional dungarees for industrial maintenance. We can hem to spec on bulk orders, embroider logos on the back pocket or thigh, and integrate with company-store programs that link pants to specific employees by name and size. Every quote includes a sizing recommendation based on the trade — we know the difference between what a framer needs and what a service plumber needs, and we won't sell you the wrong garment to hit a price point.",
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
      "Branded caps are the fastest, cheapest, highest-visibility piece of company gear you can put in the field — every crew member wears one every day, and they get worn off the clock too. Bighorn Threads embroiders structured caps, trucker hats, snapbacks, dad hats, beanies, and richardson trucker styles from Richardson, Flexfit, Yupoong, Imperial, and New Era for Las Vegas contractors, developers, and trade companies. We do flat embroidery for crisp logos, 3D puff embroidery for the bold raised look that reads from across a jobsite, and patch hats with PVC, leather, or woven patches for premium giveaway and gift programs. Hard hat stickers (vinyl decals for ANSI Z89-rated hard hats) are also in our wheelhouse — high-tack outdoor vinyl that survives 110-degree dashboards and Vegas summers. Embroidery on caps has no minimum, so you can order one cap for a new estimator or 500 for a trade show.",
    seoBullets: [
      'Richardson, Flexfit, Yupoong, Imperial, New Era',
      '3D puff embroidery, flat embroidery, leather patch, PVC patch',
      'Hard hat stickers — high-tack vinyl for ANSI Z89 hats',
      'No minimum on cap embroidery — order 1 or 500',
      'Same-week turnaround on stock blanks',
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
      "Branded bags, backpacks, and tool bags are the highest-utility item in any company-store program — they get used daily, get carried into client meetings and onto jobsites, and put your logo in front of every coffee shop, airport, and hotel lobby a crew member walks through. Bighorn Threads embroiders and screen prints bags from Carhartt, OGIO, CCM, Veto Pro Pac, Klein Tools, and Yeti for Las Vegas contractors, executives, and trade fleet operators. Tool bags for service techs, weekend duffels for traveling project managers, laptop backpacks for office staff, insulated coolers for client gifts and trade show giveaways, and rolling duffels for crews flying to data center commissioning jobs out of state. Embroidery placement varies by bag type — front panel for backpacks, side panel for duffels, lid for coolers — and we'll send you a digital mockup showing every position before you approve. Order one for a new hire or 100 for a trade show.",
    seoBullets: [
      'Carhartt, OGIO, Veto Pro Pac, Klein Tools, Yeti',
      'Tool bags, backpacks, duffels, coolers, rolling luggage',
      'Embroidery and screen print decoration',
      'Position mockups before every approval',
      'Single-piece orders welcome',
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
      "Branded drinkware is one of the highest-retention promotional categories — a Yeti tumbler with your logo doesn't end up in a junk drawer, it ends up on a desk for ten years. Bighorn Threads laser-engraves and pad-prints insulated tumblers, water bottles, travel mugs, and Stanley quenchers from Yeti, Stanley, Hydro Flask, RTIC, and CamelBak for Las Vegas contractors looking for client gifts, employee-anniversary gifts, jobsite hydration drops, and trade show giveaways. Laser engraving lasts forever, doesn't peel, and reads as premium — it's the standard for high-end gift programs. Pad printing handles full-color art at a lower price point for larger giveaway runs. We also do hydration-station programs for big jobsites: bulk-order branded water bottles for a new project's safety launch and have the entire crew in branded gear by week one. Drinkware decoration has minimums that vary by item (usually 24–48 pieces) and lead times vary by item.",
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
      "When you don't know what you want, start here. Bighorn Threads has access to over 1.7 million promotional products through the SAGE supplier network — pens, notebooks, USB drives, stress balls, hard hat stickers, branded tape measures, custom challenge coins, golf balls and tees, branded tools, executive gift sets, employee onboarding kits, anniversary awards, and every weird trade-show giveaway you've ever seen. We're not just running a catalog — we curate based on what works for Las Vegas trades. Branded multi-tools land harder than stress balls. Custom challenge coins for milestone projects get framed in client offices. Hard hat stickers go on every helmet on a project. Branded tape measures are the single most-kept giveaway at a trade booth. Tell us your event, your audience, your budget, and your timeline, and we'll send back three to five curated options with pricing and decoration mockups withfast. Promo product minimums vary widely (often 24–100 pieces depending on the item) and rush options are available on most items.",
    seoBullets: [
      '1.7M+ promotional products via SAGE supplier network',
      'Curated picks based on Las Vegas trade audience',
      'Challenge coins, hard hat stickers, branded tools, tape measures',
      'Custom event and trade show giveaway programs',
      'fast curated quotes with mockups',
    ],
    search: { keywords: 'promotional giveaway' },
    sort: 'POPULARITY',
  },
]

export function findCategory(slug: string): BighornCategory | undefined {
  return bighornCategories.find((c) => c.slug === slug)
}
