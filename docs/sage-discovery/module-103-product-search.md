# SAGE Connect Module 103 — Product Search

**Cost:** Paid after 5000/mo credits
**Purpose:** Search the SAGE product database, return matching products.

## Introduction

The Product Search service is used to perform a product search and return the
results of the search. Implement your own search page, build a JSON request from
user input, pass to the service, and process the stream back.

## Request shape

```json
{
  "serviceId": 103,
  "apiVer": 130,
  "auth": {
    "acctId": "{acct-id}",
    "loginId": "{login-id}",
    "key": "{auth-key}"
  },
  "search": {
    "categories": "Flashlights"
  }
}
```

## Top-level request fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| serviceId | string | Yes | `103` |
| apiVer | int | Yes | `130` |
| auth | Authentication Object | Yes | |
| ref | string(15) | No | Analytics tracking |
| search | SearchRec Object | Yes | |
| endBuyerSearch | bool | No (default false) | Set true if end buyer is performing search (e.g., on public site) |

## Authentication Object

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| acctId | int | Yes | SAGE Account # |
| loginId | string | No | **For Public User, leave blank.** Public user has no monthly credit allowance. |
| key | string | Yes | Auth key from Users tab |

## SearchRec Object — filter fields

| Field | Type | Notes |
|-------|------|-------|
| categories | string | Name or ID, comma-separated for multi |
| keywords | string | |
| colors | string | |
| themes | string | |
| quickSearch | string | Smart-parses as category/keyword/SPC |
| spc | string | SAGE Product Code (10-char, account-unique) |
| itemNum | string | Supplier's item number |
| itemNumExact | bool | false = smart-match partials |
| itemName | string | |
| priceLow | currency | USD |
| priceHigh | currency | USD |
| qty | int | |
| hideOldPricing | bool | true = exclude products with expired pricing |
| verified | bool | |
| recyclable | bool | |
| envFriendly | bool | |
| newProduct | bool | |
| unionShop | bool | |
| esg | string | Comma-separated ESG/diversity flag IDs (use 101 to look up) |
| allAudiences | bool | |
| endUserOnly | bool | true = only products suitable for end-user display |
| popular | bool | |
| fresh | bool | |
| timely | bool | |
| prodTime | int | Min production days (0=any) |
| includeRush | bool | Include rush-service suppliers |
| madeIn | string | 2-digit country code |
| prefGroups | string | Comma-separated preference group IDs |
| suppId | int | Supplier SAGE # (5-digit) |
| lineName | string | Specific supplier line |
| siteCountry | string | 2-digit country code, defaults to account country |
| updatedSince | ISO 8601 UTC | e.g. `"2023-07-27T06:10:00Z"` |
| applyPsSearchRestrictions | bool | Apply PromoSearch restrictions |
| applyPsPriceAdjustments | bool | Apply PromoSearch price adjustments |
| sort | string | See sort options below |
| thumbPicRes | int | Options: 100, 150, 200, 300, 1800 (default 150) |
| extraReturnFields | string | See extra fields below |
| maxTotalItems | int | Default 1000, max 50000 |
| startNum | int | Pagination start (1=first) |
| maxRecs | int | Pagination page size |

## Sort options (`sort`)

- `` (blank) → `BESTMATCH`
- `PRICE` — low to high
- `PRICEHIGHLOW` — high to low
- `BESTMATCH` — by match quality
- `POPULARITY` — most popular first
- `PREFGROUP` — by preference group

## Extra return fields (`extraReturnFields`)

Comma-separated. Adds optional fields to ProductListRec. **Only request what you'll use — these materially increase response size.**

- `ITEMNUM` — product's actual item number
- `CATEGORY` — category name
- `DESCRIPTION` — item description
- `COLORS` — color options
- `THEMES` — themes
- `NET` — extended pricing (net, published catalog, published net)
- `SUPPID` — supplier SAGE #
- `LINE` — line name
- `SUPPLIER` — supplier company name
- `PREFGROUPS` — preference groups
- `PRODTIME` — production time

Example: `"LINE,COMPANY"`

## Response shape

```json
{
  "ok": true,
  "searchResponseMsg": "",
  "totalFound": 1000,
  "products": [
    {
      "prodEId": 771822521,
      "spc": "FBJGK-GMSTH",
      "name": "Mini Flashlight Key Ring W/Push Button Switch And AAA Battery",
      "prc": "0.66 - 1.42",
      "thumbPic": "https://www.promoplace.com/ws/ws.dll/QPic?SN=50000&P=771822521&RS=150"
    }
  ]
}
```

## Response fields

### Response Object

| Field | Type | Notes |
|-------|------|-------|
| ok | bool | true=success |
| errNum | int | Error code on failure |
| errMsg | string | Error message on failure |
| searchResponseMsg | string | |
| totalFound | int | Total matches (may exceed `products.length`) |
| products | array of ProductListRec | |

### ProductListRec

| Field | Type | Notes |
|-------|------|-------|
| prodEId | int | Unique product ID |
| spc | string | SAGE Product Code |
| name | string | Product name |
| itemNum | string | Optional (ITEMNUM extra field) |
| category | string | Optional (CATEGORY) |
| description | string | Optional (DESCRIPTION) |
| colors | string | Optional (COLORS) |
| themes | string | Optional (THEMES) |
| suppId | int | Optional (SUPPID) — **confidential, not for public display** |
| line | string | Optional (LINE) |
| supplier | string | Optional (SUPPLIER) — **confidential** |
| prefGroups | array of PrefGroupRec | Optional (PREFGROUPS) |
| prc | currency/string | Price or range like `"0.66 - 1.42"` |
| net | currency | Optional (NET) — **confidential net price** |
| prodTime | int | Optional (PRODTIME) |
| thumbPic | string | URL to thumbnail image |

### PrefGroupRec

| Field | Type |
|-------|------|
| id | int |
| name | string |

## Thumbnail cache control

`thumbPic` URLs accept optional `C=<minutes>` param for max-age. E.g. `C=2880` = 48h. Default 24h.

## Notes on usage

- Encourage users to fill only needed fields; remove unused tags from the JSON.
- `QuickSearch` auto-detects category/keyword/SPC; `keywords` only searches keywords.
- For public-facing end-user searches, set `endBuyerSearch: true` and `endUserOnly: true`.
- Pagination: use `startNum` + `maxRecs` together.

## Error codes

| Code | Description |
|------|-------------|
| 10301 | Not enough search criteria specified |
| 10302 | Search error |
| 10303 | Too many active searches |
| 10304 | System Error-Search |
