# UI kit — Dara web (mobile-first)

Nine core screens composing the shared components (no re-implemented primitives):

- `HomeScreen.jsx` / `HomeDesktop.jsx` — editorial hero ("Kesehatanmu, aturanmu."), two-category decision, how-it-works, trust bar, articles, footer (mobile column / desktop 2-col hero + 4-col band + 3-col articles in `desktop.html`).
- `LandingBeratBadan.jsx` — landing with why-supervised explainer, honest 5–10% results range, price anchor + prepay calculator, doctor bios w/ STR/BPOM verification lines, FAQ, sticky bottom CTA.
- `LandingPilKB.jsx` — zero-euphemism hero, 3-step flow, never-run-out supply promise, discretion band, plan pricing, FAQ, sticky CTA.
- `QuizFlow.jsx` — one question per screen, auto-advance, contraindication gates (pregnancy, MEN2/medullary thyroid, pancreatitis) with kind hard stops, empathetic BMI result.
- `PlanReveal.jsx` — "Rencana dari doktermu": doctor + STR first, letter-style note, value stack before price, consent gate.
- `CheckoutScreen.jsx` — single column, summary pinned, QRIS/GoPay/OVO/VA/card, WhatsApp opt-in, renewal date in bold BEFORE the pay button, pause-vs-cancel stated.
- `PortalDashboard.jsx` — instrument-density: plan + renewal, weekly check-in, weight-trend chart, triage & injection-guide entries, titration timeline, supply meter, doctor messages (+WhatsApp), order card.
- `TriageFlow.jsx` — structured side-effect check-in branching to self-care (sage) / priority doctor review (info) / urgent IGD guidance (plain, direct — never alarm-red).
- `InjectionGuide.jsx` — pen how-to (video slot + 4 steps), 2–8°C storage rules, WhatsApp reminders + auto-refill logic.

`index.html` mounts everything in a 390px mobile frame with a screen switcher; the funnel is wired: landing → quiz → plan → checkout → portal → triage/guide. `desktop.html` shows the desktop home.

Imagery: striped monospace placeholders mark where real photography (candid, natural light) drops in.
