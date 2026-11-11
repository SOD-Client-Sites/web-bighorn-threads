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
  guide?: {
    heading: string
    answer: string
    columns: [string, string]
    rows: { label: string; detail: string }[]
    faqs: { q: string; a: string }[]
    link?: { href: string; label: string }
  }
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
    guide: {
      "heading": "How do you choose custom work t-shirts for a crew?",
      "answer": "Start with how the shirt will be used. Heavyweight cotton holds up to jobsite wear, poly-cotton blends shrink less and dry faster, and long sleeves help with sun. Bighorn Threads matches the blank to the job, then recommends screen printing or a transfer based on your design and count.",
      "columns": [
        "Fabric or style",
        "Best for"
      ],
      "rows": [
        {
          "label": "Heavyweight cotton",
          "detail": "Daily jobsite wear. Takes a screen print well and softens with washing."
        },
        {
          "label": "Poly-cotton blend",
          "detail": "Less shrinking and wrinkling. Good for crews who wash shirts often."
        },
        {
          "label": "Ringspun cotton",
          "detail": "A softer feel for events, retail-style merch, and giveaways."
        },
        {
          "label": "Long sleeve or pocket tee",
          "detail": "Sun exposure, and crews who carry pens, gauges, or glasses."
        }
      ],
      "faqs": [
        {
          "q": "Is screen printing or DTF better for crew shirts?",
          "a": "Screen printing usually suits larger runs of one design with a few colors. DTF transfers suit full-color art, small runs, or a different name on each shirt. Your quote recommends a method based on the art and the count."
        },
        {
          "q": "Will cotton t-shirts shrink?",
          "a": "Cotton can shrink in hot washes and dryers. Preshrunk cotton and poly-cotton blends shrink less. Washing cold and drying on low helps any printed shirt last longer."
        },
        {
          "q": "Which t-shirt brands can I choose from?",
          "a": "Common picks include Carhartt, Bayside, Gildan, and Port & Company. Availability is confirmed for the brand, color, and sizes you choose before the order is placed."
        }
      ],
      "link": {
        "href": "/custom-screen-printed-shirts/",
        "label": "custom screen-printed shirts"
      }
    },
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
    guide: {
      "heading": "How do you choose embroidered polo shirts for a team?",
      "answer": "Pick the fabric by where the polo gets worn. Cotton piqué looks traditional for the office and client meetings, and performance polyester wicks sweat and holds its color outdoors. Bighorn Threads helps you pick a brand and fabric, gets your logo digitized, and sends a proof showing stitch placement before production.",
      "columns": [
        "Fabric",
        "Best for"
      ],
      "rows": [
        {
          "label": "Cotton piqué",
          "detail": "Office staff, sales, and front desk. Classic look that breathes indoors."
        },
        {
          "label": "Performance polyester",
          "detail": "Field supervisors and outdoor work. Wicks moisture and resists fading."
        },
        {
          "label": "Snag-resistant knit",
          "detail": "People working around tools, rebar, or hook-and-loop straps."
        },
        {
          "label": "Cotton-poly blend",
          "detail": "Mixed use. Shrinks less than cotton and feels softer than full polyester."
        }
      ],
      "faqs": [
        {
          "q": "Where should the logo go on a polo?",
          "a": "Left chest is standard and reads well across a table. Some teams add a sleeve or back-yoke logo. The proof shows the exact size and placement before anything is stitched."
        },
        {
          "q": "Does embroidery work on performance polos?",
          "a": "Yes. Thin performance knits need the right backing and stitch density so the fabric does not pucker around the logo. That is set up when your logo is digitized for the garment."
        },
        {
          "q": "Which polo brands can I choose from?",
          "a": "Port Authority, Nike, Cutter & Buck, OGIO, and Carhartt are common choices. Color and size availability is confirmed for the style you pick."
        }
      ],
      "link": {
        "href": "/custom-polo-shirts/",
        "label": "custom polo shirts"
      }
    },
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
    guide: {
      "heading": "How do you choose custom hi-vis shirts and vests for a crew?",
      "answer": "Start with the ANSI/ISEA 107 class your safety lead requires for the work zone. Class 2 covers most roadway and utility work, and Class 3 adds sleeves and more reflective material for high-speed traffic and night work. Bighorn Threads finds rated garments and plans the logo around the reflective material.",
      "columns": [
        "ANSI/ISEA 107 class",
        "Typically used for"
      ],
      "rows": [
        {
          "label": "Type O, Class 1",
          "detail": "Off-road work away from traffic, such as warehouses and parking lots."
        },
        {
          "label": "Type R, Class 2",
          "detail": "Roadway and utility work near traffic. The most common class for vests and shirts."
        },
        {
          "label": "Type R, Class 3",
          "detail": "High-speed traffic, bad weather, or night work. Requires sleeves."
        },
        {
          "label": "Class E",
          "detail": "Pants, shorts, or bibs. Worn with a Class 2 top, the pair rates as Class 3."
        }
      ],
      "faqs": [
        {
          "q": "Can you put a logo on a hi-vis vest?",
          "a": "Usually, as long as the logo does not cover or reduce the required background and reflective material. Placement follows the garment maker's instructions, and the proof shows where the logo sits."
        },
        {
          "q": "What is the difference between Class 2 and Class 3 hi-vis?",
          "a": "Class 3 requires more background and reflective material than Class 2 and must have sleeves, so the wearer is visible from more angles and farther away. Your safety lead decides which class the job needs."
        },
        {
          "q": "Is FR hi-vis available?",
          "a": "Yes. Some garments carry both an ANSI 107 class and a flame-resistant rating. Bighorn Threads can source them, and your safety lead confirms which ratings the job requires."
        }
      ],
      "link": {
        "href": "/custom-safety-vests/",
        "label": "custom safety vests"
      }
    },
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
    guide: {
      "heading": "How do you choose FR clothing for electrical and flash-fire work?",
      "answer": "Start with your hazard assessment. Arc-flash work under NFPA 70E calls for arc-rated clothing with a rating at or above the expected incident energy. Flash-fire exposure calls for garments certified to NFPA 2112. Bighorn Threads finds garments that meet the required rating and checks decoration against the maker's instructions.",
      "columns": [
        "Standard or rating",
        "What it covers"
      ],
      "rows": [
        {
          "label": "NFPA 70E",
          "detail": "Workplace electrical safety. Sets when arc-rated clothing is required and at what level."
        },
        {
          "label": "NFPA 2112",
          "detail": "Certification for garments that protect against short-duration flash fires."
        },
        {
          "label": "ASTM F1506",
          "detail": "Performance standard for arc-rated fabric used in electrical work clothing."
        },
        {
          "label": "Arc rating (ATPV or EBT)",
          "detail": "The cal/cm² value on the label. It must meet or exceed the assessed hazard."
        }
      ],
      "faqs": [
        {
          "q": "Can you embroider a logo on FR clothing?",
          "a": "Often, but the thread, backing, and any patch must be compatible with the garment's FR rating. Many makers list approved decoration methods. Bighorn Threads checks that guidance before quoting."
        },
        {
          "q": "Is FR clothing the same as arc-rated clothing?",
          "a": "Not always. Arc-rated clothing is flame-resistant, but not all flame-resistant clothing has an arc rating. For electrical work, check the label for an arc rating in cal/cm²."
        },
        {
          "q": "Which FR brands are available?",
          "a": "Bulwark FR, Carhartt FR, and Wrangler FR are common choices. Current ratings and documentation are confirmed for the specific product before you order."
        }
      ],
      "link": {
        "href": "/blog/nfpa-70e-fr-shirts-vegas-electricians/",
        "label": "NFPA 70E FR shirts for electricians"
      }
    },
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
    guide: {
      "heading": "How do you choose custom hoodies and sweatshirts for a team?",
      "answer": "Decide on weight and style first. Midweight fleece around 8 to 9 oz works most of the year, and heavyweight fleece around 12 oz suits cold mornings. Then match the decoration to the art. Bighorn Threads recommends screen printing for big back prints and embroidery for small chest logos.",
      "columns": [
        "Decoration",
        "Best for"
      ],
      "rows": [
        {
          "label": "Screen printing",
          "detail": "Large back prints and bigger runs of one design."
        },
        {
          "label": "Embroidery",
          "detail": "Small left-chest logos. Holds up well on fleece."
        },
        {
          "label": "DTF transfer",
          "detail": "Full-color art, small runs, or individual names."
        },
        {
          "label": "Embroidery plus print",
          "detail": "A stitched chest logo with a printed back for crew wear."
        }
      ],
      "faqs": [
        {
          "q": "Should I order pullover or zip hoodies?",
          "a": "Pullovers give a clean front for a big print. Full zips go on easily over a work shirt and are popular with crews. Quarter zips look more polished for office staff."
        },
        {
          "q": "Does embroidery work on hoodies?",
          "a": "Yes. Fleece holds embroidery well, especially left-chest logos. Large back designs are usually better screen printed, because dense stitching gets heavy and stiff."
        },
        {
          "q": "Which hoodie brands are available?",
          "a": "Carhartt, Champion, Gildan, Independent Trading, and Port & Company are common choices. Color and size availability is confirmed for your order."
        }
      ],
      "link": {
        "href": "/custom-hoodies/",
        "label": "custom hoodies"
      }
    },
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
    guide: {
      "heading": "How do you choose branded jackets and outerwear for a team?",
      "answer": "Match the jacket to the weather and the work. Softshells handle wind and light rain, insulated jackets handle cold mornings, and fleece and vests work as layers. Bighorn Threads checks where seams, zippers, and waterproof coatings leave room for a logo, then shows the placement on a proof before production.",
      "columns": [
        "Style",
        "Best for"
      ],
      "rows": [
        {
          "label": "Softshell",
          "detail": "Wind and light rain. Stretchy and easy to work in."
        },
        {
          "label": "Insulated jacket",
          "detail": "Cold early starts and winter work."
        },
        {
          "label": "Fleece",
          "detail": "A mid-layer or a jacket for mild days. Takes embroidery well."
        },
        {
          "label": "Vest",
          "detail": "Core warmth with free arms for tool work."
        },
        {
          "label": "Rain shell",
          "detail": "Wet weather. Decoration must not break the waterproofing."
        }
      ],
      "faqs": [
        {
          "q": "Where can a logo go on a jacket?",
          "a": "Left chest, back yoke, and sleeve are the usual spots. Seams, pockets, and zippers limit size and placement, so the proof shows exactly where the logo fits."
        },
        {
          "q": "Can you embroider a waterproof jacket?",
          "a": "Needle holes can let water through a waterproof shell, so many rain jackets get a heat-applied logo instead. The decoration method is confirmed for the specific jacket."
        },
        {
          "q": "Which outerwear brands are available?",
          "a": "Carhartt, Port Authority, Helly Hansen, Eddie Bauer, and The North Face are common picks. For larger orders, ask whether a pre-production sample is available."
        }
      ],
      "link": {
        "href": "/custom-quarter-zips-jackets/",
        "label": "custom quarter-zips and jackets"
      }
    },
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
    guide: {
      "heading": "How do you choose custom work shirts for a trade crew?",
      "answer": "Choose by the work and the washing. Poly-cotton twill resists wrinkles and stains for HVAC, plumbing, and fleet crews, and cotton breathes better in heat. Bighorn Threads adds logos and name patches, and if your shirts go through industrial laundry, picks a garment and decoration that can take it.",
      "columns": [
        "Feature",
        "Why it matters"
      ],
      "rows": [
        {
          "label": "Poly-cotton twill",
          "detail": "Holds color and resists wrinkles through frequent washing."
        },
        {
          "label": "Snap front",
          "detail": "No buttons to scratch vehicles or catch on equipment."
        },
        {
          "label": "Short or long sleeve",
          "detail": "Short for heat and indoor work. Long for sun and light arm protection."
        },
        {
          "label": "Name patch or stitched name",
          "detail": "Customers know who is at the door."
        }
      ],
      "faqs": [
        {
          "q": "Can each shirt have the employee's name?",
          "a": "Yes. Name patches or embroidered names can be added per employee alongside the company logo. A size and name list is collected before the order goes into production."
        },
        {
          "q": "Will the logo survive industrial laundry?",
          "a": "It depends on the garment and the decoration. Embroidery usually holds up best. Tell us about your laundry service up front so the shirt and decoration are chosen for it."
        },
        {
          "q": "Which work shirt brands are available?",
          "a": "Red Kap, Cornerstone, Bulwark, and Dickies are common choices for trade crews. Availability is confirmed for your styles and sizes."
        }
      ],
      "link": {
        "href": "/custom-work-shirts-las-vegas/",
        "label": "custom work shirts in Las Vegas"
      }
    },
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
    guide: {
      "heading": "How do you choose work pants for a trade crew?",
      "answer": "Pick work pants by how the crew moves. Cargo pants carry tools, double-knee pants stand up to kneeling, and FR-rated pants are for crews whose safety lead requires them. Bighorn Threads helps you sort out styles and sizes, and tells you whether a given pair can take a logo.",
      "columns": [
        "Style",
        "Best for"
      ],
      "rows": [
        {
          "label": "Cargo",
          "detail": "Crews who carry a tape, phone, and small tools."
        },
        {
          "label": "Double-knee",
          "detail": "Flooring, framing, plumbing, and anyone who kneels a lot."
        },
        {
          "label": "Carpenter or dungaree",
          "detail": "Hammer loop and utility pockets for general trades."
        },
        {
          "label": "FR-rated",
          "detail": "Electrical and flash-fire work where FR clothing is required."
        }
      ],
      "faqs": [
        {
          "q": "Can you put a logo on work pants?",
          "a": "Sometimes. A small logo near the hip or on a pocket is common, but heavy canvas and pocket seams limit placement. Many teams brand the shirts and leave the pants plain."
        },
        {
          "q": "Which work pant fabric lasts longest?",
          "a": "Heavy cotton duck and canvas resist abrasion best. Twill blends are lighter and resist stains and wrinkles. Stretch fabrics help crews who climb and kneel."
        },
        {
          "q": "How do you get pant sizes right for a crew?",
          "a": "Collect waist and inseam for each person before ordering. Fit varies by brand, so a size list per employee cuts down on reorders."
        }
      ],
      "link": {
        "href": "/company-uniforms/",
        "label": "company uniforms"
      }
    },
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
    guide: {
      "heading": "How do you choose custom embroidered hats for a team?",
      "answer": "Choose the cap style first, then the decoration. Structured caps hold a front logo upright, trucker caps breathe in heat, and beanies cover cold months. Bighorn Threads recommends flat embroidery for most logos, 3D puff for bold letters, and leather or PVC patches for detailed art, then sends a proof.",
      "columns": [
        "Decoration",
        "Best for"
      ],
      "rows": [
        {
          "label": "Flat embroidery",
          "detail": "Most logos. Clean and durable."
        },
        {
          "label": "3D puff embroidery",
          "detail": "Bold, simple letters and shapes with a raised look."
        },
        {
          "label": "Leather patch",
          "detail": "A rugged look. Engraved or debossed detail."
        },
        {
          "label": "PVC patch",
          "detail": "Bright colors and fine detail. Stands up to rain and sweat."
        }
      ],
      "faqs": [
        {
          "q": "Should I order structured or unstructured caps?",
          "a": "Structured caps keep a firm front panel, so logos stand up and look sharp. Unstructured caps sit lower and feel softer, which suits a relaxed or vintage look."
        },
        {
          "q": "Can small text be embroidered on a hat?",
          "a": "Very small text can fill in when stitched. Lettering usually needs to be about a quarter inch tall or more to read cleanly. The proof shows how your logo will stitch."
        },
        {
          "q": "Which cap brands are available?",
          "a": "Richardson, Flexfit, Yupoong, Imperial, and New Era are common choices. Style and color availability is confirmed per order."
        }
      ],
      "link": {
        "href": "/custom-embroidered-hats/",
        "label": "custom embroidered hats"
      }
    },
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
    guide: {
      "heading": "How do you choose branded bags and backpacks for a team or event?",
      "answer": "Start with who gets the bag and how they will use it. Tool bags suit crews, backpacks and duffels suit travel and onboarding, and coolers suit jobsites and events. Bighorn Threads helps you compare options and shows the logo placement on a proof, because pockets and seams limit where it fits.",
      "columns": [
        "Bag type",
        "Best for"
      ],
      "rows": [
        {
          "label": "Tool bag",
          "detail": "Trade crews and new-hire tool gifts."
        },
        {
          "label": "Backpack",
          "detail": "Onboarding kits, office staff, and travel."
        },
        {
          "label": "Duffel",
          "detail": "Travel, gym, and team events."
        },
        {
          "label": "Cooler",
          "detail": "Jobsite lunches, client gifts, and summer events."
        }
      ],
      "faqs": [
        {
          "q": "Is embroidery or printing better on bags?",
          "a": "Embroidery suits canvas, nylon, and premium bags and looks higher end. Screen printing suits large flat panels and bigger giveaway runs. The method depends on the bag material."
        },
        {
          "q": "Where does a logo go on a backpack?",
          "a": "The front pocket is the usual spot. Zippers, seams, and padding limit size, so the proof shows the exact placement before anything is made."
        },
        {
          "q": "Which bag brands are available?",
          "a": "Carhartt, OGIO, Veto Pro Pac, Klein Tools, and Yeti are common choices. Availability is confirmed for the products you pick."
        }
      ],
      "link": {
        "href": "/corporate-swag/",
        "label": "corporate swag"
      }
    },
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
    guide: {
      "heading": "How do you choose branded tumblers and drinkware?",
      "answer": "Match the drinkware to the audience. Insulated tumblers from Yeti, Stanley, or Hydro Flask suit client gifts and employee recognition, and lower-cost bottles suit large event giveaways. Bighorn Threads helps you compare products and decoration: laser engraving for stainless steel, and printing for logos that need color.",
      "columns": [
        "Decoration",
        "Best for"
      ],
      "rows": [
        {
          "label": "Laser engraving",
          "detail": "Stainless steel tumblers. A permanent, one-tone mark that suits gifts."
        },
        {
          "label": "Pad printing",
          "detail": "Simple logos in one or a few colors on curved surfaces."
        },
        {
          "label": "Full-color print",
          "detail": "Multicolor logos, gradients, and photos."
        }
      ],
      "faqs": [
        {
          "q": "Does a laser-engraved logo wash off?",
          "a": "No. Engraving removes the coating to show the metal underneath, so the mark is permanent. The tumbler's own care instructions still decide whether it can go in a dishwasher."
        },
        {
          "q": "What drinkware makes a good client gift?",
          "a": "A recognized brand like Yeti, Stanley, or Hydro Flask with a laser-engraved logo is a common pick, because people keep and use it every day."
        },
        {
          "q": "Can each tumbler have a different name?",
          "a": "Many drinkware items can be personalized with individual names, usually by laser engraving. Whether a specific product supports it is confirmed with your quote."
        }
      ],
      "link": {
        "href": "/custom-yeti-drinkware-las-vegas/",
        "label": "custom Yeti drinkware"
      }
    },
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
    guide: {
      "heading": "How do you choose promotional products for an event or trade show?",
      "answer": "Start with the audience, the budget per person, and the date. Useful items like pens, drinkware, tape measures, and hard hat stickers get kept longer than novelty items. Bighorn Threads searches the SAGE supplier network, narrows it to a short list for your event, and quotes each pick with a decoration mockup.",
      "columns": [
        "Goal",
        "Good picks"
      ],
      "rows": [
        {
          "label": "Trade show traffic",
          "detail": "Pens, stickers, lanyards, and other low-cost giveaways in volume."
        },
        {
          "label": "Client gifts",
          "detail": "Drinkware, bags, and quality tools."
        },
        {
          "label": "Jobsite crews",
          "detail": "Hard hat stickers, tape measures, and branded tools."
        },
        {
          "label": "Recognition and milestones",
          "detail": "Challenge coins, awards, and gift kits."
        }
      ],
      "faqs": [
        {
          "q": "How many giveaways should I order for a trade show?",
          "a": "Plan around expected booth traffic, not total show attendance. Many exhibitors bring a low-cost item for everyone and a better item for qualified leads."
        },
        {
          "q": "What promotional products do contractors keep?",
          "a": "Things they use on the job: tape measures, hard hat stickers, flashlights, and insulated tumblers. Useful tools stay in a truck much longer than novelty items."
        },
        {
          "q": "How do I choose from 1.7 million products?",
          "a": "You do not have to search them all. Tell us the event, audience, budget, and deadline, and Bighorn Threads narrows the catalog to a short list with decoration options for each pick."
        }
      ],
      "link": {
        "href": "/promo-products-las-vegas/",
        "label": "promotional products in Las Vegas"
      }
    },
  },
]

export function findCategory(slug: string): BighornCategory | undefined {
  return bighornCategories.find((c) => c.slug === slug)
}
