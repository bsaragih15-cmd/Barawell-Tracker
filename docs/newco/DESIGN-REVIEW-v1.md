# Design Review — Dara handoff v1 (Womens_Health_Platform_Design_1.zip)

*Reviewed 2026-07-10 against `PRD-LOVABLE.md` + `DESIGN-BRIEF.md`. Verdict: strong execution, 2 regulatory must-fixes + 2 structural gaps before build. Send §2 back to Claude design as the revision prompt.*

## 1. What's right (keep, don't relitigate)

- Token system matches the brief exactly (canvas/ink/terracotta/sage, Source Serif 4 + Inter, 8px scale, hairlines-over-shadows, tabular numerals on prices, reduced-motion handling). AA-aware tint/text pairings included.
- Full screen coverage: landing → quiz → plan reveal → checkout → portal for four flows, plus status states, triage, article, injection guide, desktop variants.
- MedicationCard component is compliant as specced: Wegovy/Mounjaro preference chips, "keputusan akhir oleh dokter," config-driven, no add-to-cart.
- Honest-commerce details survived: renewal date bold before pay button, consent never pre-checked, neutral-sender discretion cue, monthly default.

## 2. Required revisions (the revamp prompt)

**R1 — Remove Ozempic from every weight-loss and home surface. (Regulatory, must-fix.)**
The home hero animates a floating Ozempic pen, the weight landing hero uses `pens-trio.png` (includes Ozempic), and the landing med carousel includes an Ozempic card ("Indikasi diabetes tipe 2", "dengan resep"). The disclaimers don't cure it: Ozempic's BPOM indication is T2D-only, and any presence on weight-loss marketing surfaces reads as off-label promotion (PRD §8.3 says *never appears*). Fix: hero animation and trio image become Wegovy + Mounjaro only; delete the Ozempic carousel card and the `pen-ozempic*`/`tile-ozempic*` assets; keep the footnote line "Ozempic® tidak ditawarkan untuk berat badan" only in the FAQ, not beside product imagery.

**R2 — GLP-1 fulfillment must be clinic pickup, not delivery. (Regulatory, must-fix.)**
The category-aware CheckoutScreen ships every category with the neutral-sender delivery cue, and PlanReveal/InjectionGuide never mention a clinic. Non-insulin injectables cannot be home-delivered (PerBPOM 14/2024). Fix: for `bb` GLP-1 tier, checkout and plan-reveal show a **clinic-pickup module** (nearest partner clinic card w/ map pin, pickup scheduling, "obat injeksi diambil/diberikan di klinik partner" explainer); delivery UI remains for the oral tier and all other categories. Portal order card for GLP-1 shows pickup status, not shipment tracking.

**R3 — Pil KB is missing as a first-class flow. (Structural.)**
LandingPilKB / PlanRevealKB / PortalKB screens exist but there is no KB category card on Home and no `kb` flow in the navigator — KB is only a branch inside the weight quiz. Fix: add the Pil KB card to the home grid (it belongs in the 2×2 with Kulit/Rambut; Berat stays the feature card), give it its own flow (`lp-kb → quiz-kb → plan-kb → checkout-kb → portal-kb`), and include the Postpil fast-checkout section on its landing.

**R4 — Crisis safety strip missing from mental-health surfaces. (Safety.)**
"119 ext. 8" appears only in the global footer. Spec: a quiet persistent help strip on every Kesehatan Mental page *and quiz screen*, plus a full-screen warm referral state for crisis-flag answers (QuizMental has no such state today). Add both; the referral screen is a designed moment, not an error state.

## 3. Minor (fix in the same pass)

- Mounjaro shown at Rp 3.900.000/bln (same as Wegovy); PRD placeholder is Rp 4.400.000 — or intentionally price-flat, but then finance must bless the blended margin. Align one way.
- Home category card prices (Berat "Rp 1.200.000", Kulit 160rb, Rambut 140rb, Mental 149rb) drift from PRD §9 placeholders — sync once pricing is final.
- "Hingga 25% dalam uji klinis semaglutide dosis tinggi" cites a 72-week trial — keep, but legal should approve any efficacy-percentage claims for the ID market before launch.
- Weight quiz contains the KB branch (per R3, remove once KB is its own flow).

## 4. Process note

The bundle is a Babel-in-browser prototype (per its README) — reference only. Build target remains the PRD stack (Supabase + React); lift tokens/copy/layout, not the scaffolding.
