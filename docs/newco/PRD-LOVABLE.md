# PRD — [Brand] Women's Health Platform (Indonesia)

*Handoff document for Lovable. Written to be pasted (whole or per-section) as build prompts. Companion: `DESIGN-BRIEF.md` (visual system — give Lovable both), `RESEARCH.md` (why the model looks like this).*

## 0. TL;DR for the builder

Build a mobile-first D2C telehealth storefront for Indonesian women, modeled on forhers.com, with two product lines:

1. **Program Berat Badan** — a doctor-led GLP-1 weight-loss program sold as a monthly subscription (consult + coaching + medication managed via partner clinics — the drug itself is dispensed in person, never shipped).
2. **Pil KB** — birth-control pill subscription with online doctor review and home delivery, auto-refill.

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
/                       Home — brand promise, two category cards, how-it-works, trust bar
/berat-badan            Weight program landing (hero category)
/berat-badan/harga      Program pricing w/ branded-drug price anchor
/pil-kb                 Birth control landing
/kuis/berat-badan       Assessment quiz (weight)
/kuis/pil-kb            Assessment quiz (birth control)
/intake                 Post-quiz medical intake (auth required)
/akun                   Subscriber portal (plan, refills, messages, orders)
/checkout               Plan selection + prepay + payment
/artikel …              Content/SEO hub (CMS-lite: markdown)
/tentang, /dokter       About + medical team (trust pages)
/legal/*                T&C, privacy, telemedicine consent, refund policy
/admin                  Ops console (protected)
```

## 4. The funnel (core spec)

### 4.1 Landing pages (`/berat-badan`, `/pil-kb`)
- Hero: so-what headline + single CTA → quiz. Weight: *"Turun berat badan dengan pendampingan dokter — bukan sekadar obat."* CTA: **"Mulai Konsultasi Gratis"**. Pil KB: *"Pil KB diantar ke rumahmu, dengan resep dokter — tanpa antre, tanpa canggung."* CTA: **"Cek Kecocokanmu"**.
- Sections (weight): how it works (4 steps: Kuis → Ditinjau dokter → Rencana & harga → Pendampingan bulanan) · medications block (Wegovy®/Mounjaro® shown as *BPOM-approved options your doctor may prescribe* — never purchasable directly; include mandatory disclaimer §8) · price anchor module (drug retail ~Rp 3,1jt/pen vs "Program mulai Rp X jt/bln — konsultasi & pendampingan termasuk") · doctor credibility strip (photos, STR-licensed) · FAQ · testimonials placeholder.
- Sections (pil KB): 13-formulations-style "one right pill for you" module · framing includes period-symptom benefits (acne, cramps, cycle control), not only contraception · discretion promise (plain packaging) · auto-refill explainer ("dikirim 6 hari sebelum habis") · FAQ.
- No prices anywhere above the fold; price appears only in the anchor module and after quiz completion.

### 4.2 Quiz (`/kuis/*`) — the signature interaction
- One question per screen, big tap targets, progress bar, auto-advance on select, back control. 60–90 seconds, 10–14 questions. No account required until the end.
- Weight quiz: goal, sex/age, height+weight (→ compute & show BMI empathetically), medical history flags (diabetes, thyroid, pregnancy/planning, eating disorder), current meds, prior weight-loss attempts, city (→ clinic-network availability), how-did-you-hear.
- **Hard stops** (kind, non-judgmental screen + alternative suggestions): BMI < 25 without comorbidity · pregnant/breastfeeding · age <18 · history of medullary thyroid carcinoma/MEN2 · type 1 diabetes.
- Pil KB quiz: age, smoking status + age>35 combo (→ progestin-only routing), blood-pressure known?, migraine with aura, clot history, breastfeeding, current method, what matters most (skin/cramps/no-daily-pill…).
- End screen: "Kamu kemungkinan cocok ✓ — buat akun untuk ditinjau dokter" → signup (phone/WhatsApp OTP preferred, email fallback). Persist quiz answers to the account.

### 4.3 Intake & doctor review
- Authenticated intake: ID (KTP) name + DOB, address, photo upload (required for Rx per telemedicine norms), consent checkboxes (telemedicine consent, data/privacy, program terms).
- State machine per case: `submitted → in_review → approved(plan) | needs_info | rejected`. Status page with WhatsApp-style reassurance copy; notify by email (WhatsApp integration = v2 hook).
- Doctor review is **async**; in v1 an admin flips status and picks the plan/medication from the admin console.

### 4.4 Plan reveal & checkout
- Approved → "Rencana dari doktermu" page: chosen medication (name + BPOM status), monthly price, what's included, titration schedule (weight), **and for weight: the clinic-pickup/administration explainer** — "obat injeksi diambil/diberikan di klinik partner terdekat; jadwalmu diatur di aplikasi" (this is the regulatory line — never offer shipping for injectables).
- Plans: **weight** — Bulanan Rp X.XXX.XXX/bln · 3 Bulan (hemat ~10%, prepaid) · 6 Bulan (hemat ~15%, prepaid). Dose-flat: price does not change with titration dose. **Pil KB** — Bulanan Rp XXX.XXX · 3 Bulan · 6 Bulan, free shipping, auto-refill default ON.
- Checkout: Midtrans (or Xendit) — e-wallets, VA, cards. v1 may stub payment behind a "mark paid" admin action; build the UI against a `PaymentProvider` interface.

### 4.5 Subscriber portal (`/akun`)
- Plan card (status, next billing, dose stage), next refill/pickup with countdown, order history, secure messages thread with care team (simple threaded messages, file/photo upload), pause/cancel flow (cancel allowed until 48h before processing; keep the copy honest — no dark patterns), edit address/payment.
- Weight extra: check-in widget (weekly weight log + side-effect flags → routed to care team), titration timeline.
- Pil KB extra: "sisa X hari" pill supply meter; refill ships 6 days before run-out.

## 5. Content/SEO hub
- `/artikel` markdown-backed articles, category-tagged, each with "Ditinjau secara medis oleh dr. [Name]" byline + review date, and a contextual quiz CTA. Seed with 6 placeholder articles (3 weight, 3 KB). Comparison-page template ("[Brand] vs klinik pelangsingan", "Pil KB online vs beli di apotek") as a page type.

## 6. Admin console (`/admin`)
- Queues: intake review (view quiz+intake, set status, assign plan/med, write note to patient) · orders (status: pending, paid, preparing, shipped/ready-for-pickup, delivered) · subscriptions (upcoming renewals, pause/cancel) · messages inbox.
- Simple email-magic-link auth for admins in v1; log every status change (who/when).

## 7. Data model (minimum)

`users` (auth, profile, KTP name, DOB, address) · `quiz_responses` (category, answers jsonb, disqualified?, created_at) · `cases` (user, category, status, assigned_plan, doctor_note) · `plans` (category, name, monthly_price, term_months, discount_pct, dose_flat) · `subscriptions` (user, plan, status, next_billing, dose_stage) · `orders` (subscription, type: delivery|clinic_pickup, status, address/clinic) · `messages` (case, sender_role, body, attachment) · `clinics` (name, city, address, geo) · `articles` (slug, md, category, reviewer, reviewed_at) · `admins` + `audit_log`.

Stack guidance for Lovable: Supabase (Postgres + Auth + Storage) backend, React front. Enforce RLS: users see only their own rows; admin role for console.

## 8. Compliance requirements (non-negotiable — build these in)

1. **Never sell medication directly.** Every path to a drug goes through quiz → intake → doctor review. No "add to cart" on any medication. Med names on marketing pages carry: *"Obat keras. Hanya dengan resep dokter. Ketersediaan ditentukan oleh dokter setelah konsultasi."*
2. **Injectables are never shipped.** Order type for GLP-1 = `clinic_pickup` only. Do not build a shipping option for them.
3. **No Ozempic weight-loss marketing.** Only Wegovy/Mounjaro may appear on weight pages (BPOM weight indications). Ozempic must not appear in weight-loss copy at all.
4. Footer on every page: operating clinic name + address, PSEF/partner-apotek identifiers (placeholders), "Layanan telemedicine sesuai UU 17/2023 & PP 28/2024" line, BPOM disclaimer.
5. Telemedicine consent + privacy consent as explicit checkboxes with versioned text; store consent records.
6. Honest subscription mechanics: clear renewal date pre-purchase, cancellation self-serve, refund policy page.

## 9. Pricing placeholders (finance to confirm)
- Weight program: **Rp 3.900.000/bln** dose-flat (anchor: retail Wegovy ~Rp 3,14jt/pen without any support); 3-bln prepaid Rp 3.500.000/bln; 6-bln Rp 3.300.000/bln.
- Pil KB: **Rp 149.000/bln** incl. delivery; 6-bln Rp 129.000/bln.

## 10. Build order (milestones for Lovable)
1. Design system + Home + both landing pages (static, real copy).
2. Quiz engine (config-driven questions, hard-stop logic) + signup.
3. Intake + case state machine + status page.
4. Admin console (review queue → approve/assign plan).
5. Plan reveal + checkout (stub payment) + subscription records.
6. Portal (plan card, orders, messages, check-ins).
7. Article hub + legal pages + SEO meta/sitemap.

## 11. Open items (owner decisions, not blockers to start)
- Brand name + domain. · Final pricing. · Payment provider (Midtrans vs Xendit). · WhatsApp Business API for notifications (v2). · Clinic network list for pickup (seed with Barawell's existing partners). · Whether to soft-launch pil KB first (fully online, zero clinic dependency) while the clinic network for GLP-1 is signed.
