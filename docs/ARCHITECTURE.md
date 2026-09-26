# Architecture

## Overview

Bighorn Threads is a static marketing website built with Astro 6. Every page is pre-rendered at build time to HTML — no client-side JavaScript required for content rendering. This ensures maximum SEO crawlability and fast load times.

## Rendering Strategy

- **Output:** Static (SSG)
- **Every route** produces a standalone `.html` file
- **No hydration**; forms and the catalog use small inline/vanilla scripts
- **Sitemap** auto-generated via `@astrojs/sitemap`

## Page Structure

```
BaseLayout.astro
├── SEOHead.astro (per-page title, description, OG, JSON-LD)
├── Header.astro (nav, phone, CTA)
├── <slot /> (page content)
└── Footer.astro (links, contact, "A VP Promos brand")
```

## SEO Architecture

- Unique `<title>` and `<meta description>` per page
- `<link rel="canonical">` on every page
- JSON-LD `LocalBusiness` schema on every page
- JSON-LD `FAQPage` schema on pages with Q&A content
- JSON-LD `Article` schema on blog posts
- Open Graph + Twitter Card meta tags per page
- Auto-generated sitemap.xml
- robots.txt with sitemap reference

## Data Flow

Static data lives in `src/data/*.ts` files. Pages import and iterate over this data at build time. The catalog and product pages call `functions/api/sage/*` (Cloudflare Pages Functions) for live SAGE product data; the catalog is for browsing only — nothing can be ordered on the site.

## Lead Forms → GoHighLevel

Every form posts to a Pages Function in `functions/api/`, and all of them run through the shared `_lead.js`:

1. Honeypot, payload limits, Cloudflare Turnstile (fails closed).
2. One `POST /contacts/upsert` with the form answers in GHL custom fields (Quantity Estimate, Product, Quote Message, Trade, Crew Size) plus Original Source / Original Source Detail. Contact source is always `Website`.
3. Only if an SMS consent box was checked: a one-line consent note (A2P proof), written before tags.
4. Tags added separately so existing tags are never replaced.

| Endpoint | Form(s) | Tags |
|---|---|---|
| `contact.js` | /contact, /get-a-quote | `contact-quote-request` |
| `quote-request.js` | product-page quote modal | `contact-quote-request` |
| `lp-optin.js` | /get-started/<vertical>, /offers/safety-hoodie | `company-store-lead` or `safety-hoodie-19`, plus `industry-<vertical>` |
| `demo-optin.js` | /demo | `company-store-lead` |
| `convert-request.js` | /preview | `company-store-lead` + opportunity in Company Store Requested |
| `event-optin.js` | /win | `event-golf-tournament` (server allowlist) |

`sms-opt-in` is added when either SMS box is checked. GHL workflows trigger on these tags, so renaming one breaks the matching automation.

## Tracking

`src/components/TrackingHead.astro` loads GA4 and Meta Pixel (deferred) and sends page views, `generate_lead` / `Lead` on successful form submits, and `phone_click`. On the first page of a session it saves `utm_source`, `utm_medium`, `utm_campaign`, whether a gclid or fbclid was present, the referring domain, and the landing path in `sessionStorage`. JSON forms send these fields via `bighornTracking.source()`; FormData forms get them through the `formdata` event. `_lead.js` turns them into Original Source.

## Deployment

- **Host:** Cloudflare Pages
- **Build command:** `npm run build`
- **Output dir:** `dist`
- **Custom domain:** bighornthreads.com
- **Deploy:** push to `master` → GitHub Actions → Cloudflare Pages

## Design System

The full design system is defined in **`/DESIGN.md`** at the project root — that file is
the source of truth. Aesthetic anchors live in `/_reference/`.

- **Base:** light "Concrete" `#f4f2ee` canvas; navy is demoted to full-bleed photographic
  dark bands + footer only (never flat fill).
- **Accent:** Bighorn Gold `#C19B3D` — single accent.
- **Typography:** Big Shoulders Display (headings), Barlow (body), Barlow Condensed
  (sub/CTA), JetBrains Mono (spec labels, SKUs).
- **Components:** flat surfaces, 1px hairline borders, sharp 0–4px corners, no shadows.
- **Rhythm:** sections alternate Concrete / Paper / photographic-navy backgrounds.
- **Responsive:** Mobile-first, Tailwind breakpoints (sm/md/lg/xl).
