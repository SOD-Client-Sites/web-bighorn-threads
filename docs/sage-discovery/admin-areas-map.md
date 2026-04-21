# SAGEmember Admin Areas — Full Map

Every top-level area in the SAGEmember portal and its relevance to bighornthreads.com.

## Top nav

| Area | URL path | Status for VP Promos | Relevance to Bighorn |
|------|----------|----------------------|----------------------|
| Dashboard | `/sm.dll?UID=266315` | Active | Reference only |
| Site/Store Manager | `/sm.dll/Settings?Pg=SiteSelector` | Active (VP Promos site only) | Skip — we're NOT using SAGE hosting |
| Website (www.vp-promos.com) | Multiple `/Settings?Pg=WE*` routes | Active | Reference for Steve's existing site; we're replacing with Astro |
| Form Responses | `/sm.dll/form-archive` | 0 records | Greenfield — build in Supabase |
| Quote Requests | `/ShowCarts?Requests=1` | 0 records | **Priority build** — custom Bighorn quote system |
| Cart Orders | `/ShowCarts?Orders=1` | 0 records | Build in Supabase + Stripe |
| Payment Processing | `/sm.dll/PayProcess` | Not active | Skip — using Stripe |
| ArtworkZone | `/sm.dll/ArtworkZone` | **Deprecated Dec 2023** | Cannot use — build native upload flow |
| Email Accounts | `/sm.dll/GoTab?A=EM` | — | Steve's email, not relevant to site |
| Domain Name Registration | `/sm.dll/DomainReg` | — | We own bighornthreads.com already at GoDaddy |
| Account | `/sm.dll/AcctInfo`, etc. | Active | Reference identity (documented in account-profile.md) |
| Support | `/sm.dll/KB`, `/TicketDashboard` | Active | Reference only |
| Developer APIs | `/sm.dll/ConnectAPI`, `/DevTestBench` | Active | **Primary integration surface** — all module docs captured |

## Website settings (sub-pages under vp-promos.com)

All route through `/sm.dll/Settings?Pg=WE*&UID=266315`. These control the SAGE-hosted vp-promos.com site. We're not using any of them for bighornthreads.com, but they're useful to understand for **feature parity** on our Astro site:

| Page | Pg param | Purpose |
|------|----------|---------|
| Contact Info | WEContact | Company contact info shown on site |
| Offices & Staff | WEStaff | Team bios |
| Access & Security | WEAccess | Password-protect site sections |
| Layout Version | WELayouts | SAGE's layout templates |
| Theme Settings | WEThemes | Colors/fonts |
| Site Settings | WESiteSettings | Global settings |
| Pages & Navigation | WEPages | Custom pages + nav |
| Content Library Settings | WEContentSettings | Widget mgmt |
| File Library | WEFileLibrary | File uploads |
| Specials | WESpecials | Featured products |
| News & Events | WENews | Blog-style updates |
| Blog | WEBlogs | |
| Showrooms | WEShowrooms | Curated product collections |
| Testimonials | WETestimonials | |
| Links | WELinks | Partner/affiliate links |
| Clients | Clients | Client list (CRM-light) |
| Cart Settings | CartSettings | Cart/checkout config |
| PromoSearch Settings | PSSettings | Covered in promosearch-settings.md |
| Search Restrictions | SearchRestrictions | Product filter defaults |
| Stats & Analytics | WEStats | Site analytics |
| Reports | WEReports | |
| Design History | SiteHistory | Change log of SAGE's design updates |

**Features worth replicating on bighornthreads.com:**
- Showrooms / curated collections → industry-specific pages (construction, landscaping, etc.) — already planned
- Testimonials → social proof grid
- Clients → internal CRM, tie into GHL
- News & Events → blog (already exists in the Astro site)

## Account sub-areas (all under `/sm.dll/Account*`)

| Sub-area | URL | Contents |
|----------|-----|----------|
| Company Info | `/AcctInfo` | Name, mailing addr, shipping addr, phone — admin-only edit |
| Account Status | `/AcctStatus` | Active services, invoices, credits, payment method |
| Users | `/GoTab?A=US` | SAGE Workplace user licenses — Steve is only active user |
| My Profile | `/Settings?Pg=UserMyProfileEdit` | Per-user settings |
| SAGE Distributor Logos | `/Logos?Type=D` | Downloadable industry-membership logos (EPS/JPG/PNG, color/gray) |

## Support sub-areas

| Sub-area | URL | Notes |
|----------|-----|-------|
| Knowledge Base | `/sm.dll/KB` | Auth-gated internal KB |
| Tutorials | `/sm.dll/Tutorials` | How-to videos |
| Downloads | `/sm.dll/Downloads` | Resource downloads |
| Tickets | `/sm.dll/TicketDashboard` | Support ticket system |

## Developer APIs

| Tab | URL anchor | Covered in |
|-----|------------|------------|
| SAGE Connect (Services) | `#services` | connect-api-overview.md |
| Getting Started | `#getting-started` | connect-api-overview.md |
| Configuration | `#credentials` | connect-api-overview.md (technical contact + integration partner) |
| Users | `#connect-users` | account-profile.md (keys in .env) |
| Webhooks | `#webhooks` | webhooks.md |
| Analytics | `#analytics` | connect-api-overview.md |
| Developer Test Bench | `/sm.dll/DevTestBench` | Not yet used — deferred until integration starts |

## PPAI Portal

- URL: `/sm.dll/PPAIPortal?UID=266315`
- Status: **Restricted area.** Steve not authorized OR VP Promos is not a PPAI member through SAGE.
- Skipped — doesn't block anything.

## PPPC Portal (Canadian equivalent)

- URL: `/sm.dll/PPPCPortal?UID=266315`
- Canadian promo association portal. Not relevant (Bighorn is US-only).
