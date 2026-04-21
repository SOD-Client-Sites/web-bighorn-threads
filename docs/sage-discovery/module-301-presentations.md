# SAGE Connect Module 301 — Presentations

**Cost:** Free
**Purpose:** Download SAGE Presentations (client-facing product quote/proposal decks) in structured data format for reuse elsewhere.

> A SAGE Presentation is the artifact a SAGE Workplace user builds for a customer — selected items, pricing, charges, intro, closing, supplier info, feedback log. Think: a structured, data-rich quote. Module 301 exports those quotes.

## Request

```json
{
  "serviceId": 301,
  "apiVer": 130,
  "auth": { "acctId": "{acct-id}", "loginId": "{login-id}", "key": "{auth-key}" },
  "search": { "beginDate": "2021-01-01", "endDate": "2021-06-10" }
}
```

## Search filters (`SearchRec`)

| Field | Type | Notes |
|-------|------|-------|
| beginDate | ISO 8601 | e.g. `2017-07-29` |
| endDate | ISO 8601 | |
| includeAllDrafts | bool | 1 = include drafts even outside date range |
| presId | array of int | Specific presentation IDs to download |
| fulltext | string | Full-text search |
| clientId | int | Filter to one client |
| projectId | int | Filter to one project |
| status | int | 0=Draft, 1=Published, 2=Viewed, 3=Replied, 4=Completed, 5=Rejected |
| reference | string | `reference` field on presentation |

## Response — Presentation Object

Top-level nested structure:

```
Presentation
├── presId
├── general      (acctId, owner, filename, title, reference, date, project, notes, status)
├── client       (clientId, name, company, address, phone, email, taxRate)
├── intro        (introText, introTextHTML, salutation)
├── itemCnt
├── items[]      (product rows — see Items Object below)
├── closing      (closingText, signature block)
├── header/footer/terms   (HTML text blocks)
├── formatting   (currency symbol, row labels)
└── stats        (createTimestamp, lastUpdate, lastAccessed)
```

### Items Object (big — one per line item on the quote)

Every item carries:
- **Product identity**: `presItemId`, `name`, `itemNum`, `category`, `description`, `descriptionHtml`, `prodId`, `spc`, `catPage`, `catYear`
- **Pics**: array of URLs
- **Pricing grid** (6-tier): `qtys`, `catPrcs`, `sellPrcs`, `costs`, `discounts`, `addChgTotals`, `taxTotals`, `totals`, `totalPerPcs`
- **Price adjustments**: `priceAdjustType`, `priceAdjustPercent`, `priceAdjustFixed`, `priceAdjustInfo`, `qtyAdjustInfo`
- **Charges** (each with amount + price code): `setupChg`, `screenChg`, `dieChg`, `plateChg`, `repeatChg`, `toolingChg`, `resetChg`, `copyChg`, `artChg`, `pmsChg`, `proofChg`, `specSampleChg`, `addClrSetupChg`
- **Additional colors**: `addClrRunChgs`, `addClrPriceCode`, `additionalColors`
- **Shipping/custom**: `shipChgs`, `customChgs`, `addChgAllQtyFlags`, `includeAddChgInTotal`, `additionalChargesText`, `otherChgText`
- **Display text**: `colorInfoText`, `imprintInfoText`, `packagingText`, `warningLbl`, `addInfoText`, `priceIncludes`, `notes`
- **Shipping spec**: `shipPoint`, `weightPerCtn`, `cartonSizeL/W/H`, `unitsPerCtn`
- **Supplier** (nested): `sageId`, `company`, `line`, contact, `myCsRep/Phn/Email`, `myCustNum`, `mySuppNote`
- **Feedback** (nested array): `feedbackId`, `author`, `timestampText`, `comment`, `isClient`, `isRead`

## Error codes

| Code | Description |
|------|-------------|
| 30101 | The presentation does not belong to you |

## How we'd use this for Bighorn

Candidate use case: **auto-import Steve's historical SAGE Presentations as "Quote Templates" on bighornthreads.com.**

Workflow:
1. Pull all presentations with status=1 (Published) or 3 (Replied) from the last 2 years.
2. Parse each into a `quote_templates` table: items + pricing tiers + decoration specs + supplier.
3. When a Bighorn prospect submits a quote form matching one of these patterns ("hi-vis vests for 50 workers with screen printing"), the system surfaces the closest template as a starting point for Steve to respond with.
4. Creates compounding value: every quote Steve builds via SAGE can inform future Bighorn quotes.

Alternative: use it as a real-time pull when we build the quote-response interface — Steve builds the presentation in SAGE, we push-pull it into the Bighorn CRM, send the quote email/PDF from our own domain with Bighorn branding.

## Pairs well with: Module 502 (Webhook on presentation update)

Set up webhook on Presentation events to get push updates into our system when Steve builds/updates a presentation.
