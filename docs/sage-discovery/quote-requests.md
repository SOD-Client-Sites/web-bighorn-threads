# SAGE Quote Requests

**URL:** `https://www.sagemember.com/ws/ws.dll/ShowCarts?UID=266315&Requests=1`

**State on VP Promos account:** 0 requests. Not being used on SAGE side.

## Schema

| Column | Notes |
|--------|-------|
| Request ID | |
| Timestamp (CT) | Central time |
| Store | Which SAGE store ("VP Promos" only configured) |
| Customer | |
| Fulfillment Status | |
| Items | |

## Implication for Bighorn — this is the big one to build from scratch

B2B construction apparel = quote-driven sales. Most orders go:

1. Prospect fills a quote form (need, qty, in-hands date, decoration)
2. Steve replies with custom pricing + proofs
3. Prospect approves, we collect PO + deposit, ship to production
4. Orders flow through to Cart Orders once approved

Since SAGE has zero history here, we're greenfield. Build natively in the Astro site:

- **Quote Request form** → Supabase `quote_requests` table with status machine (`new → quoted → won → lost → abandoned`)
- Link selected products (by `spc` / `prodEId`) from SAGE Connect search results
- Attach artwork via art-upload form (same fields as SAGE's old Storage Library form: name, company, phone, email, PO#, file)
- Notification to Steve on new request (email / SMS / GHL automation)
- Quote response builder → auto-generate a branded PDF with Bighorn header, pulling supplier pricing via Module 104/105
- Optional: import Steve's SAGE Presentations (Module 301) as "Quote Templates" to seed responses faster

This is the core value-add of bighornthreads.com over the generic vp-promos.com SAGE site. Worth over-investing in here.
