# SAGE Account Profile

Captured 2026-04-20 from steve@vp-promos.com (UID 266315).

## Account identity

| Field | Value |
|-------|-------|
| SAGE Account # | **266315** |
| Company | VP Promos |
| Owner | Steven Dodson |
| Address | 12553 Lylan Ridge St, Las Vegas NV 89138 |
| Phone | 702.349.9878 |
| Email | steve@vp-promos.com |

> Note: "Bighorn Threads" is a DBA under VP Promos. SAGE has no separate account for Bighorn — we use VP Promos' `acctId=266315` for all Connect API calls and skin the responses with Bighorn branding on bighornthreads.com.

## Active services (all renew Jan 17, 2027)

| Item # | Service | Qty | Status |
|--------|---------|-----|--------|
| 313120 | SAGE Workplace (1 user) | 1 | Active |
| 421320 | Website Professional Plus - Dist | 1 | Active |

Implications:
- SAGE Workplace (1 user) → entitles 5,000 API queries/mo for Steve's user
- "Website Professional Plus - Dist" powers vp-promos.com on SAGE hosting. Independent of bighornthreads.com — we don't need this for Bighorn.

## Account Credits (all $0.00)

- PPAI Credit Available
- Account Credit Available
- SAGE Bucks Available

## Payment on file

Card ending... (name: Steven Dodson, Exp 12/2028). Used for SAGE renewals + paid Connect API overages.

## Related identifiers

- **acctId** = 266315 (same as UID, used in Connect API auth)
- **DistID** concept from prior memory ≈ acctId here (same number). Connect API doesn't require a separate "DistID".
- **PPAI Portal** at `https://www.sagemember.com/sm.dll/PPAIPortal?UID=266315` → returns `Restricted area. This area is only available to authorized personnel.` Steve doesn't have PPAI admin access via SAGE, OR VP Promos isn't a PPAI member. Doesn't block anything.
- **SAGE Distributor Logos** at `https://www.sagemember.com/sm.dll/Logos?UID=266315&Type=D` → downloadable distributor member logos (color/grayscale EPS/JPG/PNG) per SAGE branding terms. Can display on bighornthreads.com footer to signal industry membership.

## Account admin-level sub-areas

- **Company Info** — mailing/shipping/billing. Change of company name requires SAGE support (800.925.7243).
- **Account Status** — service list, invoices, credits, payment method.
- **Users** — add/remove/edit SAGE Workplace user licenses (each extra user = their own 5k credit).
- **My Profile** — per-user settings.
- **SAGE Distributor Logos** — asset downloads.

## To-do items on SAGE side for Bighorn launch

1. **Update Connect API Technical Contact** (Configuration tab) — currently blank. Add Charles Power + charles@salesondemand.io so SOD gets SAGE service notifications about API changes/downtime that affect bighornthreads.com.
2. **Consider: second SAGE Workplace user** if we want a separate 5,000/mo credit pool for Bighorn calls (distinct from Steve's usage). Or just use `ref: "bighorn-v1"` on the System/Public calls and let it draw from the 5k System one-time credit + paid overage.
3. **(Optional)** Download "Color Web PNG" of the SAGE Distributor logo to display on bighornthreads.com footer.
