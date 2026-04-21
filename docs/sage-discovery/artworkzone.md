# SAGE ArtworkZone — Deprecated

**Status:** Discontinued Dec 31, 2023. No longer available for new orders.
Only the **Storage Library** remains accessible (for now, until SAGE turns it off).

## What was it

A separate SAGE service for managing customer artwork orders — upload, digitize, proof, approve, retrieve. Had Orders, Order Status, Rate Card, Storage Library.

## What still exists

**Storage Library** — a simple file vault at `https://www.sagemember.com/sm.dll/AWLibrary?UID=266315`. Stores files uploaded via the SAGE website's "art upload" form. Each file records:
- Filename + thumbnail
- Description (submitter name, company, phone, email, PO#, source IP — auto-captured from form)
- History log (uploaded, thumbnail added, pick-up ready notice emailed)
- Download link

Current content: 1 file (`3178355100-02S-Logo-Black.png` from Mo Mirza @ McCarthy, Apr 7 2026).

## Implication for bighornthreads.com

We cannot use ArtworkZone. Artwork upload/review/approval on Bighorn's site must be built natively. Options:

- **Cloudflare R2 + simple form on Astro site** — cheap, direct, ties into our stack
- **Supabase Storage + auth/approval table** — integrates with SOD's existing Supabase pattern
- **Embed SAGE's old art-upload iframe** — still works for VP Promos today; may or may not scale for Bighorn branding

Recommended: Supabase Storage + table with status machine (uploaded → under review → approved → sent to production). Emails to steve@vp-promos.com on state changes.

## Reference: VP Promos' existing art upload form

VP Promos' legacy flow (what dumped the one file in Storage Library):

1. Visitor fills form on vp-promos.com: name, company, phone, email, PO#, plus file
2. File uploads to SAGE, thumbnail is generated
3. SAGE emails info@vp-promos.com with "pick-up ready" notice
4. VP Promos team downloads from Storage Library

We should replicate the data captured (same fields) so VP Promos' fulfillment team can work the same way on Bighorn orders.
