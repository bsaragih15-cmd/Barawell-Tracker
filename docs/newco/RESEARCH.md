# NewCo Research Memo — Women's health D2C (GLP-1 + birth control), Indonesia

*Synthesized 2026-07-09 from four research briefs (Hers teardown · ID regulation · ID competitors · GLP-1 economics). Companion docs: `PRD-LOVABLE.md`, `DESIGN-BRIEF.md`.*

## The one-paragraph so-what

A Hers-style women's brand is buildable in Indonesia today, but the shape is dictated by one regulation: **non-insulin injectables cannot be sold/delivered online** (PerBPOM 14/2024). So the GLP-1 offer must be a *doctor-led program subscription* (consult + coaching + titration + refill logistics) with in-person dispensing/administration touchpoints — not a "med in a box." Birth control pills, by contrast, are the cleanest fully-online telehealth category in the country and are competitively **uncontested**. Halodoc's "Halofit Transform" (~Rp 3.3jt/mo GLP-1 program) is the price benchmark; the counter-position is brand, discretion, and retention — the Hers playbook — not access.

## 1. Regulatory reality — what's legal, what's not

**Workable stack (the Halodoc pattern):** Kominfo PSE-registered platform + licensed **klinik** (SIP doctors, e-med-records integrated with SATUSEHAT per Permenkes 24/2022) issuing e-prescriptions under UU 17/2023 + PP 28/2024 Art. 561 → **PSEF** registration (psef.kemkes.go.id, requires PT, apoteker, partner-apotek commitment) → fulfillment by licensed partner apotek.

**Legal per category:**
- **Oral contraceptives** — obat keras but telemedicine e-Rx → apotek delivery is legal; emergency contraception is OWA (pharmacist-dispensable). Injectable KB / implants: no online sale; need physical touchpoints.
- **GLP-1s** — Wegovy (semaglutide 2.4mg) BPOM-approved with weight indication (PAR Jun 2024, launch 2025, ~**Rp 3.14jt/pen ≈ 1 month**). Mounjaro (tirzepatide) registered Feb 2026, weight indication added Jul 2026, Rp 3.5–6jt/pen. Ozempic is T2D-only — **marketing it for weight loss is illegal**. Saxenda registration uncertain and economics are terrible (Rp 7.5–12jt/mo) — ignore.
- **Hard blockers:** home delivery of GLP-1 injectables; marketplace sale of obat keras (this is exactly why Barawell's Tokopedia stores get blocked — structural, won't reverse); compounded semaglutide at scale (no 503A/B equivalent); Ozempic-for-weight-loss claims.

**Verify before committing money:** pending Permenkes implementing PP 28/2024's telehealth chapter; exact PerBPOM 14/2024 closed-loop scope (whether any injectable exception exists beyond insulin); enforcement posture on clinic-courier delivery of injectables; Saxenda status at cekbpom.pom.go.id.

## 2. Competition — one benchmark, one open lane

- **Halodoc** is the incumbent and already sells GLP-1 D2C: Ozempic pens Rp 2.85–3.06jt and **Halofit Transform**, a packaged doctor-supervised GLP-1 injection program ("10–12 kg in 2 months") from **~Rp 3.3jt/mo**. Novo Holdings is an investor. This is the offer to beat — on brand/experience, not price.
- **Alodokter / KlikDokter / Good Doctor / SehatQ**: horizontal, consult-first, weak or non-D2C; no women's vertical.
- **Vertical D2C:** Sirka (YC-backed coaching, no Rx evidence), Dietela (coaching), Nona Woman (femtech content/products, no Rx). **No birth-control telehealth subscription exists in Indonesia.** Regional proof: OVA (SG/PH), Dear Doc (SG), Noah/Zoey — none entered Indonesia.
- Read: GLP-1 = contested on access, open on experience. Birth control = fully open; the gate is regulatory/cultural, not competitive.

## 3. The Hers playbook (what to copy, what to skip)

**Copy:**
- **Quiz-first, checkout-last.** Free assessment (one question at a time, mobile tap-through) before any price is shown; sunk-cost investment → intake → async provider review → Rx → subscription.
- **Price anchoring.** "From Rp X/mo" house program beside the branded-drug retail price (Rp 3.1jt/pen) so the program reads as the smart buy.
- **Prepay as the discount mechanism.** Hers: oral kits from $69/mo *on 10-month prepay*; GLP-1 from $199/mo *on 6-month prepay*. Prepay locks revenue and hides churn.
- **Auto-refill timed 6 days before run-out; free shipping; unlimited care-team messaging** as the retention wrapper around a commodity Rx.
- **SEO/content moat** with medically-reviewed bylines; symptom-based framing widens TAM (birth control sold as "period care", not just contraception).
- **Trust furniture:** licensed-provider claims, named pharmacy partners, FDA(→BPOM)-approved vs off-label distinctions made explicit.

**Skip / adapt:** US compounded-semaglutide arbitrage (dead there — Novo settlement Mar 2026 — and never legal here). Hers' aggressive cancellation friction (500+ BBB complaints) — prepay achieves the same lock-in without the reputational tax.

## 4. Economics — where the margin actually is

- Drug COGS at label dose: Wegovy ~Rp 3.1jt+/mo, Mounjaro Rp 3.5–6jt/mo. HET caps apotek markup (~25%); on a Rp 3jt pen the pharmacy layer earns only ~Rp 450–750rb.
- **The margin is the service bundle, not the drug**: consults, coaching, titration management, and prepay — priced on top of (or flat across) drug COGS. This is how Juniper AU (AU$349–499/mo), Noah SG (SGD 200–500/mo), and Halofit (Rp 3.3jt/mo) all work. HET does not cap program/service fees.
- Dose-flat pricing (same monthly price across titration steps) smooths COGS variance and simplifies the offer.
- Birth control: pills retail cheap (Hers sells from $12/mo); it is a **low-AOV, high-retention, low-CAC feeder** — the relationship product that cross-sells the Rp 3jt+ weight program.
- Watch item: **oral semaglutide (Wegovy pill)** covered in Indonesian press Dec 2025–Feb 2026 as incoming. An oral GLP-1 escapes the injectable-delivery ban entirely and would make the category fully home-deliverable — a step-change for this model. Design the platform so the hero SKU can switch.

## 5. Implications baked into the PRD

1. New sister brand (women's), shared Barawell backend (doctors, apotek partners, ops).
2. Two launch categories: **Program Berat Badan (GLP-1)** — subscription program with in-person dispense/administration nodes; **KB / Kesehatan Reproduksi (pill subscription)** — fully online, auto-refill.
3. Funnel = quiz → account → intake → doctor review → plan + price reveal → prepay checkout → subscription portal.
4. Compliance is a feature: BPOM-registered meds only, named klinik/apotek partners, no marketplace channel, no Ozempic weight-loss claims.
5. Pricing hypothesis (validate): weight program **Rp 3.5–4.5jt/mo dose-flat**, minus ~10–15% on 3-month prepay; pill subscription **Rp 99–199rb/mo** delivered.

## Sources (primary)

Regulation: PP 28/2024 (ipkindonesia.or.id PDF) · PerBPOM 8/2020 & 14/2024 (peraturan.bpk.go.id, registrasiobat.pom.go.id) · psef.kemkes.go.id · Permenkes 24/2022 (satusehat.kemkes.go.id) · Permenkes 73/2016.
BPOM PARs: Wegovy 12420800871723426795.pdf · Ozempic 01720165639.pdf · pom.go.id tirzepatide release.
Market: halodoc.com/dc/halofit/weight_loss · halodoc.com Ozempic/Wegovy listings · mandjur.co.id · infolabmed.com Mounjaro pricing.
Playbook: forhers.com /weight-loss /birth-control /weight-loss/drug-pricing · hims.com/weight-loss/drug-pricing · novocare.com Wegovy price guide · myjuniper.com/pricing · ofnoah.sg pricing blog · noom.com/med/pricing.
Uncertainty flags retained from source briefs: Saxenda apotek price & registration; Wegovy maintenance-dose Rp pricing; Mounjaro exact dates; Sirka current offering; live forhers.com copy (proxy-blocked, reconstructed from snippets).
