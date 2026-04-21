# SAGE Connect Module 105 — Full Product Detail

**Cost:** Paid after credits
**Purpose:** Full product detail INCLUDING supplier info. **Admin/backend use only** — contains confidential `net` pricing and full supplier contact.

> For public-facing website use Module 104 instead. 105 adds `net` cost, supplier company, contact, email, pricing charges.

## Request

```json
{
  "serviceId": 105,
  "apiVer": 130,
  "auth": { "acctId": 266315, "loginId": "steve@vp-promos.com", "key": "<admin-key>" },
  "prodEId": 345733702,
  "includeSuppInfo": 1
}
```

## Request fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| serviceId | string | Yes | `105` |
| apiVer | int | Yes | `130` |
| auth | object | Yes | Use named-user account (admin), not System |
| ref | string(15) | No | Analytics |
| prodEId | string | Yes | Product ID or SPC |
| includeSuppInfo | bool | No | `1` = include full Supplier object in response |
| applyPsPriceAdjustments | bool | No | Apply PromoSearch price adjustments |

## Response

Returns the Product Object with all fields from Module 104 PLUS:

### Additional pricing/charges (105-only)

| Field | Type | Notes |
|-------|------|-------|
| net | array of currency(6) | **Confidential cost pricing per qty break** |
| priceAdjustMsg | string(100) | Supplier-level price-adjust message |
| setupChg, setupChgCode | currency / string(1) | Setup charge + price code |
| repeatSetupChg, repeatSetupChgCode | currency / string(1) | |
| screenChg, screenChgCode | currency / string(1) | |
| plateChg, plateChgCode | currency / string(1) | |
| dieChg, dieChgCode | currency / string(1) | |
| toolingChg, toolingChgCode | currency / string(1) | |
| addClrChg, addClrChgCode | currency / string(1) | Additional color setup |
| addClrRunChg, addClrRunChgCode | array of currency(6) / string(1) | Additional color run charges |
| options[].values[].net | array of currency(6) | Confidential net on each option value |
| supplier | Supplier Object | Only when `includeSuppInfo=1` |

### Supplier Object (confidential — admin use only)

| Field | Notes |
|-------|-------|
| suppId, coName, lineName, contactName | Basic identity |
| mAddr, mCity, mState, mZip, mCountry | Mailing address |
| sAddr, sCity, sState, sZip, sCountry | Shipping address |
| tel, tollFreeTel, fax, tollFreeFax | Phone / fax |
| email, salesEmail, orderEmail, sampleOrderEmail, customerServiceEmail | Comms |
| web | URL |
| unionShop, esg | Flags |
| artContactName, artContactEmail | Art contact |
| catYear, catExpOn, catCurrency | Catalog |
| comment, prefGroupIds, prefGroups | Misc |
| persCsRep, persCsRepPhn, persCsRepEmail, persCustNum, persSuppNote | **Personal CS info** — editable from SAGE Workplace per-user |
| generalInfo | Nested GeneralInfo Object (see below) |

### GeneralInfo Object (supplier-level policies)

| Field | Notes |
|-------|-------|
| artInfo, copyChangeInfo | |
| imprintMethods, imprintColors | |
| proofInfo | How proofs work |
| pmsCharge, pmsChargeCode | PMS color charge |
| copyChangeCharge, copyChangeChargeCode | |
| artChargeHr, artChargeHrCode, artChargeJob, artChargeJobCode | Art time charges |
| proofCharge, proofChargeCode | |
| specSampleCharge, specSampleChargeCode | |
| orderChangeInfo, orderCancelInfo | Policy text |
| lessMinInfo, overrunInfo | Min / overrun policies |
| shipInfo, termsInfo, warrantyInfo, returnsInfo, coOpInfo, otherInfo | Policy text |

## Sample response (excerpt — Nexbelt Fast Eddie buckle)

```json
{
  "product": {
    "prodEId": 345733702,
    "prName": "Custom Logo Fast Eddie (Golf) Buckle...",
    "qty": ["24", "100", "200", "250", "350"],
    "prc": ["74.70", "67.50", "62.10", "58.50", "56.70"],
    "catPrc": ["83.00", "75.00", "69.00", "65.00", "63.00"],
    "net": ["41.50", "37.50", "34.50", "32.50", "31.50"],
    "supplier": {
      "suppId": 51530,
      "coName": "Nexbelt LLC",
      "contactName": "Ross Rodriguez",
      "email": "outdoorsales@nexbelt.com",
      "generalInfo": {
        "termsInfo": "Due on Receipt or Net 30 Terms based on volume",
        "shipInfo": "Ship from Rancho Cucamonga, CA 91730",
        "proofInfo": "Free virtual mock ups with a high resolution or vector file. All other files will have a $25 fee to make proofs."
      }
    }
  }
}
```

## Error codes

| Code | Description |
|------|-------------|
| 10501 | Product not found |
| 10502 | Supplier not found based on product ID |

## Integration pattern for Bighorn

- Use **104** on the public site. It exposes pub-safe pricing (`prc`, `catPrc`) and no supplier info.
- Use **105** ONLY from admin/backend when Steve or operations need to see `net` cost for margin calc, or to pull supplier policies for a quote response (e.g., pricing includes "setup + screen + PMS change").
- Both can pull the same product by `prodEId` or `spc`; cache the 104 response for public views, only hit 105 on demand.
