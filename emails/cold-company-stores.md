# Bighorn Threads — Cold Outbound Sequence: Company Stores

**Goal:** get a contractor/business owner to look at the company-stores offer.
**Audience:** cold, mixed/general list (contractors, multi-location businesses, anyone with a crew to outfit).
**Offer link (canonical):** https://bighornthreads.com/company-stores/
**Format:** plain text only. No HTML, no images, no logo — reads like a personal note. (Cold-outbound methodology bans HTML for cold.)
**Merge vars:** platform-neutral (`{{contact.first_name}}`, `{{contact.company_name}}`) — port between GHL / Instantly / Smartlead.

> **Sender:** replace `[SENDER NAME]` before sending. A real human name + a reply-monitored inbox outperforms a brand-name sender on cold.

---

## Touch 1 — Day 0
**Subject:** chasing shirts

Hey {{contact.first_name}},

Quick one — who on your crew handles ordering shirts and hats when a new hire starts or a job ramps up?

For most teams it's a recurring scramble: collect sizes, front the cost, wait on a bulk order, then sort it out on site.

Bighorn Threads sets crews up with a branded company store instead — one page your people order their own gear from, shipped direct. You hold zero inventory, and there's no platform or per-seat fee.

Want a quote on outfitting your crew? Start here: https://bighornthreads.com/contact/

— [SENDER NAME]
Bighorn Threads · Las Vegas, NV

---

## Touch 2 — Day 3 (angle: cost + brand control)
**Subject:** who fronts the cost

{{contact.first_name}} — following up on the gear thing.

The part that bites most owners isn't the ordering, it's the money and the mess: someone fronts a bulk buy, half the sizes are wrong, and three different versions of the logo end up on the jobsite.

A company store flips it. You set the budget or a per-employee credit, lock one approved catalog so the brand stays consistent, and your crew orders themselves.

Want me to send a quick example store?

— [SENDER NAME]
Bighorn Threads

---

## Touch 3 — Day 7 (angle: new hires / multi-location)
**Subject:** new hire gear

{{contact.first_name}} — last useful one on this.

If you're running multiple sites or hiring through the season, this is where a store earns its keep: new hire gets a link day one, picks sizes, gear ships to the jobsite or their home. No box of mixed shirts in the shop.

Want a quote? Two minutes here: https://bighornthreads.com/contact/

— [SENDER NAME]
Bighorn Threads

---

## Touch 4 — Day 12 (breakup)
**Subject:** close the loop?

{{contact.first_name}} — haven't heard back, so I'll assume gear ordering isn't a headache worth fixing right now.

If that changes, the door's open. Have a good one.

— [SENDER NAME]
Bighorn Threads

---

## Build notes
- Methodology: peer-not-vendor, "you/your" lead, one ask per touch, lowercase 2–4-word subjects, widening gaps, a new angle each touch, honored breakup. (sod-cold-outbound)
- Doctrine ids: none cited — the `sod-copy-doctrine` `patterns/` library has no `cold-email` patterns loaded yet (skeleton). Written freeform per methodology. **Gap → candidate `sod-original` patterns once this campaign has reply data.**
- Claims discipline: grounded only in the live `/company-stores/` page (zero inventory, no platform/per-seat fee, budget/credit, approved catalog, ship-direct). Avoided the site's "launch in 5 days" turn-time per Bighorn no-unvalidated-claims rule.

## Before you send (deliverability gate — do NOT skip)
1. **Don't blast cold from the client's primary GHL sending domain.** It burns Bighorn's reputation for transactional/warm mail. Use a **dedicated cold-sending domain** (separate from bighornthreads.com) warmed in Instantly/Smartlead. See brain playbook `cold-email-deliverability-setup`.
2. SPF/DKIM/DMARC on the cold domain; verify the list; cap daily volume; ramp slowly.
3. **CAN-SPAM:** every touch needs a physical mailing address + one-click unsubscribe. Most cold sequencers inject these automatically — confirm before the first send.
4. Plain text only — do not paste into the HTML template.
