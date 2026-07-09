# Design Brief — [Brand] Women's Health Platform

*For Claude Code (or any design-capable builder). Pairs with `PRD-LOVABLE.md` (what to build) — this is how it should look, feel, and read. Reference class: forhers.com; ambition: match it, localized.*

## 1. Brand direction

**Positioning:** "Perawatan kesehatan perempuan yang serius, tanpa drama." A medical brand that feels like a considered lifestyle brand — warm, direct, destigmatizing. Never clinical-cold, never girly-cute, never weight-shaming.

**Voice:** plain-spoken Indonesian, second person ("kamu"), short sentences, zero euphemism about contraception, zero before/after body-shame tropes for weight. Every headline is a so-what statement, not a label. Humor is dry and light, never jokey about health.

**What it must NOT look like:** a pharmacy marketplace (Halodoc/K24), a generic SaaS gradient site, a pastel-pink "femtech" cliché, or the Barawell men's brand (deliberate separation).

## 2. Visual system

### Palette
- Canvas: warm paper `#FAF7F2` (vs Hers' cream — own it, don't copy it)
- Ink: deep espresso `#211A14`
- Primary accent: terracotta/clay `#C4553B` (CTAs, active states only — used sparingly)
- Secondary: sage `#7E8F6E` (success, "approved", supply meters)
- Support tints: blush `#F2E3DA` (section bands), oat `#EFE9DF` (cards)
- Functional: error `#B3362B`, info `#3F5E78`
- Rule: large fields of calm neutrals; color appears as intent (act, confirm, warn), never decoration. Check AA contrast on every text/tint pair.

### Type
- Display/headings: a modern humanist serif (e.g. **Fraunces** or Source Serif 4) — this is the single biggest "not a pharmacy" signal. Tight leading, sentence case, never all-caps.
- UI/body: **Inter** (or Figtree). Numerals in prices: tabular.
- Scale: hero 40–56px mobile-first fluid; body 16–17px/1.6.

### Imagery
- Real, unretouched Indonesian women, natural light, candid — film-photo grade, never stock-smiley or medical-white-coat-clipart. Product shots: medication pens/pill packs on textured neutral backgrounds, shot flat and honest.
- Illustration only for abstract concepts (how-it-works steps): thin-line, single-color, minimal.

### Surface & motion
- Generous whitespace, max-width ~1100px, 12-col grid, 8px spacing scale, radius 12–16px, shadows nearly invisible (1px borders in `#E5DDD2` preferred).
- Motion: 150–250ms ease-out only on state changes (quiz advance, accordion, status). No parallax, no scroll-jacking, no autoplaying video.

## 3. Signature moments (spend the design budget here)

1. **The quiz.** One question per screen, huge tap targets (full-width option cards), progress bar as a thin terracotta line, auto-advance with a soft slide. The BMI-result screen is empathetic: number stated plainly, framed as a starting point, never red/alarmed. Hard-stop screens are the kindest screens in the product — warm copy, alternative resources, no dead ends.
2. **Plan reveal.** After doctor approval: "Rencana dari doktermu" — doctor's name + photo, the chosen medication with BPOM badge, price presented *after* the value stack (consult, coaching, titration, refills). Feels like a letter from a doctor, not a pricing table.
3. **Price anchor module** (landing pages): two-column card — left: "Beli obat sendiri di apotek: ~Rp 3.1jt/pen, tanpa pendampingan"; right (accent border): "Program [Brand]: Rp X jt/bln — dokter, pendampingan & pengaturan dosis termasuk."
4. **Supply meter** (pil KB portal): a quiet horizontal pill-strip visualization showing days remaining, sage-filled; refill notice appears at day −6.

## 4. Component inventory
Buttons (primary terracotta / secondary outline / quiet text) · option card (quiz) · progress bar · step timeline (how-it-works + titration) · plan card w/ prepay-savings toggle (1/3/6 bln) · price-anchor duo card · doctor card (photo, STR line) · trust bar (BPOM-registered meds · dokter berlisensi · pengiriman diskret · klinik partner) · FAQ accordion · status chip (in_review sage-outline, approved sage-solid, needs_info info-blue) · message thread bubbles · order/pickup card with map pin · consent checkbox block · article card + medically-reviewed byline · footer w/ legal identifiers.

## 5. Page-by-page notes
- **Home:** editorial hero (photo + serif headline "Kesehatanmu, aturanmu."), two category cards (Berat Badan / Pil KB) as the primary nav decision, 4-step how-it-works, trust bar, article teasers. One screen = one idea.
- **Landing pages:** follow PRD §4.1 section order; alternate canvas/blush bands; every section ends near a quiz CTA; sticky bottom CTA on mobile.
- **Checkout:** single column, order summary pinned, renewal date stated in bold before the pay button (honesty is a design feature).
- **Portal:** card dashboard, plan card first; weight adds check-in widget + titration timeline; density closer to an instrument than a feed.
- **Admin:** unbranded, utilitarian, table-first — do not spend design effort here beyond clarity.

## 6. Accessibility & localization
- WCAG AA, visible focus rings (2px terracotta offset), all quiz interactions keyboard-operable, form errors inline in words (not color alone).
- Copy in Bahasa Indonesia natively; currency `Rp 3.900.000` format (dot thousands); dates `9 Juli 2026`. Discretion cues repeated at checkout and packaging copy ("nama pengirim netral").

## 7. Anti-goals checklist (review every screen against this)
No countdown timers or fake scarcity · no pre-checked upsells · no hidden renewal terms · no BMI shaming reds · no stock gradients/purple-teal SaaS look · no medication "Buy" buttons · no English-first copy.
