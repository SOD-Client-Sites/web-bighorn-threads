# SAGE Integration Plan — bighornthreads.com

**Status:** Discovery complete 2026-04-20. Ready to build.
**Depends on:** Credentials in `.env`, firecrawl extras (supplier docs, terms of use, new-features) pending.
**Discovery artifacts:** `docs/sage-discovery/*.md` + `C:/Users/charl/sage_docs/` (firecrawl raw).

---

## TL;DR

- Use **SAGE Connect API** (Modules 101, 103, 104, 107 on the public site; 105, 301, 501, 504 on backend) with **System/Public** credentials for anonymous visitor requests and Steve's named-user key for admin work.
- Hard no-gos: **ArtworkZone** (deprecated), **SAGE Payment Processing** (not active, we use Stripe), **PromoSearch embed** (SAGE-hosted only, we're not SAGE-hosted), **VDS** (supplier-only).
- Greenfield (zero SAGE history to migrate): cart, quote requests, form responses, artwork upload.
- Everything we build lives in **Astro + Supabase + CF Pages** with SAGE as the product data source.

---

## 1 · Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  bighornthreads.com  (Astro SSG on Cloudflare Pages)            │
│  ─ catalog / industry / blog / quote / cart / account           │
└──────────┬───────────────────────────────────────────┬──────────┘
           │                                           │
     browser fetch API                         server-side calls
           │                                           │
┌──────────▼──────────┐                     ┌──────────▼──────────┐
│  CF Worker / Pages  │                     │  Supabase           │
│  Functions (proxy)  │                     │  - orders           │
│  - SAGE auth held   │                     │  - quote_requests   │
│    server-side      │                     │  - form_submissions │
│  - per-req ref tag  │                     │  - artwork_uploads  │
│  - response cache   │                     │  - quote_templates  │
│  (KV / R2)          │                     │  - sage_products    │
└──────────┬──────────┘                     │    (optional cache) │
           │                                └─────────────────────┘
           │
┌──────────▼─────────────────────────────────────────────────────┐
│  SAGE Connect API  — POST https://www.promoplace.com/ws/ws.dll/ConnectAPI  │
│  Modules: 101, 103, 104, 105, 107, 301, 501, 504               │
└────────────────────────────────────────────────────────────────┘
```

**Why a proxy (Worker or Pages Function) instead of calling SAGE from the browser:**
- Authentication keys must not ship to the client.
- SAGE requires server-to-server posts. They note the connection is a back-channel while the user waits.
- We can inject the per-request `ref: "bighorn-v1"` for analytics isolation.
- We can cache heavy responses (104 product detail, 103 category listings) in KV or R2 to stay under the 5k free query credit.

**Credentials split:**
- **Public proxy** uses the System/Public key (`d2c0f162c2bc1c1e0e58f85ffddc9271`, `loginId` blank).
- **Admin proxy** (behind Supabase auth) uses Steve's key (`558f2688864982ee0d9e694cee0944be`) for Module 105 (supplier info, net pricing) and 501 (orders).

---

## 2 · Module-by-module usage

| Module | Where called from | Purpose | Cost |
|--------|-------------------|---------|------|
| **101 Research List** | Public proxy | Populate category/theme filters on search page. Cache 7 days. | Free |
| **103 Product Search** | Public proxy | Catalog search / browse / filter. `endBuyerSearch=true`, `endUserOnly=true`. Cache 30 min. | Paid after credits |
| **104 Basic Product Detail** | Public proxy | Product detail page. Cache 1 hour. | Paid after credits |
| **105 Full Product Detail** | Admin proxy | Quote-builder to see net cost + supplier policies. Never cached. | Paid after credits |
| **107 Inventory Status** | Public proxy | Real-time "In stock / Low / Out" badge on PDP. Never cached; TTL handled by SAGE. | Free |
| **301 Presentations** | Admin proxy | Import Steve's existing quotes as `quote_templates` for auto-drafting. Nightly pull. | Free |
| **501 Order Forms** | Admin proxy | Mirror SAGE-managed orders into Supabase for Bighorn ops view. Nightly pull `newOnly=1, markAsExported=1`. | Free |
| **504 Order Status** | Admin proxy | "Track your order" page for customers. Poll every 15 min per live order. | Free |
| 502, 503 | N/A | Supplier-side modules — not applicable. | — |
| 801 | N/A | CC transactions — we use Stripe. | — |

**Credit budget reality:**
- System/Public login has ONE-time 5,000 credit (for testing/demo). After that, every 103/104/105 call costs money.
- Steve's monthly 5k credit recharges but is currently consumed by his existing SAGE Workplace usage (~300 searches, ~92 details/mo).
- **Action:** aggressively cache 103 (search results) and 104 (product detail). Realistic cache hit ratio >80% → keeps us in the free tier for early traffic.

---

## 3 · Data model (Supabase)

```sql
-- Product catalog cache (optional but recommended)
create table sage_products (
  prod_eid        bigint primary key,
  spc             text unique,
  name            text,
  category        text,
  description     text,
  colors          text,
  pics            jsonb,               -- array of { url, caption, hasLogo }
  qty_tiers       int[],               -- [24, 100, 200, ...]
  price_tiers     numeric[],           -- matching prc array
  cat_price_tiers numeric[],
  currency        text default 'USD',
  supp_id         int,                 -- for admin linkage
  is_active       bool default true,
  updated_at      timestamptz not null default now()
);
create index on sage_products using gin (to_tsvector('english', name || ' ' || description));

-- Quote requests (the big Bighorn feature)
create table quote_requests (
  id                uuid primary key default gen_random_uuid(),
  status            text not null default 'new',   -- new, quoted, won, lost, abandoned
  customer_name     text,
  customer_company  text,
  customer_phone    text,
  customer_email    text,
  in_hands_date     date,
  qty_range         text,               -- "50-100"
  industry          text,               -- construction, landscaping, etc.
  notes             text,
  items             jsonb,               -- array of { prod_eid, spc, qty, decoration }
  artwork_upload_id uuid references artwork_uploads(id),
  sage_presentation_id int,              -- filled once Steve builds a SAGE presentation for it
  submitted_at      timestamptz not null default now(),
  responded_at      timestamptz
);

-- Artwork uploads
create table artwork_uploads (
  id            uuid primary key default gen_random_uuid(),
  quote_id      uuid references quote_requests(id),
  filename      text not null,
  storage_path  text not null,          -- supabase storage key
  contact_name  text,
  contact_company text,
  contact_phone text,
  contact_email text,
  po_number     text,
  source_ip     inet,
  status        text default 'uploaded', -- uploaded, reviewing, approved, rejected
  created_at    timestamptz not null default now()
);

-- Cart / orders (Stripe-backed)
create table orders (
  id                  uuid primary key default gen_random_uuid(),
  stripe_session_id   text unique,
  customer_email      text,
  line_items          jsonb,
  total_cents         int,
  status              text default 'pending',
  sage_order_doc_id   int,    -- linked SAGE doc if routed through OMS
  placed_at           timestamptz not null default now()
);

-- SAGE OMS mirror (nightly pull from Module 501)
create table sage_orders (
  doc_id              int primary key,
  form_type           int,
  form_type_text      text,
  order_date          timestamptz,
  supplier_id         int,
  client_id           int,
  po_num              text,
  status              int,
  raw_payload         jsonb,
  mirrored_at         timestamptz not null default now()
);

-- Order status history (pulled from Module 504)
create table sage_order_status (
  order_num           text,
  supp_id             int,
  status_id           int,
  status_ts           timestamptz,
  comments            text,
  carrier             text,
  tracking_num        text,
  fetched_at          timestamptz not null default now(),
  primary key (order_num, supp_id, status_ts)
);

-- Quote templates seeded from Steve's SAGE Presentations (Module 301)
create table quote_templates (
  pres_id             int primary key,
  title               text,
  industry_tag        text,
  items               jsonb,
  pricing_structure   jsonb,
  ingested_at         timestamptz not null default now()
);
```

---

## 4 · Build phases

### Phase 1 — Product catalog online (1–2 weeks)

1. CF Worker `sage-api-proxy` with `/api/sage/{module}` routes.
   - Auth: env vars `SAGE_PUBLIC_KEY`, `SAGE_ADMIN_KEY`, `SAGE_ACCT_ID=266315`.
   - POST `https://www.promoplace.com/ws/ws.dll/ConnectAPI` with injected auth + `ref=bighorn-public-v1`.
   - KV caching: `cat:{listType}` for 7d, `search:{hash}` for 30m, `prod:{prodEid}` for 1h.
2. Astro `/catalog` page calls `/api/sage/search` on server-side render.
3. Astro `/p/[spc]` product detail page calls `/api/sage/product` + `/api/sage/inventory`.
4. Filter dropdowns (category, theme) call `/api/sage/list`.

Deliverable: anyone can browse/search/view SAGE products under Bighorn branding.

### Phase 2 — Quote request pipeline (1–2 weeks)

1. Astro `/quote` page — multi-step form: product selection (search-integrated) → qty/in-hands/industry → contact info → artwork upload → submit.
2. Supabase write to `quote_requests` + `artwork_uploads`.
3. Notification fanout:
   - Email to steve@vp-promos.com (Resend or Supabase email).
   - SMS to Steve (Twilio via trigger.dev).
   - Push to GHL if Bighorn is onboarded as a SOD client.
4. Admin view at `/admin/quotes` behind Supabase auth — Steve sees list, drills into each, adds response.
5. On response, send branded email/PDF back to customer.

Deliverable: Steve receives & responds to quotes through Bighorn, not vp-promos.com.

### Phase 3 — Order tracking (1 week)

1. Once a quote closes, capture SAGE `docId` (or create Bighorn `orders` row).
2. Cron (CF Worker scheduled) polls Module 504 every 15 min per live order → writes to `sage_order_status`.
3. Public "Track your order" page at `/track/[order_num]` — tokenized URL emailed to customer.
4. Supabase realtime → SMS customer on status changes (Accepted → In Production → Partial Ship → Complete).

### Phase 4 — Smart quote templates (~1 week, optional but high leverage)

1. Nightly pull Module 301 Presentations for past 24 months (filter: Published or Replied) → populate `quote_templates`.
2. When a new quote_request matches a template (industry + product category + qty range), auto-draft response using template pricing structure.
3. Steve clicks Approve → branded PDF sent, saves hours per quote.

### Phase 5 — Backend ops mirror (ongoing)

1. Nightly cron pulls Module 501 Order Forms (`newOnly=1, markAsExported=1`) → `sage_orders`.
2. Unified admin dashboard combining: Bighorn quote_requests, Stripe orders, SAGE OMS orders.

---

## 5 · Known limitations / workarounds

| Limitation | Impact | Workaround |
|------------|--------|------------|
| ArtworkZone deprecated | No SAGE artwork mgmt | Build in Supabase Storage + state machine |
| SAGE Payment Processing not active | No SAGE checkout | Use Stripe Checkout / Payment Links |
| PromoSearch embed not portable | Can't reuse vp-promos.com search UI | Build custom Astro search UI on top of Module 103 |
| VDS not available to distributors | No automated virtual mockups | Supplier spec-sample request workflow (see vds-virtual-design-studio.md) |
| SPCs are account-specific | Customer-visible codes tied to VP Promos' account | Hide SPCs publicly; use them server-side only, expose SAGE `prodEid` or Bighorn internal SKU |
| Public-user credits are one-time 5k | Runway before paid tier | Cache aggressively; monitor via Connect API Analytics `ref` tag |
| 5 acctId seen publicly in API analytics | All Bighorn traffic shows under VP Promos | Use `ref: "bighorn-v1"` on every call → separates in Analytics dashboard |

---

## 6 · SAGE-side action items (user to do)

1. **SAGE → Developer APIs → Configuration tab:** fill in Technical Contact with Charles Power + charles@salesondemand.io so SOD gets service outage notifications.
2. **Optional:** add a second SAGE Workplace user so Bighorn has its own 5k/mo credit bucket separate from Steve.
3. **Optional:** download SAGE Distributor Member Color Web PNG logo from `/sm.dll/Logos?Type=D` for site footer.

---

## 7 · Caching, compliance, legal

SAGE's caching rules (from Connect API Getting Started → Caching):

1. Refresh data at minimum weekly.
2. Cached data must be stored **per customer** (here: only our customer data — VP Promos — so single-tenant is fine).
3. No size limits.
4. We are fully liable for security of cached data. Implications:
   - Supabase tables holding SAGE data → RLS policies locked to server-role only or Bighorn admin user.
   - CF KV/R2 caches → no direct public access; served through Worker with access control.
   - Breach = SOD's liability. Consider E&O/cyber coverage if we scale.

Also: data may only be used by accounts with active SAGE Workplace subscription (VP Promos is active through Jan 2027 ✓).

---

## 8 · Open questions (waiting on firecrawl extras)

- **Real-time inventory:** which suppliers actually feed stock data? The "Supplier Realtime Inventory for PromoSearch" feature we saw implies a subset. Firecrawl of `sageworld.com/for-suppliers/` should clarify.
- **New widgets (Idea Search, Flipbook, Countdown):** whether any are JS-embeddable on non-SAGE-hosted sites. Firecrawl of `/events/new-features/` will answer.
- **Legal / Terms of Use:** need to read the full version for caching/distribution details before we go live.

Update this doc once those pages come in.
