# SAGE Connect Module 101 — Research List

**Cost:** Free
**Purpose:** Downloads a list used for a research query (categories, themes, compliances, esg)

## Request

```json
{
  "serviceId": 101,
  "apiVer": 130,
  "auth": {
    "acctId": "{acct-id}",
    "loginId": "{login-id}",
    "key": "{auth-key}"
  },
  "listType": "categories"
}
```

## Request fields

| Field | Type | Max | Required | Notes |
|-------|------|-----|----------|-------|
| serviceId | string | - | Yes | `101` |
| apiVer | int | - | Yes | `130` for current |
| auth | object | - | Yes | See below |
| listType | string | 30 | Yes | `categories` \| `themes` \| `compliances` \| `esg` |
| ref | string | 15 | No | Analytics/tracking code |

## Auth object

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| acctId | int | Yes | SAGE Account # (`266315` for VP Promos) |
| loginId | string | No | **For Public User, leave BLANK.** Public user gets no monthly credit allowance. |
| key | string | Yes | Auth key from Users tab |

## Response

```json
{
  "ok": true,
  "legalNote": "ALL DATA (C) 2026 SAGE...",
  "items": [
    { "id": 224, "name": "Address Books" },
    { "id": 742, "name": "Adhesives" },
    { "id": 2,   "name": "Air Fresheners" }
  ]
}
```

## Response fields

| Field | Type | Notes |
|-------|------|-------|
| ok | bool | true on success |
| errNum | int | Error code on failure |
| errMsg | string | Error message on failure |
| items | array | List of `{id, name}` |

## Error codes

| Code | Description |
|------|-------------|
| 10101 | Cannot return list |
| 10102 | Invalid list type |
