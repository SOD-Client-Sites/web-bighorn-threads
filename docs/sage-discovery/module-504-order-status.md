# SAGE Connect Module 504 — Order Status

**Cost:** Free
**Audience:** Distributors (us). Pull real-time production-order status from any "connected supplier" — regardless of whether the order was placed through SAGE Order Management.

## Request

```json
{
  "serviceId": 504,
  "apiVer": 130,
  "auth": { "acctId": "{acct-id}", "loginId": "{login-id}", "key": "{auth-key}" },
  "sageNum": 50000,
  "orderNum": "123456"
}
```

## Request fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| sageNum | int | Yes | Supplier SAGE # (5-digit supplier ID) |
| supplierAcctId | string(25) | Conditional | Your account/customer number with this supplier. Required unless linked in SAGE Workplace. |
| orderNum | string(25) | No | Specific order. Omit for all. |

## Response — Order Object

| Field | Notes |
|-------|-------|
| internalId | Unique status-record ID |
| orderNum | Supplier's order number |
| poNum | Your PO number |
| sageOrderId | Only if placed via SAGE Order Mgmt |
| expectedShipDate | ISO 8601 UTC |
| lastUpdate | ISO 8601 UTC |
| history | Array of History objects |

### History Object

| Field | Notes |
|-------|-------|
| timeStamp | ISO 8601 UTC |
| internalId | Unique per status packet |
| statusId | See Module 502's status table (10 Received → 80 Complete) |
| comments | string(1000) |
| shipments | Array of Shipment |

### Shipment Object

| Field | Notes |
|-------|-------|
| carrier | FDX/UPS/USPS/DHL/PRL |
| trackingNum | string(25) |

## Error codes

| Code | Description |
|------|-------------|
| 50401 | Supplier SAGE # is required |
| 50402 | Customer number is required (either in request or stored in supplier's personal info in SAGE Workplace) |

## Integration pattern for Bighorn

- On any Bighorn order tied to a SAGE supplier, add a backend poll (every 15 min or webhook-triggered) calling 504 for that `orderNum` + `sageNum`.
- Surface status timeline on customer-facing "Track your order" page: "Accepted → In Production → Shipped (FedEx 1Z...)".
- Trigger SMS/email alerts to the customer on status transitions (Ready for Pickup, Partial Ship, Complete).
- Much more valuable than custom email chasing — this is real supplier data.
