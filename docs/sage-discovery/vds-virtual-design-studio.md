# SAGE Virtual Design Studio (VDS)

**Cost:** Subscription (not active on VP Promos account)
**Audience:** **SUPPLIERS ONLY.** VP Promos is a distributor → VDS-for-Suppliers is **not available to us**.

## The two-sided reality

1. **VDS for Suppliers** — supplier subscribes, gets a JS script to embed on their own site, customers click "Create Virtual Sample" and a modal opens pulling from SAGE's product-image database. Script format:
   ```html
   <script src="https://vds.sage.net/service/ws.dll/SuppVDSInclude?V=100&AuthKey=[AuthKey]"></script>
   <a onclick="LaunchVDS(this,'[SuppID]','[ItemNum]','[ProductID]');">Create Virtual Sample</a>
   ```
   Script config via SAGEmember.com → Developer APIs → Web VDS tab. Custom logo (300×65 JPG/PNG) drops into lower-left of modal. Demo: `http://misc.qti.com/SupplierVDSdemo`.

2. **VDS bundled in PromoSearch** — "If you have SAGE PromoSearch, the Virtual Design Studio is included and is automatically added to your site." VP Promos has PromoSearch on vp-promos.com, so the VP Promos site has VDS there. But **PromoSearch is SAGE-hosted only** — can't be embedded on bighornthreads.com.

## Implication for Bighorn

**No usable SAGE virtual mockup path.** We need an alternate:

### Options (ranked)

1. **Use supplier-provided mockups on demand**
   - When a quote comes in, Steve requests a supplier mockup via email (SanMar, S&S Activewear, Gildan, etc. all offer spec samples/virtual proofs on request).
   - "Proof in 24–48 hours" on the quote confirmation page.
   - Zero dev cost, matches how VP Promos already works.

2. **Static product gallery with past decorations**
   - Show 2–3 hero products per category with actual past-customer decorations as examples.
   - Positions Bighorn as real, not a stock-photo reseller.
   - Feeds into Trust/Proof UX.

3. **Self-serve mockup builder (heavy lift)**
   - Use Konva.js / Fabric.js + supplier blank images (from SAGE Module 104 `pics` with `hasLogo=0`) + user-uploaded logo.
   - Live mockup preview on product page.
   - Save state to Supabase for Steve to review & proof.
   - Implementation cost: ~2 weeks. Value: premium feel, fewer "can you send a proof?" emails.

4. **Integrate a 3rd-party mockup service**
   - Placeit, Fotor, or Smartmockups via API.
   - Requires subscription; quality varies for apparel/promo.

**Recommended for v1:** Option 1 (supplier mockups via email, set expectation on site) + Option 2 (trust gallery). Revisit Option 3 in v2 once we have conversion data.

## VDS version history

- 09.23.2015 — v1.0 Initial release
- 10.02.2015 — v1.0b Web VDS settings location note
- 10.14.2015 — v1.0c href-based call example added
- 02.09.2016 — v1.1 HTTPS support
- 02.10.2016 — v1.1 document release
