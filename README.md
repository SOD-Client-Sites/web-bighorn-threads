# Bighorn Threads

Visually stunning website for Bighorn Threads — a Las Vegas branded apparel and promotional products company specializing in construction and trades. DBA of [VP Promos](https://www.vp-promos.com).

## Quick Start

```bash
npm install
npm run dev       # http://localhost:4321
```

## Build & Deploy

```bash
npm run build                       # Build to dist/
npx wrangler pages deploy dist      # Deploy to CF Pages
```

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Astro 6 (SSG) |
| Styling | Tailwind CSS 4 |
| Typography | Space Grotesk + Inter + JetBrains Mono |
| Hosting | Cloudflare Pages |
| SEO | Sitemap, JSON-LD schema, per-page meta |

## Folder Structure

```
src/
├── layouts/      # Base layout with SEO, header, footer
├── components/   # Reusable sections and UI
├── pages/        # Each file = a route
├── styles/       # Global CSS + Tailwind
└── data/         # Services, industries, blog posts
public/           # Static assets, images, robots.txt
docs/             # Architecture, decisions, setup
spec/             # Implementation plans
```

## Pages

- `/` — Home
- `/services` — Screen printing, embroidery, apparel, promo
- `/company-stores` — Online ordering portals for contractors
- `/industries` — Construction, electrical, plumbing, HVAC, roofing, solar
- `/about` — Story, team, stats
- `/contact` — Quote request form
- `/blog` — Tips and guides for contractor branding

---

Built with Claude Code by [Sales On Demand](https://salesondemand.io)
