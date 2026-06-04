# Architecture

## Overview

Bighorn Threads is a static marketing website built with Astro 6. Every page is pre-rendered at build time to HTML — no client-side JavaScript required for content rendering. This ensures maximum SEO crawlability and fast load times.

## Rendering Strategy

- **Output:** Static (SSG)
- **Every route** produces a standalone `.html` file
- **No hydration** unless a specific component needs interactivity (contact form)
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

Static data lives in `src/data/*.ts` files. Pages import and iterate over this data at build time. No runtime API calls for content.

## Deployment

- **Host:** Cloudflare Pages
- **Build command:** `npm run build`
- **Output dir:** `dist`
- **Custom domain:** bighornthreads.com (TBD)

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
