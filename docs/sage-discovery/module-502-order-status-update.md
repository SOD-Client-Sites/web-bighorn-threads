# SAGE Connect Module 502 — Order Status Update

**Cost:** Free
**Audience:** **SUPPLIERS ONLY.** VP Promos is a distributor → **this module does not apply to us** as a caller. But we're likely on the receiving end (suppliers use 502 to push status into SAGE, we pull status via 504).

## What it does

Suppliers push order status changes (received, accepted, in production, partial ship, complete, etc.) to SAGE. Distributors and their clients then see real-time status in SAGE Workplace and can subscribe to email/text/push alerts on changes.

## Status IDs

| ID | Description |
|----|-------------|
| 10 | Order Received |
| 11 | Order Entry Hold |
| 20 | Accepted |
| 30 | Pre-production |
| 40 | General Hold |
| 41 | Credit Hold |
| 42 | Proof Hold |
| 43 | Art Hold |
| 44 | Back Ordered |
| 60 | In Production |
| 70 | In Storage |
| 74 | Ready for Pickup |
| 75 | Partial Ship |
| 80 | Complete |
| 99 | Canceled |
| 999 | Other (add note in `comments`) |

## Shipping carrier codes (for `ShipmentRec`)

`FDX` FedEx • `UPS` UPS • `USPS` US Postal Service • `DHL` DHL • `PRL` Purolator

## For Bighorn

We don't call this module. But we rely on suppliers using it so Module 504 (Order Status) returns data to us. When Steve mentions a supplier "has status updates in SAGE," they're using this API.

## Error codes

| Code | Description |
|------|-------------|
| 50201 | Could not save order status data |
| 50202 | Supplier SAGE # does not belong to specified account |
