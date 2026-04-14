# Bighorn Threads

**One-line:** Visually stunning Astro website for Bighorn Threads, a VP Promos DBA targeting Las Vegas construction and trades companies with branded apparel, screen printing, embroidery, and company stores.

**Target user:** Construction company owners, operations managers, and office managers in Las Vegas looking for branded workwear and promotional products.

---

## Tech Stack

- **Framework:** Astro 6.x (static output / SSG)
- **Styling:** Tailwind CSS 4.x via `@tailwindcss/vite`
- **Sitemap:** `@astrojs/sitemap`
- **Hosting:** Cloudflare Pages (via Wrangler)
- **Domain:** bighornthreads.com (TBD)

## Folder Structure

```
src/
├── layouts/        # BaseLayout with SEO head, header, footer
├── components/     # Reusable UI components (Hero, CTA, etc.)
├── pages/          # Astro pages (each = a route)
│   └── blog/       # Blog index + individual posts
├── styles/         # global.css with Tailwind + custom properties
└── data/           # Static data (services, industries, blog posts)
public/
├── images/         # Product photos, hero images, team photos
├── robots.txt      # Crawl rules
├── _headers        # CF Pages cache headers
└── favicon.svg     # Site favicon
docs/               # Architecture, decisions, setup docs
spec/               # Implementation plans
```

## Color Palette

- **Navy Dark:** #0b1a2f (primary backgrounds)
- **Navy Surface:** #111f36 (cards, elevated surfaces)
- **Navy Light:** #1a2d4a (borders, hover states)
- **Gold Accent:** #c8960e (CTAs, highlights, brand accent — matches ram horn color)
- **Gold Light:** #daa520 (hover state, secondary accent)
- **Gold Pale:** #e8b84a (highlights, badges)
- **White:** #ffffff (text on dark)
- **Off-white:** #f1f5f9 (light section backgrounds)
- **Muted:** #94a3b8 (secondary text)

## Typography

- **Headings:** Space Grotesk (bold, industrial feel)
- **Body:** Inter (clean readability)
- **Accents:** JetBrains Mono (stats, badges, phone numbers)

## Key Commands

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Deploy

```bash
npx wrangler pages deploy dist
```

## Coding Conventions

- Astro components use `.astro` extension
- TypeScript for data files
- 2-space indentation
- Descriptive component names (e.g., `HeroSection.astro`, not `Hero1.astro`)
- SEO: every page gets unique title, description, OG tags, and JSON-LD schema
- Images: WebP format, lazy loading below the fold, descriptive alt text

## Rules

- Always check `/spec/plan.md` before starting a new phase
- Every page must have unique meta tags — no shared titles
- JSON-LD LocalBusiness schema on every page
- No client-side rendering — everything is pre-rendered HTML
- Phone numbers use `tel:+17252356196` format (E.164)
- "A VP Promos brand" in footer (entity connection)
