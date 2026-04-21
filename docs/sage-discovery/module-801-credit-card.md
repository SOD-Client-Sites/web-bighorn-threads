# SAGE Connect Module 801 — Credit Card Transaction

**Cost:** Free (module), but **requires active SAGE Payment Processing subscription**
**Status on VP Promos account:** SAGE Payment Processing is NOT active → this module cannot be used.

## What it does

Processes a credit card transaction (sale, credit, void, or capture of prior pre-auth) through SAGE's gateway.

## For Bighorn

Skip. We're using Stripe (or GHL/invoice). No reason to enable SAGE Payment Processing.

## Reference (in case we ever change our mind)

### Transaction types
- `S` — Sale
- `C` — Credit
- `V` — Void
- `F` — Charge a prior pre-auth

### Transaction status
- `U` — Pre-authorization only (check card, don't charge)
- `F` — Fully charge

### Response codes
- `1` — Approved
- `2` — Declined
- `0`, `3` — Failed

### Test cards
- `4111-1111-1111-1111` (Visa) — works with any future expiry
- `5111-1111-1111-1111` (Mastercard)
- `4222-2222-2222-2` (Visa) — deterministic: $1 = approve, $2 = decline, $3 = processing failure

## Error codes

| Code | Description |
|------|-------------|
| 80101 | An error occurred while attempting to process the transaction |
