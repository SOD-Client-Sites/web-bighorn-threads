# SAGE Connect Module 104 — Basic Product Detail

**Cost:** Paid after credits
**Purpose:** Get detailed product info after a Product Search. **Safe for public website** — does NOT return supplier/confidential info.

> Internal apps typically use **Module 105 Full Product Detail** instead.

## Request

```json
{
  "serviceId": 104,
  "apiVer": 130,
  "auth": { "acctId": "{acct-id}", "loginId": "{login-id}", "key": "{auth-key}" },
  "prodEId": 345733702
}
```

## Request fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| serviceId | string | Yes | `104` |
| apiVer | int | Yes | `130` |
| auth | object | Yes | |
| prodEId | string(11) | Yes | Product ID (from search) OR SPC |
| ref | string(15) | No | Analytics |
| applyPsPriceAdjustments | bool | No | Apply PromoSearch price adjustments |

## Response — Product Object (key fields)

| Field | Type | Notes |
|-------|------|-------|
| prodEId | int | Product ID |
| category | string(30) | |
| lineName | string(1000) | Supplier's line name (public) |
| catPage, catYear | int | Catalog page/year |
| itemNum | string(25) | Supplier's item number |
| spc | string(11) | SAGE Product Code |
| prName | string(100) | Product name |
| description | string(1000) | |
| dimensions | string(100) | |
| keywords | string(200) | |
| colors | string(1000) | |
| themes | string(200) | |
| pics | array of Picture | See below |
| qty | array of int(6) | Qty break tiers |
| prc | array of currency(6) | Price per qty break |
| priceCode | string(6) | e.g. `AAAAA` |
| catPrc | array of currency(6) | Catalog (MSRP) pricing |
| catPriceCode | string(6) | |
| currency | string(3) | ISO code |
| piecesPerUnit | array of int(6) | |
| options | array of Option | |
| madeInCountry, assembledInCountry, decoratedInCountry | string(2) | ISO |
| recyclable, newProduct, envFriendly, audienceWarning, food, clothing | bool | |
| productCompliance, warningLbl, productComplianceMemo | string(1000) | Prop 65 etc. |
| verified | bool | Supplier verified |
| imprintArea, imprintLoc, secondImprintArea, secondImprintLoc | string | |
| decorationMethod | string(50) | |
| decorationNotOffered | bool | |
| setupChg | currency | |
| priceIncludes | string(100) | |
| package | string(50) | |
| weightPerCarton | float | lbs |
| unitsPerCarton, cartonL, cartonW, cartonH | int | inches |
| prodTime | string | "15 to 20 working days" |
| shipPointCountry | string(2) | |
| shipPointZip | int | |
| onHand | int | 999999999 = unlimited |
| skus | array of SKU | Size/color breakdown |
| inventoryLastUpdated | ISO 8601 UTC | |
| comment | string(500) | |
| expDate | ISO 8601 UTC(10) | |
| discontinued, active | bool | Active=false if discontinued or expired |

### Picture Object
| Field | Type | Notes |
|-------|------|-------|
| index | int | |
| url | string(200) | `promoplace.com/ws/ws.dll/QPic?SN=...&P=...&RS=300&I=1` |
| caption | string(100) | e.g. "Red" or "Front view" |
| hasLogo | bool | 1 = sample decoration/logo present |

### Option Object
| Field | Type | Notes |
|-------|------|-------|
| name | string(100) | e.g. "Packaging" |
| pricingIsTotal | bool | |
| values | array of Value | |
| priceCode | string(6) | |

### Value Object
| Field | Type |
|-------|------|
| value | string(100) |
| prc | array of currency(6) |

### SKU Object
| Field | Type | Notes |
|-------|------|-------|
| attributes | array of Attribute (5) | |
| onHand | int | |
| onOrder | int | |
| onOrderExpectedDate | ISO 8601 UTC | |
| refreshLeadDays | int | |
| warehouseId | int | |
| warehouseCountry | string(2) | |
| warehouseZip | string(10) | |
| memo | string(200) | |
| unlimited | bool | true = not stockable |

### Attribute Object
| Field | Type | Notes |
|-------|------|-------|
| typeId | int | |
| name | string(25) | "Color", "Size" |
| value | string | "red", "XL" |

## Picture URL notes

Format: `https://www.promoplace.com/ws/ws.dll/QPic?SN={suppId}&P={prodEid}&RS={size}&I={index}`
- `RS` = bounding box px. Options: 100, 150, 200, 300 (default), 1800
- `C=<minutes>` optional: sets max-age cache-control. Default 24h (1440). Use `C=2880` for 48h.

## Error codes

| Code | Description |
|------|-------------|
| 10401 | Product not found |
| 10402 | Supplier not found based on product ID |

## Sample response

See `samples/104-product-detail-sample.json` for a full Nexbelt buckle example with options, pricing tiers, and multi-image pics array.
