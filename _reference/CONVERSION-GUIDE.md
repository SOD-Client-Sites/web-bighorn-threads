# Bighorn Page Conversion Guide — navy → light Concrete system

You are converting an existing Astro page from the OLD flat-dark-navy design to the
NEW light "Concrete" design system. **Read `/DESIGN.md` first.** The canonical, already-
converted reference pages are `src/pages/index.astro` and `src/pages/contact.astro` and
`src/pages/catalog/index.astro` — match their patterns exactly.

## HARD RULES

- **Do NOT change copy, headings text, JSON-LD schema, `<script>` blocks, frontmatter
  logic, form `action`s, component imports, or `getStaticPaths`.** Visual/class changes only.
- **Do NOT run `astro build` or `astro dev`.** The lead agent builds at the end.
- Preserve all `id=`, `aria-*`, `data-*`, form field `name=`, and `href` values.
- Keep all images working; keep `Image`/`Picture` imports.

## TOKEN MAPPING (Tailwind classes)

| OLD | NEW |
|---|---|
| `bg-navy-950` / `bg-navy-900` / `bg-navy-900/40` etc. (flat section fill) | alternate `bg-concrete` and `bg-paper` per section |
| `text-white` (on light bg) | `text-charcoal` |
| `text-gray-400` / `text-gray-300` / `text-navy-200` (muted body on light) | `text-ash` |
| `text-gold-500` (accent text/heading word on light) | `text-gold-600` |
| `border-navy-700/40` / `border-navy-800/...` | `border-hairline` |
| `bg-navy-800/20` card fill | `bg-panel` |
| `rounded-xl` / `rounded-2xl` on cards | drop to flat — remove or use sharp; `0–4px` only |
| `shadow-*`, `hover:shadow-*`, `hover:-translate-y-*`, `blur-*` glow divs | DELETE |
| radial-gradient glow divs, ghost ram watermark `<Image>`, `bg-gradient-to-*` dec*layers | DELETE |
| gold CTA `bg-gold-500 ... text-navy-950` | use the global `.btn-primary` class |
| outline CTA | use `.btn-secondary` |
| eyebrow `text-xs font-bold uppercase tracking-[...] text-gold-500` | `class="kicker"` |

## SECTION RHYTHM

- No two adjacent sections share a background. Alternate `bg-concrete` → `bg-paper` →
  `bg-concrete`… Put `border-y border-hairline` on `bg-paper` sections.
- **Page hero:** convert the old dark glow-hero to a compact **full-bleed photographic
  dark band** IF a fitting image exists in `/public/images/generated/` — pattern:
  ```
  <section class="relative isolate overflow-hidden bg-navy-950">
    <img src="/images/generated/XYZ.jpg" alt="" aria-hidden="true"
         class="absolute inset-0 -z-10 h-full w-full object-cover" loading="eager" decoding="async" />
    <div class="absolute inset-0 -z-10 bg-navy-950/85"></div>
    ... white text, kicker, h1, .btn-primary ...
  </section>
  ```
  If no fitting image, make the hero `bg-concrete` with charcoal text. Never a flat navy
  hero with no image.
- A closing CTA band may stay navy ONLY as a full-bleed photo band (same pattern). Flat
  navy with no image is forbidden.

## CARDS

`border border-hairline bg-panel` — flat, no shadow, sharp/0–4px corners. Hover =
`hover:border-gold-500` only (no shadow, no translate).

## TYPOGRAPHY

- Section-title headings (`h2` that label a section): `font-heading font-extrabold
  uppercase tracking-tight`, accent word in `text-gold-600`.
- **Blog/article PROSE content** (`<article>`, `.prose`, body copy headings inside an
  article): do NOT uppercase, do NOT restyle text. If you see `prose-invert`, change to
  `prose` so it reads on light. Leave content structure alone.
- Buttons/labels: `font-subheading` uppercase is fine (already in `.btn-*`).

## ICONS

Tiny gold line-icons in colored circles → keep the icon but flatten the container:
`bg-gold-500/15 text-gold-700`, square, no rounded-full glow. Don't invent product images.

## WHEN DONE

Report: which files you converted, anything you could not cleanly convert, and any page
that had no fitting hero image (so the lead can assign one).
