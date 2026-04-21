# SAGE Form Responses

**URL:** `https://www.sagemember.com/sm.dll/form-archive?UID=266315&includeArchived=1`

**State on VP Promos account:** 0 responses, even with archive toggled on.

## Schema

| Column | Notes |
|--------|-------|
| Type | Form type |
| Form Name | |
| Date | |

## Observation

Even though the Storage Library shows evidence of art uploads from SAGE website forms (e.g., the McCarthy logo submission on Apr 7 2026), those submissions don't appear in Form Responses. Either:

- Art uploads route directly to Storage Library, not the form archive.
- The form archive only holds forms VP Promos explicitly built in SAGE Workplace (and they've built none).
- Archive retention is short and old submissions are purged.

Either way, **no historical form data to migrate.** This is another greenfield area for Bighorn.

## Implication for Bighorn

Same as Quote Requests: build natively. Every bighornthreads.com form (contact, quote, art upload, company-store signup, join-our-crew) should:

- Write to Supabase `form_submissions` table with `form_type`, `source_page`, `payload_json`
- Email/SMS Steve with a human-readable summary
- Optionally push to GHL for CRM pipeline
- Attach files (artwork, POs) to Supabase Storage with signed URL retrieval
