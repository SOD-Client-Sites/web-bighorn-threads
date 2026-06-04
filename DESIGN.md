# DESIGN.md — Bighorn Threads

> Aesthetic anchors: **Freitag, Agronomy Workshop, Andercore, Ambrook**
> Sourced from Refero (real workwear / trade / industrial brands — not borrowed tech brands).
> See `_reference/` for the four source design systems.

## 0. The core correction

The current site fails because it is a **flat dark-navy SaaS template with zero
photography** applied to a tactile, blue-collar product. Every real workwear and trade
brand researched (Freitag, Agronomy Workshop, ShareWillow, Ambrook) is **light-canvas
and photography-forward**. Andercore proves dark *can* work for trades — but only as
full-bleed real photography with a tint, never as empty navy fill.

**So the new system flips the base to light, demotes navy to a deliberate photographic
accent surface, keeps the existing gold as the single accent, and makes real
photography structural — not optional.**

## 1. Visual theme & atmosphere

Industrial, utilitarian, jobsite-credible. A warm light "concrete" canvas carries the
site; white panels float on it; product and job-site photography supplies all the energy
and color. Dark navy appears only as full-bleed photographic bands (hero, industry
features, footer) — atmosphere earned by an image, never a flat rectangle. The feel is a
disciplined warehouse catalog crossed with a field-tested trade brand: confident,
tactile, precise. No gloss, no glow, no gradients.

## 2. Color palette

| Role | Name | Hex | Notes |
|------|------|-----|-------|
| Canvas (page ground) | Concrete | `#f4f2ee` | Warm light gray — primary background, replaces navy |
| Surface (secondary) | Warm Paper | `#e8e5df` | Alternating section bands, subtle blocks |
| Panel / product card | White | `#ffffff` | Product cards, floated panels |
| Primary text | Charcoal | `#1a1714` | Warm near-black, all body + headings on light |
| Muted text | Ash | `#6b6660` | Secondary copy, captions, labels |
| Border | Hairline | `#d4d0c8` | 1px borders, dividers — never soft shadows |
| Dark surface | Navy 900 | `#002843` | Photographic dark bands, footer (existing token) |
| Dark surface deep | Navy 950 | `#00182a` | Deepest tint layer (existing token) |
| Accent | Bighorn Gold | `#C19B3D` | Single accent — primary CTAs, active states (existing) |
| Accent hover | Gold Deep | `#a8842e` | CTA hover/pressed (existing) |
| Text on dark | White | `#ffffff` | Copy over navy photographic bands |

**One accent only.** Gold is it. Hi-vis safety yellow-green may appear *inside
photography and product imagery* but never as UI chrome.

## 3. Typography

Current font stack is kept — it is genuinely good and industrial. One addition: mono is
promoted to a real role (spec labels / SKUs), per Agronomy Workshop.

- **Display**: `Big Shoulders Display` — heavy/extra-bold, condensed. Headlines, hero. Tight tracking.
- **Subheading**: `Barlow Condensed` — section eyebrows, kickers (uppercase, tracked +0.08em).
- **Body**: `Barlow` — 400/500, line-height 1.6. All running copy.
- **Mono**: `JetBrains Mono` — **SKUs, spec labels, price chips, category tags, technical
  badges.** Wide tracking (+0.08em), small (11–12px), uppercase. This is the "spec-sheet"
  signal that says industrial, not fashion.
- **Scale (px)**: 12 · 14 · 16 · 20 · 28 · 40 · 56 · 72

## 4. Component patterns

**Buttons** — Primary: solid Gold `#C19B3D`, Charcoal text, `4px` radius, 14px×28px
padding, uppercase Barlow Condensed 600. Hover → Gold Deep. Secondary: transparent,
1px Charcoal border, Charcoal text, same radius. **One primary CTA per view** — kill the
current twin hero CTAs; phone becomes a secondary/ghost treatment.

**Cards** — White panel on Concrete canvas, `1px` Hairline border, **`0–4px` radius**,
**no shadow**. Product cards: image fills top edge-to-edge, mono SKU/price chip, Barlow
title. Flat and structured — Freitag/Agronomy/Andercore all agree on this.

**Inputs** — White fill, 1px Hairline border, `4px` radius, Charcoal text, Gold focus
ring. Labels above, Barlow 500.

**Navigation** — Sticky top bar on Concrete (or transparent over a photographic hero).
Horizontal, compact, Barlow 500. Active state = Gold underline. Add the orphaned money
pages into a real nav structure (see §10 IA in the audit).

## 5. Layout principles

- **Spacing scale**: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96
- **Container max-width**: 1200px, centered. Contained discipline (Freitag/Ambrook).
- **Grid**: 12-col, 24px gutter. Product grids 3-up desktop / 2-up tablet / 1-up mobile.
- **Section rhythm**: alternate `Concrete → Warm Paper → navy photographic band` so a
  long page has pacing. **No two adjacent sections share a background.** This is the
  direct fix for the monotony.
- **Section gap**: 64–96px vertical.
- **Whitespace**: comfortable, not sparse — generous around product imagery.

## 6. Depth & elevation

- **No shadow system.** Depth comes from 1px Hairline borders and tonal surface shifts
  (Concrete → Warm Paper → White → Navy). All four anchors explicitly forbid soft
  shadows. The only permitted shadow: a sticky header's 1px bottom border.
- Photographic dark bands get a dark tint overlay (`rgba(0,24,42,0.55)`) so white copy
  stays legible — this *is* the depth on dark sections.

## 7. Do's and don'ts

**Do**
- Light Concrete canvas as the foundation; navy only as photographic bands + footer
- Make photography structural: SAGE product shots on white cards, real Vegas job-site
  shots behind dark bands
- One Gold accent, one primary CTA per view
- Flat surfaces, 1px borders, sharp 0–4px radii
- Mono for every SKU, price, spec label and tag

**Don't**
- No flat dark-navy section with no image — this is the exact current failure
- No soft/glowy shadows, no gradients, no glassmorphism
- No second accent color in UI chrome
- No tiny generic line-icons standing in for product photos
- No two adjacent sections with the same background
- No twin equal-weight CTAs in the hero

## 8. Responsive behavior

- Breakpoints: sm 640 · md 768 · lg 1024 · xl 1280
- Mobile-first; product grids collapse 3→2→1; dark photographic bands keep the tint and
  re-anchor copy to bottom-left
- Touch targets ≥ 44px

## 9. Agent prompt guide

> Bighorn Threads is an industrial workwear brand — think disciplined warehouse catalog
> meets field-tested trade company. Warm light "Concrete" `#f4f2ee` canvas, white product
> panels, Charcoal `#1a1714` text, a single Gold `#C19B3D` accent. Dark navy appears ONLY
> as full-bleed photographic bands with a tint, never flat fill. Big Shoulders Display
> for condensed industrial headlines, Barlow body, JetBrains Mono for SKUs and spec
> labels. Flat surfaces, 1px borders, sharp 0–4px corners, zero soft shadows. Real
> photography is mandatory and structural. Sections alternate background so long pages
> have rhythm. One primary CTA per view.

---
*Implementation goes through the `frontend-design` skill, which reads this file. This
file defines the system; it is not itself UI code.*
