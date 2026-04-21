# SAGE Connect Module 501 — Order Forms

**Cost:** Free
**Purpose:** Download full SAGE order-management documents (catalog requests, samples, RFQs, POs, quotes, sales orders, order acks, invoices, pack lists) as structured JSON for importing into other systems.

**For us:** Distributor use — pulls VP Promos' SAGE-managed orders. Bighorn-branded orders that route through SAGE would show here.

## Request

```json
{
  "serviceId": 501,
  "apiVer": 130,
  "auth": { "acctId": "{acct-id}", "loginId": "{login-id}", "key": "{auth-key}" },
  "search": {
    "beginDate": "2022-01-01",
    "endDate": "2022-10-01",
    "newOnly": 1
  }
}
```

## Search filters

| Field | Type | Notes |
|-------|------|-------|
| suppId | int | **Suppliers only** (leave blank for distributors) |
| newOnly | bool | 1 = only orders not previously exported; 0 = all (default). Pairs with `markAsExported`. |
| status | string | Comma-list of status IDs: `0=draft, 1=open, 2=complete, 3=canceled`. E.g. `"1,2,3"` for all but drafts |
| includeDrafts | bool | *(DEPRECATED)* |
| beginDate | ISO 8601 | `"2022-07-29"` |
| endDate | ISO 8601 | |
| docId | array of int | Specific document IDs |
| markAsExported | bool | 1 = mark returned docs as exported |

## Document types (`formType`)

| ID | Type |
|----|------|
| 1 | CATREQ — Catalog Request |
| 2 | SAMPLE — Sample Request |
| 3 | RFQ — Request for Quote |
| 4 | PO — Purchase Order |
| 10 | QUOTE |
| 11 | SALESORDER |
| 12 | ORDERACK |
| 13 | INVOICE |
| 14 | PACKLIST |

## Document shape (`Doc` Object)

```
Doc
├── header        (docId, sageAcctNum, formType, orderDate, supplierId, clientId, custNum, jobNum, poNum, projectId, projectName, salesperson, status)
├── billTo        (company, contactName, addr1/2, city, state, zip, country, phone, fax, email)
├── shipTo        (+ residentialAddress, dropShip)
├── client        (company, accountNumber) — only if clientId populated
├── supplier      (supplierId, company, contactName, addr, city/state/zip/country, phone, fax, email)
├── payment       (payTerms, payMethod, isPaid, commissionable)
├── shipping      (shipMethod, shipAcct, shipDate, inHandsDate, rush)
├── itemCnt
├── items[]       (see below)
├── totals        (subtotal, discount, addChg, shipping, tax, grandTotal; plus taxExempt, shippingTbd)
├── fileCount
├── filesPickupUrl        (URL to full file listing page)
├── files[]       (filename, description, fileSizeKb, status, pickupUrl)
├── notes         (supplierMemo, factoryMemo, clientMemo, internalMemo)
└── delivery      (destination, deliveredTimeStamp, confirmationRequested)
```

### Item Object (per line)

Core: `itemId`, `type`, `qty`, `itemNum`, `suppItemNum`, `prodEId` (only for SAGE-db products), `description`, `color`, `size`, `imprint`, `price`, `extPrice`, `cost`, `extCost`, `notes`, `shipChg`.

Rolled-up additional charges: `additionalChargesRec` with per-charge amount + cost pairs for setup/screen/die/plate/tooling/reset/repeat/copy/pms/art/spec/proof/addClrSetup/addClrRun + two `customChg` slots.

Summary: `addChgTotalPrice`, `addChgTotalCost`, `addClrCnt`, nested `supplier`.

## File pickup

Each Doc includes a `filesPickupUrl` for a human-readable page and `files[].pickupUrl` for direct file download. Pattern: `http://www.sageorders.com/<docId>/<acctId>/files.htm`.

## Error codes

| Code | Description |
|------|-------------|
| 50101 | Please enter some search criteria |
| 50102 | A supplier SAGE # is required |
| 50103 | The supplier SAGE # does not belong to this account |

## Integration pattern for Bighorn

- Nightly cron: pull `newOnly=1, markAsExported=1` for previous day's orders → store in Supabase `sage_orders` table.
- Surface Bighorn-branded orders (separate `clientId` or `projectName` filter) on Steve's internal Bighorn admin dashboard.
- Use `filesPickupUrl` to mirror attachments (artwork, POs) into Supabase Storage for permanence — SAGE's file URLs may expire.
