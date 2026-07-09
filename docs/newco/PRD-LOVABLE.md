# PRD — [Brand] Women's Health Platform (Indonesia)

*Handoff document for Lovable. Written to be pasted (whole or per-section) as build prompts. Companion: `DESIGN-BRIEF.md` (visual system — give Lovable both), `RESEARCH.md` (why the model looks like this).*

## 0. TL;DR for the builder

Build a mobile-first D2C telehealth storefront for Indonesian women, modeled on forhers.com, with four product lines:

1. **Program Berat Badan** — a doctor-led weight-loss program subscription with **two tiers**: (a) **GLP-1 tier** (consult + coaching + medication managed via partner clinics — the injectable is dispensed in person, never shipped) and (b) **oral tier** (metformin/orlistat-class oral meds + nutritionist coaching, ~Rp 500rb–1jt/mo, fully home-delivered). The quiz routes between tiers; a GLP-1 disqualification routes to the oral tier, never to a dead end.
2. **Pil KB** — birth-control pill subscription with online doctor review and home delivery, auto-refill. Includes emergency contraception (Postpil, OWA — pharmacist-dispensable) as a quiet fast-checkout SKU.
3. **Kulit (skin/acne)** — hormonal-acne-focused: topical tretinoin/azelaic acid and oral options via e-Rx, subscription refills, home delivery. Lowest price point, designed as the brand's low-CAC entry product; cross-sold from the Pil KB quiz (skin is a stated pill motivation).
4. **Rambut (hair)** — female-pattern/postpartum hair loss: topical minoxidil + supplement bundle, subscription, home delivery, no clinic dependency.

The signature interaction is a **quiz-first funnel**: visitors never see a checkout before completing a free health assessment and doctor review. Language: **Bahasa Indonesia** (copy provided below in ID where it matters; elsewhere write natural, warm Indonesian — not translated English).

Brand name: use placeholder **"[Brand]"** everywhere; it will be find-replaced. (Candidates under discussion; do not invent one.)

## 1. Objective & success criteria

- Objective: a conversion-optimized acquisition funnel + subscriber portal that lets Barawell (existing men's-health telehealth operator) enter women's health under a new sister brand.
- v1 success = a deployable site where a visitor can complete quiz → intake → (async doctor review) → see her plan + price → pay → manage her subscription. Doctor review and payments may be stubbed behind admin actions in v1 (see §7).
- Non-goals for v1: native app, live video consult, insurance/BPJS, injectable contraception, lab testing, multi-language.

## 2. Users

- **Primary:** urban Indonesian women 22–40, smartphone-first, comfortable buying online, privacy-sensitive about both weight and contraception. Pay with e-wallets/VA transfer/cards.
- **Secondary:** returning subscribers managing refills, dose changes, doctor messages.
- **Internal:** admin (ops) reviewing intakes, marking doctor decisions, managing orders. Doctor-facing tooling is out of scope beyond a simple review queue.

## 3. Information architecture

```
/                       Home — brand promise, four category cards, how-it-works, trust bar
/berat-badan            Weight program landing (hero category, both tiers)
/berat-badan/harga      Program pricing w/ branded-drug price anchor (GLP-1 tier vs oral tier)
/pil-kb                 Birth control landing (incl. Postpil section)
/kulit                  Skin/acne landing
/rambut                 Hair landing
/kuis/berat-badan       Assessment quiz (weight — routes GLP-1 vs oral tier)
/kuis/pil-kb            Assessment quiz (birth control)
/kuis/kulit             Assessment quiz (skin)
/kuis/rambut            Assessment quiz (hair)
/intake                 Post-quiz medical intake (auth required)
/akun                   Subscriber portal (plan, refills, messages, orders)
/checkout               Plan selection + prepay + payment
/artikel …              Content/SEO hub (CMS-lite: markdown)
/tentang, /dokter       About + medical team (trust pages)
/legal/*                T&C, privacy, telemedicine consent, refund policy
/admin                  Ops console (protected)
```

## 4. The funnel (core spec)

### 4.1 Landing pages (`/berat-badan`, `/pil-kb`, `/kulit`, `/rambut`)
- Hero: so-what headline + single CTA → quiz. Weight: *"Turun berat badan dengan pendampingan dokter — bukan sekadar obat."* CTA: **"Mulai Konsultasi Gratis"**. Pil KB: *"Pil KB diantar ke rumahmu, dengan resep dokter — tanpa antre, tanpa canggung."* CTA: **"Cek Kecocokanmu"**.
- Sections (weight): how it works (4 steps: Kuis → Ditinjau dokter → Rencana & harga → Pendampingan bulanan) · medications block (Wegovy®/Mounjaro® shown as *BPOM-approved options your doctor may prescribe* — never purchasable directly; include mandatory disclaimer §8) · price anchor module (drug retail ~Rp 3,1jt/pen vs "Program mulai Rp X jt/bln — konsultasi & pendampingan termasuk") · doctor credibility strip (photos, STR-licensed) · FAQ · testimonials placeholder.
- Sections (weight, additional): **two-tier module** — "Program GLP-1" vs "Program Oral" cards side by side (price, what's included, who it's for); the quiz decides eligibility, the page only frames the range ("mulai Rp XXX rb/bln").
- Sections (pil KB): 13-formulations-style "one right pill for you" module · framing includes period-symptom benefits (acne, cramps, cycle control), not only contraception · discretion promise (plain packaging) · auto-refill explainer ("dikirim 6 hari sebelum habis") · **Postpil section** ("KB darurat — tanpa resep, dikirim cepat & diskret", fast checkout, pharmacist-review step instead of doctor case) · FAQ.
- Sections (kulit): concern selector (jerawat hormonal / bekas jerawat / tekstur) · ingredient credibility block (tretinoin, azelaic — "resep dokter, bukan skincare biasa") · routine-in-a-box subscription framing · cross-link: "jerawat hormonal? Pil KB bisa jadi bagian rencanamu."
- Sections (rambut): cause framing (postpartum, stres, hormonal — destigmatized) · minoxidil + supplement bundle explainer · 3–6 month expectation-setting timeline (honest: results take time) · FAQ.
- No prices anywhere above the fold; price appears only in the anchor module and after quiz completion.

### 4.2 Quiz (`/kuis/*`) — the signature interaction
- One question per screen, big tap targets, progress bar, auto-advance on select, back control. 60–90 seconds, 10–14 questions. No account required until the end.
- Weight quiz: goal, sex/age, height+weight (→ compute & show BMI empathetically), medical history flags (diabetes, thyroid, pregnancy/planning, eating disorder), current meds, prior weight-loss attempts, city (→ clinic-network availability), how-did-you-hear.
- **Weight routing, not hard stops:** GLP-1 eligibility (BMI ≥ 30, or ≥ 27 with comorbidity) → GLP-1 tier; BMI 25–27 (or GLP-1-eligible but contraindicated/declines) → **oral tier**; only pregnancy/breastfeeding, age < 18, eating-disorder history, MEN2/medullary thyroid ca (GLP-1 only) produce a true stop screen (kind, non-judgmental, alternative resources). A disqualified GLP-1 candidate must always land on the oral-tier offer.
- Pil KB quiz: age, smoking status + age>35 combo (→ progestin-only routing), blood-pressure known?, migraine with aura, clot history, breastfeeding, current method, what matters most (skin/cramps/no-daily-pill…). "Skin" as top motivation → offer the Kulit quiz as an add-on at the end.
- Kulit quiz (shorter, 8–10 q): concern, duration, current routine, pregnancy/planning (tretinoin contraindicated → azelaic routing), skin sensitivity, prior Rx use, photo upload (optional at quiz, required at intake).
- Rambut quiz: pattern/onset, postpartum?, thyroid/anemia flags (→ suggest lab check messaging), current treatments, pregnancy (minoxidil routing), expectations question (sets honest timeline).
- End screen: "Kamu kemungkinan cocok ✓ — buat akun untuk ditinjau dokter" → signup (phone/WhatsApp OTP preferred, email fallback). Persist quiz answers to the account.

### 4.3 Intake & doctor review
- Authenticated intake: ID (KTP) name + DOB, address, photo upload (required for Rx per telemedicine norms), consent checkboxes (telemedicine consent, data/privacy, program terms).
- State machine per case: `submitted → in_review → approved(plan) | needs_info | rejected`. Status page with WhatsApp-style reassurance copy; notify by email (WhatsApp integration = v2 hook).
- Doctor review is **async**; in v1 an admin flips status and picks the plan/medication from the admin console.

### 4.4 Plan reveal & checkout
- Approved → "Rencana dari doktermu" page: chosen medication (name + BPOM status), monthly price, what's included, titration schedule (weight), **and for weight: the clinic-pickup/administration explainer** — "obat injeksi diambil/diberikan di klinik partner terdekat; jadwalmu diatur di aplikasi" (this is the regulatory line — never offer shipping for injectables).
- Plans: **weight GLP-1 tier** — Bulanan Rp X.XXX.XXX/bln · 3 Bulan (hemat ~10%, prepaid) · 6 Bulan (hemat ~15%, prepaid), dose-flat across titration. **Weight oral tier / Pil KB / Kulit / Rambut** — Bulanan · 3 Bulan · 6 Bulan, free shipping, auto-refill default ON. All non-GLP-1 plans are `delivery` type.
- Checkout: Midtrans (or Xendit) — e-wallets, VA, cards. v1 may stub payment behind a "mark paid" admin action; build the UI against a `PaymentProvider` interface.

### 4.5 Subscriber portal (`/akun`)
- Plan card (status, next billing, dose stage), next refill/pickup with countdown, order history, secure messages thread with care team (simple threaded messages, file/photo upload), pause/cancel flow (cancel allowed until 48h before processing; keep the copy honest — no dark patterns), edit address/payment.
- Weight extra: check-in widget (weekly weight log + side-effect flags → routed to care team), titration timeline.
- Pil KB extra: "sisa X hari" pill supply meter; refill ships 6 days before run-out.
- Kulit extra: progress photo log (monthly prompt, private, side-by-side compare) — the retention hook for a slow-results category.
- Rambut extra: same photo-log widget (shared component) + expectation timeline showing "kamu di bulan ke-N".

## 5. Content/SEO hub
- `/artikel` markdown-backed articles, category-tagged, each with "Ditinjau secara medis oleh dr. [Name]" byline + review date, and a contextual quiz CTA. Seed with 6 placeholder articles (3 weight, 3 KB). Comparison-page template ("[Brand] vs klinik pelangsingan", "Pil KB online vs beli di apotek") as a page type.

## 6. Admin console (`/admin`)
- Queues: intake review (view quiz+intake, set status, assign plan/med, write note to patient) · orders (status: pending, paid, preparing, shipped/ready-for-pickup, delivered) · subscriptions (upcoming renewals, pause/cancel) · messages inbox.
- Simple email-magic-link auth for admins in v1; log every status change (who/when).

## 7. Data model (minimum)

`users` (auth, profile, KTP name, DOB, address) · `quiz_responses` (category, answers jsonb, routed_tier, disqualified?, created_at) · `cases` (user, category, tier, status, assigned_plan, doctor_note) · `plans` (category, tier, name, monthly_price, term_months, discount_pct, dose_flat, fulfillment: delivery|clinic_pickup) · `subscriptions` (user, plan, status, next_billing, dose_stage) · `orders` (subscription, type: delivery|clinic_pickup, status, address/clinic) · `messages` (case, sender_role, body, attachment) · `clinics` (name, city, address, geo) · `articles` (slug, md, category, reviewer, reviewed_at) · `admins` + `audit_log`.

Stack guidance for Lovable: Supabase (Postgres + Auth + Storage) backend, React front. Enforce RLS: users see only their own rows; admin role for console.

## 8. Compliance requirements (non-negotiable — build these in)

1. **Never sell medication directly.** Every path to a drug goes through quiz → intake → doctor review. No "add to cart" on any medication. Med names on marketing pages carry: *"Obat keras. Hanya dengan resep dokter. Ketersediaan ditentukan oleh dokter setelah konsultasi."*
2. **Injectables are never shipped.** Order type for GLP-1 = `clinic_pickup` only. Do not build a shipping option for them.
3. **No Ozempic weight-loss marketing.** Only Wegovy/Mounjaro may appear on weight pages (BPOM weight indications). Ozempic must not appear in weight-loss copy at all.
4. Footer on every page: operating clinic name + address, PSEF/partner-apotek identifiers (placeholders), "Layanan telemedicine sesuai UU 17/2023 & PP 28/2024" line, BPOM disclaimer.
5. Telemedicine consent + privacy consent as explicit checkboxes with versioned text; store consent records.
6. Honest subscription mechanics: clear renewal date pre-purchase, cancellation self-serve, refund policy page.

## 9. Pricing placeholders (finance to confirm)
- Weight GLP-1 tier: **Rp 3.900.000/bln** dose-flat (anchor: retail Wegovy ~Rp 3,14jt/pen without any support); 3-bln prepaid Rp 3.500.000/bln; 6-bln Rp 3.300.000/bln.
- Weight oral tier: **Rp 749.000/bln** (meds + nutritionist coaching); 3-bln Rp 649.000/bln. Doubles as the anchor that makes the GLP-1 tier legible.
- Pil KB: **Rp 149.000/bln** incl. delivery; 6-bln Rp 129.000/bln. Postpil one-off: **Rp 99.000** incl. same-day-capable delivery.
- Kulit: **Rp 249.000/bln** (routine bundle); 3-bln Rp 219.000/bln.
- Rambut: **Rp 299.000/bln** (minoxidil + supplement); 3-bln Rp 269.000/bln.

## 10. Build order (milestones for Lovable)
1. Design system + Home + all four landing pages (static, real copy).
2. Quiz engine (config-driven questions, tier-routing + stop logic) + signup. Build once, configure per category.
3. Intake + case state machine + status page.
4. Admin console (review queue → approve/assign plan).
5. Plan reveal + checkout (stub payment) + subscription records.
6. Portal (plan card, orders, messages, check-ins).
7. Article hub + legal pages + SEO meta/sitemap.

## 11. Open items (owner decisions, not blockers to start)
- Brand name + domain. · Final pricing. · Payment provider (Midtrans vs Xendit). · WhatsApp Business API for notifications (v2). · Clinic network list for pickup (seed with Barawell's existing partners). · Whether to soft-launch the fully-deliverable categories first (pil KB, kulit, rambut, weight oral tier — zero clinic dependency) while the GLP-1 clinic network is signed. · Exact oral-tier and kulit formularies (doctor sign-off). · Postpil pharmacist-review workflow (OWA rules) vs treating it as a normal case.
