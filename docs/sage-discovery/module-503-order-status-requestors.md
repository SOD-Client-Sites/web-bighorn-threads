# SAGE Connect Module 503 — Order Status Requestors

**Cost:** Free
**Audience:** **SUPPLIERS ONLY.** Not applicable to VP Promos/Bighorn as a distributor.

## What it does

Supplier queries "which of my distributor customers are subscribed to receive order status updates from me?" Response returns a list of `acctNum` + `signupTimestamp` per distributor.

SAGE recommends suppliers just push all order status via 502 regardless of subscribers — but this module exists if a supplier wants to filter push traffic to only subscribed distributors.

## For Bighorn

Not relevant. We're a distributor, not a supplier.

## Error codes

| Code | Description |
|------|-------------|
| 50301 | Supplier SAGE # does not belong to specified account |
