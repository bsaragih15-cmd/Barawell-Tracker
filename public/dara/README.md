# Handoff: Dara — Women's Health Telemedicine Web App

## Overview
**Dara** is an Indonesian women's-health telemedicine brand (reference class: forhers.com, localized to Bahasa Indonesia). This package covers the **Dara web funnel** — a category-first navigator where each category (Berat Badan / Kulit / Rambut / Mental) is a complete linear flow: **Landing → Kuis (quiz) → Rencana (plan) → Bayar (checkout) → Portal**, plus shared utility screens (status states, article, triage, injection guide) and an **animated hero** (three GLP-1 pens floating with a rotating gold "orbit" text ring circling them).

Positioning: *"Perawatan kesehatan perempuan yang serius, tanpa drama"* — a medical brand that feels like a considered lifestyle brand: warm, direct, destigmatizing. **Not** a pharmacy marketplace, generic SaaS gradient site, pastel-pink femtech, or before/after body-shame product.

## About the Design Files
The files in this bundle are **design references created in HTML/React (via an in-browser Babel transform)** — prototypes showing intended look and behavior, **not production code to ship directly**. They load React/ReactDOM/Babel from a CDN and a runtime design-system loader (`ds-loader.js`); that setup exists only to make the prototype runnable in a static preview.

Your task is to **recreate these designs in the target codebase's environment** — using its established framework, component library, routing, state, and styling conventions. If no environment exists yet, choose an appropriate stack (a React + CSS-variables or Tailwind setup maps cleanly, since the design system is already expressed as CSS custom properties). Lift the exact token values, layout, copy, and interactions from this README and the referenced `.jsx`/`.css` files; do not copy the Babel-in-browser scaffolding.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, component states, copy (Bahasa Indonesia), and interactions are all specified. Recreate the UI pixel-faithfully using the codebase's libraries, honoring the exact tokens below. The one known-rough asset is the pen photography (see **Assets** / **Open Items**).

---

## Design Tokens

All tokens live in `tokens/*.css` and are consumed as CSS custom properties. Exact values:

### Color
| Token | Hex | Role |
|---|---|---|
| `--dara-canvas` | `#FAF7F2` | warm paper — page background |
| `--dara-ink` | `#211A14` | deep espresso — primary text |
| `--dara-terracotta` | `#C4553B` | **primary accent** — CTAs & active states ONLY |
| `--dara-terracotta-deep` | `#A84731` | hover/press on terracotta |
| `--dara-sage` | `#7E8F6E` | success / "approved" / supply meters |
| `--dara-sage-deep` | `#5E6E50` | sage text on light tints (AA) |
| `--dara-blush` | `#F2E3DA` | section bands |
| `--dara-oat` | `#EFE9DF` | passive cards, footer |
| `--dara-line` | `#E5DDD2` | 1px borders (preferred over shadows) |
| `--dara-ink-soft` | `#57493D` | secondary text |
| `--dara-ink-faint` | `#837567` | meta/captions (18px+ or bold only) |
| `--dara-error` | `#B3362B` | error (always paired with words) |
| `--dara-info` | `#3F5E78` | info (always paired with words) |
| `--dara-terracotta-tint` | `#F8E9E4` | selected/active background |
| `--dara-sage-tint` | `#E9EDE3` | success background |
| `--dara-info-tint` | `#E4EAF0` | info background |
| `--dara-error-tint` | `#F7E5E2` | error background |
| surface-card | `#FFFFFF` | interactive/elevated cards, inputs |

Rules: large fields of calm neutrals; **color = intent, never decoration**; max **1–2 background colors per page**; **flat tints only — no gradients/patterns/textures** in UI (the hero background gradient + product photography are the deliberate exceptions). Never signal state by color alone — always pair with words.

### Typography
- `--font-display`: `"Source Serif 4", "Iowan Old Style", Georgia, serif` — display, weight **550**, sentence case, **never all-caps**.
- `--font-ui`: `"Inter", -apple-system, "Segoe UI", "Helvetica Neue", sans-serif` — UI/body, 16–17px, line-height 1.6.
- Scale: hero `clamp(40px→56px)` · h1 `clamp(32px→42px)` · h2 `clamp(24px→28px)` · h3 `20px` · body-lg `17px` · body `16px` · small `14px` · caption `13px`.
- Leading: display `1.08`, heading `1.2`, body `1.6`. Display tracking `-0.01em`.
- **Prices/dates/quantities**: `font-feature-settings: "tnum" 1, "lnum" 1` (tabular), rendered in the serif.

### Spacing / radius / border / shadow (8px scale)
- Space: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80 / 96 px.
- Radius: control `12px` · card `16px` · pill `999px`.
- Border: `1px solid #E5DDD2` (hairline).
- Shadow (nearly invisible — hairlines do the separating): card `0 1px 2px rgba(33,26,20,.05)`, raised `0 2px 8px rgba(33,26,20,.07)`.
- Max content width `1100px`; prose measure `62ch`; min tap target `44px`.

### Motion
- Easing `cubic-bezier(0.22,0.68,0.32,1)`; durations fast `150ms` / base `200ms` / slow `250ms`.
- Motion on **state changes only** (quiz advance, accordion, status). No parallax, scroll-jacking, or autoplay video.
- Hover: terracotta → `#A84731`; secondary → 5% ink wash; links underline. Press: `scale(0.985)`. Focus: **2px terracotta ring, 2px offset, everywhere**.
- Reduced-motion: all decorative animation must no-op under `prefers-reduced-motion: reduce`.

---

## Navigator (shell)

`index.html` mounts an `App` that holds two state variables:
- `screen` — the current screen id (default `"lp-bb"`).
- `cat` — the current category (default `"bb"`), used to keep the correct tab + step rail highlighted.

**Flows** (`FLOWS`): each category is `{ label, steps: [[screenId, stepLabel], …] }`.
- `bb` "Berat": `lp-bb → quiz → plan → checkout → portal`
- `kulit` "Kulit": `lp-kulit → quiz-kulit → plan-kulit → checkout-kulit → portal-kulit`
- `rambut` "Rambut": `lp-rambut → quiz-rambut → plan-rambut → checkout-rambut → portal-rambut`
- `mental` "Mental": `lp-mental → quiz-mental → plan-mental → checkout-mental → portal-mental`
- `status` "Keadaan": single `status` screen
- `artikel` "Artikel": single `artikel` screen

`nav(id)` sets `screen` and, via `SCREEN_CAT`, updates `cat`. The shared `quiz` screen is intentionally omitted from `SCREEN_CAT` so it keeps whatever category you entered from. `selectCat(c)` navigates to that flow's first step. `startQuiz(c)` sets category and jumps to the shared `quiz`.

**Chrome:** a top **category tab row** (main cats `bb/kulit/rambut/mental` as ink-filled-when-active pills, then util cats `status/artikel`), and below it a **step rail** for the active flow (`Landing → Kuis → Rencana → Bayar → Portal`) with `→` separators; the current step is terracotta, past/future steps are meta. Screens render inside a phone-scale frame (design viewport **470×920**, mobile-first).

---

## Screens / Views

Each screen is a `.jsx` component in `ui_kits/dara-web/`. Recreate each as a route/view. Copy is **Bahasa Indonesia, second person "kamu"** (doctors speak as "aku"), sentence case, no emoji.

- **HomeScreen** — 5-category entry grid + the animated hero. Entry to the whole app.
- **LandingBeratBadan** — weight-program landing: animated hero, two-tier GLP-1 (injection) vs Oral choice, Wegovy®/Mounjaro® medication choice, trust bar, doctor cards, FAQ, testimonials, footer. Primary front door.
- **LandingKulit / LandingRambut / LandingMental / LandingPilKB** — category landings, same skeleton, category-specific copy/imagery.
- **QuizFlow** — weight intake; routes to a plan tier based on answers; includes the Pil-KB branch. Uses `ProgressBar`, `OptionCard`, `Input`, `ConsentCheckbox`. Step slide-in animation (`dara-stepin`), Back affordance, "answers seen only by the medical team" reassurance.
- **QuizDerm** — kulit/rambut intake. **QuizMental** — calm intake; **crisis routing is intentionally NOT built** (see Open Items).
- **PlanReveal / PlanRevealKB / PlanRevealDerm / PlanRevealMental** — doctor's recommendation: `DoctorCard` note, `PlanCard` with medication + included services + prepay cadence toggle (savings for 3/6-mo), honest totals.
- **CheckoutScreen** — category-aware (bb/kb/kulit/rambut/mental); cadence selector, **monthly default**, **renewal date shown in bold before the pay button**, totals never hidden, neutral-sender discretion cue.
- **PortalDashboard / PortalKB / PortalSkinHair / PortalMental** — post-purchase: current plan, dose/titration status, `SupplyMeter`, `TrendChart` (trajectory framing), check-ins; PortalSkinHair has a photo log + quiet month-2 cross-sell.
- **StatusStates** — hard-stop / interstitial states: pending · needs-info · declined · pay-failed · delayed · paused. **These are the kindest screens** — always offer an alternative, never a dead end.
- **TriageFlow** — eligibility/triage branch. **InjectionGuide** — step-by-step self-injection instructions. **ArticlePage** — editorial content template.
- **HomeDesktop / LandingBeratDesktop** (`desktop.html`) — desktop compositions (max-width 1100px, 12-col mental grid).

For exact layout, spacing, and copy per screen, read the corresponding `.jsx` file (and its `.d.ts` where present) — they are the source of truth and use only the tokens above.

---

## Featured interaction: the animated hero (`HeroAnimation.jsx`)

The hero is the most animation-heavy piece; recreate it precisely.

**Structure** (a `position:relative` section, `background: theme.bg` radial/linear gradient, column layout):
1. **Headline** (z-index 3) — display serif, two lines, `theme.top` + `theme.accent` colors. Centered, `pointer-events:none`.
2. **Product stage** (`flex:1`, `overflow:hidden`, **`perspective: 1000px`**) containing, in z-order:
   - **Glow** (z 0) — `theme.glow` radial, `dara-glowpulse 5s` opacity pulse.
   - **Orbit ring — BACK half** (z 1) — behind the product.
   - **Product** (z 2) — `pens-trio.png` transparent cutout (three GLP-1 pens standing), centered `left/top:50%/46%`, `translate(-50%,-50%)`, `width:86%`, `drop-shadow(0 26px 34px rgba(58,42,32,.34))`, gentle vertical bob `dara-bob 6.5s`.
   - **Orbit ring — FRONT half** (z 3) — in front of the product.
3. **Product lineup** (z 3) — horizontal scroll of medication cards (Wegovy® / Mounjaro® / Oral), each starts the purchase journey.

**The orbit ring** is the key effect — a gold text ring tilted into a **3D orbit** that circles the pens (near arc crosses in front, far arc passes behind). Implementation:
- Render the ring **twice**: a *back* copy and a *front* copy, identical geometry.
- Each copy: an absolutely-centered square element, `transform: translate(-50%,-50%) rotateX(58deg)` (the tilt; needs the parent's `perspective`), sized `width:94%; aspect-ratio:1`.
  - Back copy: `z-index:1`, `clip-path: inset(0 0 50% 0)` (keeps the **top/far** half).
  - Front copy: `z-index:3`, `clip-path: inset(50% 0 0 0)` (keeps the **bottom/near** half).
- Inside each, an inner element spins on `rotateZ` only (`@keyframes dara-spin { to { transform: rotate(360deg) } }`, ~32s linear infinite) so the text travels around the tilted plane. The tilt stays fixed on the parent; the two clipped halves never swap, so the top always reads behind the pens and the bottom always in front.
- The ring content is an inline SVG `textPath` on a circle (`M50,50 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0`, viewBox `0 0 100 100`), text tiled: `"DOSIS TINGGI • BARU • DIRESEPKAN DOKTER • TERDAFTAR BPOM • "`, `fill = theme.badge`, `font-size:4.4` (viewBox units), `font-weight:600`, `letter-spacing:1.15px`.
- Give the two SVG `<path>`s **unique ids per half and per theme** (e.g. `dara-orbit-back-blush`) so multiple instances don't collide.
- Under `prefers-reduced-motion: reduce`, disable the spin and bob (ring/pens stay static, still composed).

**Themes** (`variant` prop selects one; each defines `bg`, `glow`, `top`, `accent`, `foot`, `badge`, `onDark`):
| variant | badge/accent | onDark |
|---|---|---|
| `blush` (default in HomeScreen) | badge `#B85539`, accent `#C4553B`, top `#3A2A20` | false |
| `caramel` | badge/accent `#F1C68F`, top `#FFF7EF` | true |
| `clay` | badge/accent `#FBDCB4`, top `#FFF3EC` | true |
| `spotlight` | badge/accent `#F1C68F`, top `#FFF7EF` | true |
| `dusk` | badge/accent `#F5C9A0`, top `#FFF3EC` | true |

Exact gradient strings for `bg`/`glow` per theme are in the `THEMES` object in `HeroAnimation.jsx` — copy them verbatim.

**Props:** `onStartQuiz(productId?)`, `onSelectProduct(id)`, `variant="blush"`, `frameHeight`, `assetBase`. The CTA(s) must remain real `<button>`s; the animated layers are `aria-hidden`.

---

## Interactions & Behavior (global)
- **Navigation** is client-side screen switching (no full reload) — map to routes in the target app.
- **Quiz**: forward on select (auto-advance where single-choice), Back affordance, progress bar, `dara-stepin` slide-in per step; consent checkboxes **never default to true**.
- **Accordion (FAQ)**: expand/collapse 150–250ms ease-out.
- **Cards** (`.dara-lift`): subtle hover lift within the motion budget.
- **Checkout**: cadence selector recomputes total; renewal date shown in bold **before** the pay CTA.
- **Focus**: visible 2px terracotta ring everywhere (keyboard accessible).
- **Reduced motion**: section reveals, hero spin/bob, and step animations all no-op.

## State Management
- Navigator: `screen` + `cat` (as above). In production, prefer URL routes per screen so the tab + step rail derive from the route.
- Quiz: per-flow answer object + step index; routing logic (e.g. weight → tier) reads answers to pick the plan.
- Checkout: selected cadence → derived total + renewal date.
- Portal: mock plan/status/supply/trend data — replace with real fetches.

## Assets
Referenced from `assetBase` (default `../../assets/`). Included in this bundle under `assets/`:
- `pens-trio.png` — three GLP-1 pens standing (Ozempic®/Mounjaro®/Wegovy®), transparent cutout — **current hero product**.
- `pen-wegovy.png`, `pen-mounjaro-cut.png`, `pen-ozempic-cutout.png`, `tile-mounjaro.jpg`, `tile-ozempic.jpg` — lineup thumbnails / alternates.
- `favicon.svg`.
- Icons: a small **Lucide** subset (ISC license) via the `Icon` component (thin-line, 1.75 stroke, `currentColor`). Extend only from Lucide, matching stroke.
- **No logo asset exists — do not draw one.** Wordmark = "Dara" set in Source Serif 4 SemiBold.
- **No photography provided** — real screens use striped placeholders (`repeating-linear-gradient` oat/blush + monospace label) and drop-slots. Swap in real unretouched Indonesian-women photography (natural light, candid) before launch.

## Brand / trademark note
Ozempic®, Wegovy® (Novo Nordisk) and Mounjaro® (Eli Lilly) are third-party trademarks; Dara is not affiliated. The codebase previously kept **Ozempic off weight pages** (a prior editorial decision); the current hero uses the three-pen trio including Ozempic **at the client's explicit direction in this session** — confirm the final medication/branding policy with legal before production.

## Files (design references in this bundle)
- `README.md` — this document (self-sufficient).
- `styles.css` + `tokens/` — the token layer (colors, typography, spacing, motion, fonts, base resets). The base-truth for all values above.
- `ui_kits/dara-web/` — every screen component (`.jsx`) + `.d.ts` prop contracts, plus `index.html` (navigator), `desktop.html`, `hero.html`, and `HeroAnimation.prompt.md`.
- `components/` — shared components: `actions/Button`, `forms/Input` + `ConsentCheckbox`, `quiz/OptionCard` + `ProgressBar`, `journey/StepTimeline` + `StatusChip` + `SupplyMeter` + `TrendChart` + `PhotoCompare`, `commerce/PlanCard` + `PriceAnchorCard` + `OrderCard` + `TierCard` + `MedicationCard`, `trust/DoctorCard` + `TrustBar`, `content/FAQAccordion` + `ArticleCard` + `Footer` + `Testimonials`, `messaging/MessageBubble`, `icons/Icon`.
- `assets/` — the images listed above.

> Note on the `.jsx` files: they render through an in-browser Babel transform in the prototype and import via a runtime loader. Treat them as **readable specifications** of structure, props, and exact styles — re-implement in the target framework rather than wiring up the CDN/Babel scaffolding.

## Open Items (carry into production)
- Real photography (women + product); a **hero-quality single-pen cutout** (current cutouts are rough/landscape).
- Logo/wordmark decision; real legal identifiers to replace placeholders in `Footer`.
- Self-hosted licensed webfont binaries (currently Google Fonts CDN).
- **Mental-health crisis routing + the 119 help strip are deliberately NOT built** — add before any real mental-health launch.
- Confirm medication branding policy (Ozempic on weight pages) with legal.
