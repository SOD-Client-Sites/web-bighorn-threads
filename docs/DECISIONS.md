# Decision Log

| Date | Decision | Reasoning | Alternatives Considered |
|------|----------|-----------|------------------------|
| 2026-04-13 | Astro 6 SSG over React SPA | SEO audit scored React SPA at 18/100 — Google sees empty div. Astro pre-renders every page to static HTML. Pattern proven on 5+ other SOD client sites. | React + vite-ssg, Next.js SSG |
| 2026-04-13 | Separate site for Bighorn Threads (not on vp-promos.com) | Niche authority beats general catalog for local SEO. Dedicated construction site outranks general promo site for trade queries. Same playbook as Carhartt vs Carhartt Company Gear. | Subfolder on vp-promos.com, subdomain |
| 2026-04-13 | Navy + white + amber color scheme | VP Promos uses navy/white. Amber accent adds warmth and construction-industry feel without clashing. Avoids generic SaaS purple/blue. | Orange (too close to safety vest), Gold (too luxury), Green (no brand connection) |
| 2026-04-13 | Space Grotesk over Inter for headings | Inter is the default AI/template font — UI/UX audit flagged it as the #1 credibility issue. Space Grotesk is geometric, industrial, distinctive at heavy weights. | Clash Display (too dramatic), Cabinet Grotesk (limited weights) |
| 2026-04-13 | Cloudflare Pages hosting | Matches all other SOD client sites. Free tier, fast edge delivery, wrangler CLI deploy. | Vercel (not standard stack), Netlify (no advantage) |
