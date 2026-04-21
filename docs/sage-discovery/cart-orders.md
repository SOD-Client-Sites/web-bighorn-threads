# SAGE Cart Orders

**URL:** `https://www.sagemember.com/ws/ws.dll/ShowCarts?UID=266315&Orders=1`

**State on VP Promos account:** 0 carts. Not being used.

## What it is

Tracks shopping-cart activity on SAGE-hosted websites (like vp-promos.com). Each cart record has:

| Column | Notes |
|--------|-------|
| Cart ID | |
| Timestamp (CT) | Central time |
| Store | Which SAGE store (only "VP Promos" configured) |
| Customer | |
| Payment Status | |
| Fulfillment Status | |
| Items | |
| Total | |

## Implication for Bighorn

- Nothing to migrate — no historical cart data.
- For bighornthreads.com we build our own cart (Stripe Checkout or Astro-hosted cart + Supabase orders table).
- Not tied to SAGE Connect API.
