# GLP-1 STRATEGY — the demand-first pivot

Living strategy note for the GLP-1 program. Supersedes the framing in `docs/HANDOVER-GLP1.md`
(which assumed supply/regulatory was the root gate). Decisions settled in the 2026-07-09
founder session. Register voice; RAG in the tool.

## So-what

GLP-1 is no longer a *supply* problem — it's a *demand and trust* problem. Supply is
secured (branded Mounjaro/Ozempic via **Pharmaxy**) and already selling small-scale, so the
handover's "G6 regulatory / G5 cold-chain is the root gate" framing is retired. The binding
constraints are getting a **cold, mostly-female audience to want it and to trust a new brand
with a prescription injectable online.**

## Founder decisions (2026-07-09)

1. **Sourcing = branded import** (Mounjaro/Ozempic), supply secured via Pharmaxy. Regulatory
   (G6) is now a *de-risk-before-scale* track, not a universal blocker.
2. **Positioning = broad weight-management, female-led**, under a **standalone sub-brand**
   (name TBD) — a men's-ED brand ("Barawell") can't credibly sell female weight-loss, so the
   funnel is walled off (own landing + TikTok handle + Shopee store).
3. **Bottlenecks = demand and trust.** These now define the critical path.
4. **Channels = TikTok organic + Shopee + own site.** Paid stays *off the drug itself*
   (policy risk) — compliant education/lifestyle/results content; attribution before any paid.
5. **Pilot-first.** Prove month-2/3 retention on a small cohort before scaling content/ads.

## Reshaped critical path

```
G7 demand & content engine (TikTok organic + Shopee + site)  ┐
G8 trust & clinical credibility (consult + proof + discreet) ├─→ F4 pilot ─→ F5 retention/subscription
F6 eligibility & safety screening (also lead capture)        ┘         └─→ B5 companion bundle
G6 regulatory de-risk — PARALLEL; must clear before paid ad-scale.
G5 cold-chain last-mile — needed before volume, not before the pilot (supply secured).
```

## The brand: Dara — a women's-health platform (ForHers model)

The standalone brand is **Dara** (Indonesian for "young woman"), reframed from a weight brand
into a **women's-health platform**. **GLP-1 is the launch category**; birth control, mental
health, skin follow once the platform + trust are proven. Positioning is **affluent-premium**:
COGS Rp 2.7M at 20–30% margin ⇒ price ~Rp 3.4–3.9M/mo (premium, not mass). The trust layer is a
reusable platform capability, not a one-off.

**Website-first.** You don't drive demand to a site that can't convert an Rx purchase, so
**G8 (the Dara site + trust) is built before G7 (TikTok/Shopee demand) scales** — encoded as a
hard dependency (G7 → G8). Design handoff: `docs/DARA-WEBSITE-BRIEF.md` (modeled on Hers + Juniper).

## Register map (live in the tool)

| ID | Role | Owner | Stage |
|----|------|-------|-------|
| **F4** | Dara — GLP-1 metabolic program (the launch category). Gated by G8/G7/F6. | Andrew | Idea |
| **G8** | **Dara website + trust layer — build FIRST.** The credible site + funnel + clinical trust. | Andrew | Idea |
| **G7** | Demand & content engine (TikTok organic + Shopee). **Gated by G8** (website-first). Owner set. | Berthin | Idea |
| **F6** | Eligibility & safety screening; doubles as lead capture (the assessment). | Andrew | Idea |
| **F5** | Titration/adherence subscription — GLP-1 economics are *entirely* retention. | Jimmy | Idea |
| **B5** | Companion side-effect bundle — cuts nausea churn + AOV. | Andrew | Idea |
| **G6** | Regulatory de-risk before ad-scale (parallel, no longer gating the pilot). | Berthin | **Execute** |
| **G5** | Cold-chain last-mile + backup sourcing (supply secured via Pharmaxy). | Berthin | Idea |

## Open items (need a founder call / owner)

- **Build the Dara site (G8)** — the current active workstream. Design brief ready
  (`docs/DARA-WEBSITE-BRIEF.md`); next is brand identity + homepage + eligibility assessment.
- **Availability checks** (deferred by founder): domain / IG / TikTok / Shopee handle for "Dara".
- **Economics validation (D8/D21, still HELD).** Real price ≈ Rp 3.4–3.9M/mo (COGS Rp 2.7M @
  20–30%); the earlier Rp 1.5–2M was below cost. Rp 130M pool ≈ ~36 patients at true price — a
  credible year-1 steady state; 300 is the north-star (>Rp 1B/mo alone). GLP-1's 20–30% margin is
  far below the model's global 55%, so the tool **overstates GLP-1 gross profit** — fix later with
  a per-initiative margin field. **Pool numbers unchanged until validated.**
- **Attribution (G1)** must be live before any paid Shopee spend, or CAC is blind.
- **Platform expansion** (later): birth control + mental health widen the regulatory surface
  (anxiety meds are prescribing-heavy / partly controlled) — GLP-1-first keeps the beachhead clean.
- **G7/G8 milestones** — add dated milestones so they carry RAG like the rest of the chain.

## What's already done (migrations 0010–0011)

- **0010** — owners across the cluster; G6 → Execute; branded-import playbook; dated critical-path
  milestones end-to-end.
- **0011** — the demand-first pivot: new G7 (demand) + G8 (trust) enablers; F4 reframed to broad/
  female-led/standalone/pilot-first and re-gated to F6/G7/G8; G6 → parallel de-risk; G5 → last-mile.
