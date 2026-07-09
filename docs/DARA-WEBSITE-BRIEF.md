# DARA — Website Design Handoff

Design + build brief for the **Dara** public website and GLP-1 launch funnel. Hand this to
Claude's design tool / a designer. Goal: a premium women's-health telehealth site for
Indonesia, modeled on **Hers** and **Juniper**, launching with GLP-1 and architected to add
more categories later.

> This is the **public product site** — separate from the internal value-capture tracker in
> this repo. The tracker measures the bet; this site *is* the bet.

---

## 0 · The one job

Make a **skeptical, affluent Indonesian woman trust a brand-new brand enough to start a
medical weight program online** — a prescription injectable, ~Rp 3.4–3.9M/month. Trust is the
product; the site is the trust. Everything below serves that.

---

## 1 · Positioning

- **Brand:** Dara (Indonesian for "young woman") — a women's-health platform. Launch category:
  **GLP-1 metabolic / weight management.** Future: birth control, mental health, skin, hair.
- **Audience:** affluent urban Indonesian women, 28–50, health-conscious, discreet, time-poor,
  willing to pay premium for a trusted, doctor-led experience.
- **Tone:** a knowledgeable, discreet friend who happens to be a doctor. Warm, calm, premium,
  judgment-free. **Never** diet-culture-shrill, never clinical-cold, never bargain.
- **Frame weight as metabolic health, not "dieting"** — this dodges both stigma and ad-policy
  landmines, and it's the truthful, premium story.
- **Tagline options** (BM primary / EN):
  - "Kesehatan perempuan, ditangani dengan tenang." / "Women's health, handled with care."
  - "Metabolisme baru. Rasa percaya diri baru." / "A new metabolism. A new confidence."

---

## 2 · Reference benchmarks — what to borrow from each

| Brand | Borrow |
|---|---|
| **Hers** (forhers.com) | Warm editorial minimalism, confident serif headlines, product-forward layout, "as seen in" trust bar, assessment-led CTA rhythm. The overall *warmth + premium restraint*. |
| **Juniper** (myjuniper.com) — closest analog | Female GLP-1 *program* storytelling, real member results, visible clinical team, subscription clarity. This is the template for the program page. |
| **Ro / Rory** | Clinical authority, clean "how it works," doctor trust cues. |
| **Found / Calibrate** | The *metabolic-health* narrative (science, not diet). |
| **Eucalyptus/Pilot, Mochi, Noom** | Quiz/assessment funnel UX — one question per screen, progress, reassurance. |

Moodboard direction: Hers' warmth × Juniper's calm clinical credibility, localized premium.

---

## 3 · Visual language

**Palette** (warm-premium, feminine without the pink cliché):
- Canvas: warm cream `#F7F3EE`, off-white `#FBF9F6`
- Ink: warm aubergine/charcoal `#2A2228`
- Primary accent: clay / terracotta `#C97B5A`
- Soft accent: muted rose-clay `#C98A82`
- Calm secondary: sage / eucalyptus `#8FA48C` (clinical-natural)
- Deep premium tone: aubergine `#4A2E43` (trust sections, footer)
- Neutrals: warm sand/greys

**Typography:**
- Display: an editorial **serif** for headlines (premium, feminine, trustworthy) — e.g. Fraunces,
  Reckless, GT Sectra, or Canela. Large scale, generous leading.
- Body/UI: a clean humanist **sans** — Inter, General Sans, or Suisse.

**Photography:** real, diverse **Indonesian women**, natural warm light, aspirational-relatable
(not clinical stock). Lifestyle over product; show human care (the doctor). Medication shown
**discreetly and tastefully** — never glamorized (compliance).

**Feel:** soft rounded corners, gentle shadows, airy whitespace, editorial asymmetry, subtle
motion. Calm, uncluttered, expensive.

---

## 4 · Information architecture (launch = GLP-1)

**Top nav:** Dara · How it works · The program · Is it for me? *(quiz)* · Pricing · Science &
safety · Stories · Masuk *(login)* · **[Mulai — Start assessment]** *(primary CTA, persistent)*

Future categories shown as tasteful "Segera hadir / Coming soon": Kontrasepsi · Kesehatan mental · Kulit.

**Footer:** medical disclaimer, BPOM / telehealth-prescribing note, doctor credentials, privacy,
WhatsApp contact, payment icons.

---

## 5 · Homepage — section-by-section spec

1. **Hero** — outcome headline + subhead + primary CTA (assessment) + one trust line
   ("Diresepkan dokter. Dikirim diskret." / "Doctor-prescribed. Delivered discreetly.").
   Warm image of a confident Indonesian woman.
   - Headline (EN): "A calmer path to your healthiest weight."
   - Headline (BM): "Jalan yang lebih tenang menuju berat badan tersehatmu."
2. **Trust bar** — "Dipimpin dokter · Obat berlisensi · Pengiriman diskret · Pendampingan penuh"
   + press/credential logos when available.
3. **How it works — 3 steps** — Assessment → Doctor review & prescription → Delivered + ongoing
   care. One icon + one line each.
4. **The science (metabolic renewal)** — short, judgment-free explainer of how GLP-1 works;
   positions weight as *metabolic and medical*, not willpower.
5. **What's included (the program, not a drug)** — licensed medication (titration-managed) +
   doctor + adherence support + side-effect care (companion kit) + WhatsApp check-ins. Makes the
   premium price read as a *program*.
6. **Why Dara (differentiation = trust)** — named licensed doctors (photos), discreet packaging,
   transparent pricing, real human support. Directly answers "is this safe / legit?"
7. **Stories / results** — compliant testimonials; emphasize experience + confidence, **not**
   dramatic before/after (ad-policy + dignity).
8. **Pricing transparency** — clear monthly program price, what's included, pause/cancel,
   payment methods. No hidden costs, no fake urgency.
9. **Eligibility teaser → quiz CTA** — "Cari tahu apakah Dara cocok untukmu — asesmen privat 2 menit."
10. **FAQ** — safety, side effects, legality/BPOM, "what if I'm not eligible," doctor involvement,
    privacy/discretion.
11. **Footer** — disclaimers, regulatory, credentials.

---

## 6 · The eligibility assessment (the conversion engine)

Private, warm, ~2 minutes, **mobile-first**, one question per screen with a progress bar and
reassuring microcopy. This *is* the funnel — obsess over it.

Flow:
1. Goal + motivation (soft, welcoming open)
2. Basics — height, weight (→ BMI), age
3. Health screening — conditions, current medications, allergies
4. Contraindication check — pregnancy / breastfeeding, personal or family history of medullary
   thyroid cancer / MEN2, pancreatitis, active eating disorder, etc.
5. Result — "You may be a candidate — a doctor will confirm" **or** a gentle decline with
   alternatives (never a hard "no" with nothing)
6. Capture — name, WhatsApp, email → book async doctor consult / proceed to checkout

Design cues: judgment-free copy, privacy reminder up front, no dead-ends, celebrate progress.

---

## 7 · Conversion & trust mechanics (Indonesia-specific)

- **WhatsApp-first** support + consult reminders (the dominant channel here).
- Payments: **QRIS, GoPay / OVO / Dana, cards**; consider installment given the premium price.
- **Discreet packaging** promise + a note on cold-chain handling (signals medical seriousness).
- **Visible, real, licensed doctors** (names + credentials).
- Subscription trust: clear **pause / skip / cancel**.

---

## 8 · Compliance & copy guardrails (regulated Rx — non-negotiable)

- Rx-required framing everywhere ("tergantung persetujuan dokter"); **never** "buy Ozempic."
- No miracle or guaranteed-loss claims; **transparent** side effects.
- BPOM / telehealth-prescribing disclaimers (pending the G6 regulatory track).
- Tasteful medication imagery only; no glamorization.
- Privacy + discretion emphasized (medical and cultural sensitivity).

---

## 9 · Build notes

- **Separate project** from the internal tracker. Next.js + Vercel recommended (matches the
  existing stack); optional headless CMS for stories/FAQ.
- **Mobile-first** (Indonesian traffic is mobile + WhatsApp).
- Bahasa Indonesia primary; optional EN toggle.
- Wire **attribution/analytics from day one** (quiz starts → completion → consult → paid) — this
  is the G1 enabler; without it, the coming Shopee/paid spend is blind.

---

## 10 · First deliverables to design

1. **Homepage** — desktop + mobile.
2. **The eligibility assessment** flow — mobile-first.
3. **Pricing page.**
4. **A style tile** — palette, type, buttons, cards, form fields.

That's enough to validate the brand and stand up the funnel. Build the credible site first
(this brief), *then* point TikTok organic + Shopee at it — never before.
