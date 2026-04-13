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

- **Colors:** Navy (#0b1a2f) + White + Amber (#e8a019)
- **Typography:** Space Grotesk (headings), Inter (body), JetBrains Mono (accents)
- **Pattern:** Dark backgrounds with amber accent highlights
- **Responsive:** Mobile-first, Tailwind breakpoints (sm/md/lg/xl)
