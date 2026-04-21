# SAGE Payment Processing — Not Active

**Status:** Disabled on the VP Promos account. No transactions flow through SAGE.

> "SAGE Payment Processing is not currently active for your account."

## Implication for bighornthreads.com

No legacy payment integration to preserve. Build checkout on Bighorn's terms:

- **Stripe** (recommended) — ties into SOD's existing stack, excellent B2B features (payment links, invoices, ACH, terms).
- **GHL payments** — if Bighorn becomes a client in SOD's GHL sub-accounts.
- **Invoice-only** — for B2B construction accounts, many orders close via PO + NET 30 invoice; Stripe invoices work fine here.

No blocker here — just a greenfield choice.
