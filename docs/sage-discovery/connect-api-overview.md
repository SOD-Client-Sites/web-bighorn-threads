# SAGE Connect API — Overview

Captured: 2026-04-20 from steve@vp-promos.com (SAGE account 266315).

## What it is

Full-featured set of HTTPS+JSON APIs for bi-directional integration with SAGE services. Modular — enable/disable per module. Designed for developers (HTTPS POST, JSON, parsing). Not for web-design-only users.

## Endpoint

All requests: **`POST https://www.promoplace.com/ws/ws.dll/ConnectAPI`**

- TLS 1.2+ required (TLS 1.0/1.1 refused)
- UTF-8 JSON body; all query params go in the body, not URL
- No query string needed
- Response is also JSON (UTF-8)
- Load balancing + failover handled server-side

## Authentication

Every request needs the auth block:

```json
"auth": { "acctId": 266315, "loginId": "TestUser", "key": "<authKey>" }
```

- `acctId` — SAGE Account # (**266315** for VP Promos/Bighorn)
- `loginId` — SAGE login. **Leave BLANK for Public/System user.** Use named user (`steve@vp-promos.com`) only for admin/backend calls.
- `key` — auth key from Users tab

Keys are per-user. If compromised, revoke immediately. SAGE may suspend/revoke keys on suspicious activity.

## Our credentials

| User | Login ID (admin view) | Login ID (API) | Auth key | Purpose |
|------|----------------------|----------------|----------|---------|
| System/Public | `System` | *(blank)* | `d2c0f162c2bc1c1e0e58f85ffddc9271` | Public-facing bighornthreads.com |
| Steven Dodson | `steve@vp-promos.com` | `steve@vp-promos.com` | `558f2688864982ee0d9e694cee0944be` | Admin/backend only |

> **Rule (from SAGE docs):** "You may NOT use a specific user account for anonymous requests, such as those coming from a public website. The System/Public login is specifically for anonymous or visitor requests."

## Pricing + credits

- Each **SAGE Workplace** user gets a **5,000 query/month credit** for fee-based modules. Credits don't stack, don't carry over.
- **System/Public login** gets a **one-time 5,000-query credit** for testing. After that, paid queries are billed.
- SAGE Workplace user credits cannot be applied to System/Public usage.
- Data obtained may only be used by accounts with an active SAGE Workplace subscription or Supplier Advantage membership.

## Query limits

Per-user monthly cap (applies to fee-based modules). Default = unlimited. Set limits on Users tab. **Hitting a limit shuts off that user's API access.** Use cautiously.

## Current module activity (VP Promos, last full month)

| ID | Module | Cost | Status | Last month |
|----|--------|------|--------|------------|
| 101 | Research List | Free | Enabled | 1 |
| 103 | Product Search | Paid after credits | Enabled | 304 |
| 104 | Basic Product Detail | Paid after credits | Enabled | 92 |
| 105 | Full Product Detail | Paid after credits | Enabled | 28 |
| 107 | Inventory Status | Free | Enabled | 0 |
| 301 | Presentations | Free | Enabled | 0 |
| 501 | Order Forms | Free | Available | — |
| 502 | Order Status Update | Free | Available | — |
| 503 | Order Status Requestors | Free | Available | — |
| 504 | Order Status | Free | Available | — |
| 801 | Credit Card Transaction | Free | Available | — |

## Caching rules

Default recommendation: don't cache; real-time is simpler and always fresh. For high-volume integrations, caching IS allowed but:

1. Refresh at least weekly.
2. If you're a service provider, cache must be stored **per customer** and identified by customer. Do NOT commingle — SPCs and some data are customer-specific.
3. No size limit.
4. You are fully liable for security of cached SAGE data. Theft/misuse = you pay damages.

## Network / performance

Separate back-channel: your server POSTs to `promoplace.com`, waits, then responds to your end-user. Your server's latency to the internet is the critical path. SAGE's side has redundant network, servers, power, 24/7/365 monitoring.

## Configuration (Credentials tab)

Fill in Technical Contact (name, phone, email) — receives SAGE service notifications. Currently not populated for VP Promos. Should add a technical contact for Bighorn deliverability (e.g., Charles + SOD email).

### Integration Partner dropdown

SAGE maintains a preset list of integration partners who can access your account with auth-key visibility:
- Antera
- Aturian, LLC
- be one solutions
- commonsku
- DemandBridge
- Essent Corporation
- EXtendTech
- Midware - NetSuite
- Powerweave
- PromoXcrm
- Shopvox
- ShopWorks
- Sonline LLC
- South Coast Computers
- Web Services Pros

Currently set to **None**. Registering "SOD/Sales On Demand" as an integration partner is an option if we build a productized integration for other distributors.

## Integration partner invite URL

Format: `https://www.sagemember.com/sm.dll/ConnectAPI?PK=<partnerKey>`
Used by integration partners to onboard SAGE distributor customers — gives the partner access without sharing keys manually.

## Standard error codes

| Code | Description |
|------|-------------|
| 10001 | General system error |
| 10002 | Service not available right now |
| 10003 | Invalid host. URL host must be `www.promoplace.com` |
| 10004 | Request must use SSL |
| 10005 | No POST content found |
| 10006 | Invalid or missing API version |
| 10007 | Invalid account number in AcctID |
| 10008 | Incorrect AcctID, LoginID, or Token |
| 10009 | Invalid service ID |
| 10010 | Service not enabled — enable on SAGEmember.com |
| 10011 | Advantage Membership required (suppliers) |
| 10012 | SAGE Workplace subscription required |
| 10013 | User reached paid query limit this month |

Module-specific error codes live in each module doc.

## Analytics (Connect API → Analytics tab)

Per-module charts of activity over past 30 days. Filters: Today / Last 30 / This month / Last month / Two months ago. Top-10 requestors by `ref` field (if you populate it on requests). Current VP Promos usage (this month):

- 101 Research List: 1 request
- 103 Product Search: 318 requests
- 104 Basic Product Detail: 78 requests
- 105 Full Product Detail: 31 requests
- 107, 301: 0

**Action item:** when we build the bighornthreads.com integration, send a distinct `ref` like `"bighornthreads-v1"` so VP Promos usage and Bighorn usage are distinguishable in analytics.

## Getting help

SAGE support: **800.925.7243** or **support@sageworld.com**. They help with Connect API config and platform bugs. They do NOT help with your custom code.
