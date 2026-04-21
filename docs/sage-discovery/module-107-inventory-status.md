# SAGE Connect Module 107 — Inventory Status

**Cost:** Free
**Purpose:** Real-time inventory status on one or more products — total on-hand + SKU-level breakdown by color/size/shape.

## Request

```json
{
  "serviceId": 107,
  "apiVer": 130,
  "auth": { "acctId": "{acct-id}", "loginId": "{login-id}", "key": "{auth-key}" },
  "products": [
    { "productId": 1578894 }
  ]
}
```

## Request fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| serviceId | string | Yes | `107` |
| apiVer | int | Yes | `130` |
| auth | object | Yes | |
| products | array of Product | Yes | Batch multiple products in one call |

### Product (request)

| Field | Type | Notes |
|-------|------|-------|
| productId | int | SAGE Product ID (best identifier) |
| sageNum | int | Supplier's SAGE # — used if `productId` absent |
| itemNum | string(25) | Supplier's item number — used with `sageNum` if `productId` absent |

> If `productId` is provided, `sageNum`/`itemNum` are ignored.

## Response

```json
{
  "ok": true,
  "products": [
    {
      "productId": 1578894,
      "sageNum": 50000,
      "itemNum": 123456,
      "ok": true,
      "onHand": 473,
      "skus": [
        { "attributes": [{ "typeId": 10, "value": "Red" }], "onHand": 123 },
        { "attributes": [{ "typeId": 10, "value": "Blue" }], "onHand": 350, "memo": "hot item, stock will run out quickly" }
      ],
      "lastUpdated": "2023-12-17T09:34:21Z"
    }
  ]
}
```

### Product (response)

| Field | Type | Notes |
|-------|------|-------|
| productId | int | |
| sageNum | int | |
| itemNum | string(25) | |
| onHand | int | Total; `999999999` = unlimited |
| skus | array of SKU | Per-variant inventory |
| lastUpdated | ISO 8601 UTC | Timestamp of last update |

### SKU

| Field | Type | Notes |
|-------|------|-------|
| attributes | array of Attribute(5) | Variant dims (color/size) |
| onHand | int | |
| onOrder | int | |
| onOrderExpectedDate | ISO 8601 UTC | |
| refreshLeadDays | int | Days to refresh once ordered |
| warehouseId | int | |
| warehouseCountry | string(2) | |
| warehouseZip | string(10) | |
| memo | string(200) | |
| unlimited | bool | true = not stockable |

### Attribute types

| typeId | Meaning |
|--------|---------|
| 10 | Color |
| 11 | Size |
| 12 | Shape |
| 99 | Other (name provided in `name` field) |

## Error codes

| Code | Description |
|------|-------------|
| 10701 | Include at least one product in the request |

## Integration pattern

- **Free module** — no credit cost, safe to hit aggressively.
- Batch many products in one call (`products` array) rather than N calls.
- Surface on PDP: "In stock / Low stock / Out of stock" based on `onHand` + `unlimited` flag.
- For Bighorn apparel, `attributes` will mostly be Color (10) + Size (11). Use SKU-level `onHand` to show size availability on the PDP.
- Cache carefully: stock moves fast. Refresh on PDP load; `lastUpdated` tells you how stale the supplier data itself is.
