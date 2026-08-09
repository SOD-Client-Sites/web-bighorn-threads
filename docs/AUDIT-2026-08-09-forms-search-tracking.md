# Site Audit — Forms, Search, Demo Store, Tracking — 2026-08-09

Four parallel read-only audits. **CRM data integrity is sound** — GHL dedups by email, Cloudflare Functions are the source of truth, real leads create ONE contact (no duplicates). Only the catalog search box (no email field) created junk blanks.

## DONE ✅
- **Catalog search box** (`SearchBar.astro`) rewritten from `<form>` to `<div role="search">` with JS navigation. Verified live: search no longer creates blank GHL contacts, navigation still works, build passes (146 pages). This was the original blank-lead leak.

## 🔴 HIGH — costing money / client-facing (needs decisions or careful fix)
1. **Paid landing pages record ZERO GA4 conversions.** `LeadCaptureForm.astro:147` uses `dataLayer.push({event:'generate_lead'})` but there's NO GTM on the site (direct gtag). Must be `gtag('event','generate_lead',{...})` gated on `res.ok`. Also `LandingLayout.astro` omits the entire BaseLayout event-listener block (no phone_click/cta_click on the 7 `/get-started/*` LPs). Fix both.
2. **`generate_lead` double-fires + fires on failure** on the quote form: `BaseLayout.astro:75-76` (submit-time, ungated) AND `get-a-quote:282` (success-gated). Remove the `quoteForm` case from the BaseLayout listener.
3. **Demo/preview store not client-ready** (`src/pages/preview/index.astro`, `demo/index.astro`, `data/demoCatalog.ts`):
   - Placeholder copy shipping live: "locked pricing in about fast" (`preview:99`), "gear ships direct. Live fast." (`preview:164`), "No commitment," cut off (`demo:52`).
   - Preview shows the SAME static PENTA (competitor) catalog to everyone, ignoring the submitted trade — breaks the "curated to your trade" promise.
   - Product images hotlinked from `assetly.ordermygear.com` (competitor CDN) — availability + optics risk. Needs self-hosted assets (CHARLES to provide/approve).

## 🟡 MEDIUM
4. **PII to GA4** — `BaseLayout.astro:40,49` send raw `phone_number`/`email` as event params (Google policy violation). Strip them.
5. **Dead honeypots** — `LeadCaptureForm.astro` (lp-optin) and `demo/index.astro` render/expect `bh_hp_field` but never send it in the payload → Turnstile is their only bot defense. Add the field to the payloads.
6. **Demo form**: fire-and-forget GHL sync (silent lead loss on error) + collects **phone with no SMS consent** (TCPA gap). Add consent field or stop collecting phone.
7. **SAGE silent failure** — `functions/api/sage/_lib.js:68` `if(!data.ok && data.errNum)` lets `ok:false` without `errNum` pass → UI shows "no results" for an upstream failure. Treat `ok===false` as error.
8. **Quote modal** — `quote-modal.js:511` doesn't client-validate `productName`/`productSpc||productEId`; a valid submit can hit a generic 400 error. Add to client validation.
9. **No `contactUniqueIdentifiers: ["email"]`** on the 5 upserts → a shared company phone can cross-merge two different contacts. Add on email-required forms.
10. **`form_submit` fires on failure** (`BaseLayout.astro:79-81`, submit-time). Not success-gated.
11. **No consent gate** for AudienceLab IDPixel (identity-resolution pixel loads unconditionally) — compliance decision (CMP/banner).
12. **Turnstile + adblock** can silently 400 legitimate quotes (jobsite audience uses blockers). Monitor / fallback.

## 🟢 LOW / cosmetic
- `get-a-quote` leads mislabeled `source: Contact Page`; two custom fields (`CF_SERVICE_INTEREST`, `CF_TIMELINE`) never populate.
- SAGE `s-maxage=300` overrides the 120s free-text intent; `categories.js` reads `data.items` vs schema `['ok','categories']`.
- Preview: dead "Select Options" button, hardcoded "Men's" header (catalog has women's SKUs), `subcatOf()` misclassifies hoodies/LS polos.
- `company-stores.astro:406` "a a per-year credit" typo.
- `win.astro` loads NO analytics (own `<head>`) — QR opt-ins invisible to all pixels (GHL still captures server-side).

## Not a problem (verified)
- No duplicate GHL contacts from lead forms — GHL merges by email; external-tracking only adds attribution. **Do NOT convert lead forms/quote modal to non-forms** — that would lose their web attribution.

## Pending Charles
- Scope of fix pass (all code bugs vs critical-only).
- Demo store: noindex+patch vs full trade-aware rework (needs product assets).
- Deploy approval (site has local commits not yet on GitHub — review before push).
- Delete the ~25 blank contacts tagged `pixel-blank-review` (destructive).
