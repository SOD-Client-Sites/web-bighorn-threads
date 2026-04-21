# SAGE Connect Webhooks

**What:** Reverse of pull — SAGE pushes data to your endpoint when triggered (e.g., a "Send to X" button in SAGE Workplace).

**Cost:** Per-query pricing of the underlying module still applies.

## Setup flow

1. Connect API → Webhooks tab → Endpoints → **Add Endpoint**
2. Pick a preset **Destination Service** or choose **Custom**
3. For Custom, fill:
   - **Custom Service Name** — shown on the SAGE Workplace button
   - **Custom Endpoint URL** — must be HTTPS with valid cert
   - **Authentication Key** — optional, sent back in the push to verify origin
   - **Custom Service Version** — the module version the endpoint handles (pins schema across version changes)
4. Pick which **event** fires the webhook (e.g., Full Product Detail, Presentations)
5. Toggle **Enabled**
6. Repeat per module

## Security (Custom Webhooks)

Always confirm the POST source IP is in SAGE's range: **`208.215.218.0/24`** (i.e., `208.215.218.1` – `208.215.218.254`). Reject if outside. Optionally validate the `authKey` in the payload against what you configured.

## POST payload shape

SAGE POSTs a JSON body that matches the **module's response payload**, plus an extra `push` object at the root identifying the user/session.

### Push Object (root)

| Field | Type | Notes |
|-------|------|-------|
| acctId | int | SAGE user's account number |
| loginId | string | SAGE user's login ID |
| personId | int | SAGE user's unique ID |
| authKey | string | Optional; the key the receiver configured on setup |
| clientRef | string | Optional; prompted from the user when push is initiated |

### Sample request

```json
{
  "push": {
    "acctId": "{acct-id}",
    "loginId": "{login-id}",
    "personId": "{person-id}",
    "authKey": "{auth-key}",
    "clientRef": "1234"
  }
  // ...fields from the corresponding module's response payload
}
```

## Response we must send back

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| ok | bool | Yes | true=accepted, false=rejected |
| errMsg | string | If `ok=false` | Shown to the user in SAGE Workplace as the error |
| trackingId | string | No | For our troubleshooting |

### Sample response

```json
{ "ok": true, "errMsg": "", "trackingId": "" }
```

## How we'd use this for Bighorn

Likely candidates for webhooks into our stack:

- **Full Product Detail push** → button in SAGE Workplace that pushes a product directly into Bighorn's catalog/CRM (Supabase row) for quoting, without re-searching.
- **Presentations push** → when Steve builds a Total Access presentation for a Bighorn customer, push it to the customer record.
- **Order status update (Module 502)** → if we ever process orders through SAGE Order Management, push status changes back to our admin dashboard.

Endpoint pattern: Cloudflare Worker (same style as mta-sts worker) or a Next/Astro API route behind Supabase auth. IP-allowlist `208.215.218.0/24` in middleware.
