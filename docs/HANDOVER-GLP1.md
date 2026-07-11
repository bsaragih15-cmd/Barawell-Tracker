# HANDOVER — Double down on GLP-1

Handover for a fresh Claude session whose sole mission is to **advance the GLP-1 program** in the Barawell value-capture tool from a blocked set of ideas into a sequenced, owned, de-risked plan. Read `CLAUDE.md` first (operating rules), then this.

---

## 0 · Mission

GLP-1 (semaglutide/tirzepatide weight-management) is Barawell's single biggest lever to the Rp 1B/mo target — **~Rp 195M/mo gross at maturity, ~20% of the whole run-rate** — and it is entirely gated by regulatory and supply, not demand. Today the cluster is six initiatives, all at **Idea**, all **blocked**, with **no owners and no dates**. The job: turn it into a real, sequenced program.

Concretely, drive these outcomes:
1. **Unblock the root gate.** G6 (BPOM / telehealth-Rx pathway) blocks everything. Scope it, put a real owner + dates on it, advance it to Execute.
2. **Sequence the critical path** with dated milestones and owners end-to-end (G6 → F6/G5 → F4 → F5/B5).
3. **Validate the economics bottom-up** — replace the placeholder Rp 130M/Rp 50M pools with a real pricing × cohort × retention model, and flag if they're optimistic.
4. **Deepen the register** — break the cluster into finer initiatives where a single card hides real work (regulatory, sourcing/import licence, cold-chain, clinical protocol, demand, pricing).
5. Keep the tool honest: every change goes through the model (rule 1 — math in SQL), stable IDs (rule 3), migrations additive & numbered.

---

## 1 · Environment & access

| | |
|---|---|
| **Repo** | `bsaragih15-cmd/Barawell-Tracker` (GitHub) |
| **Default branch** | `main` |
| **Dev branch** | `claude/initiative-tracker-improve-cmglob` (develop here → PR to `main` → merge) |
| **Live app** | https://barawell-tracker.vercel.app (Vercel project `prj_UxA3LQsrdmEy6tO2o7nmXrShM7PA`, team `team_AnT6pPpJd4rd8AVT7CSvMajo`) — deploys on merge to `main` |
| **Supabase project** | `vabxprioxgklkjeytbvh` (name "barawell-cockpit"), region ap-southeast-1, ACTIVE_HEALTHY. The app reads this live. Use the Supabase MCP tools. |
| **Migrations applied** | `0001`–`0009` (see `supabase/migrations/`). Next is `0010`. Data/config edits also go via migrations for repo=reality. |
| **Deck (artifact)** | https://claude.ai/code/artifact/d9f7bc71-23d6-479e-810a-96285066024e |
| **Playbook (artifact)** | https://claude.ai/code/artifact/73b657e7-0124-4078-8746-bd7d363e820b |
| **Model state** | current_rev Rp 210M · target **Rp 1B** · 40 active initiatives · projected gross Rp 1.0B / risk-adj Rp 504M |

The deck/playbook are regenerated from a builder in the session scratchpad (`build-playbook.js` + `playbook-data.json`); if you need to regenerate, re-pull live data first (they're point-in-time snapshots).

---

## 2 · The GLP-1 cluster — current state (live)

All six are **stage 1 (Idea)**, **no owner**, **no due dates**. Gross/risk-adj are at Idea confidence (30%). Pools are **mature-state hypotheses** (D8) — validating them is part of the mission.

| ID | Name | Gross/mo | Risk-adj/mo | Build | Run/mo | Depends on | Blocked by | KPI |
|----|------|---------:|------------:|------:|-------:|------------|------------|-----|
| **G6** | Regulatory & telehealth-Rx pathway *(enabler — the root gate)* | — | — | 10M | 1M | — | *(none — start here)* | — |
| **G5** | Cold-chain & licensed sourcing *(enabler)* | — | — | 30M | 5M | G6 | G6 | — |
| **F6** | Eligibility & safety screening | 12M | 4M | 8M | 1.5M | G6 | G6 | — |
| **F4** | GLP-1 weight-management program | 130M | 39M | 40M | 15M | G6, G5, F6 | F6, G5, G6 | 300 active patients |
| **F5** | Subscription & titration adherence | 50M | 15M | 12M | 3M | F4, G3 | F4, G3 | 60% month-3 retention |
| **B5** | Companion & side-effect bundle *(AOV)* | 3M | 1M | 3M | 0.5M | F4 | F4 | 30% attach |

**Cluster totals:** ~Rp 195M gross · ~Rp 59M risk-adj · ~Rp 103M one-off build · ~Rp 26M/mo run.

### Dependency graph (the critical path)
```
G6 (BPOM / Rx pathway)  ← the legal gate, nothing moves until this clears
 ├─→ G5 (cold-chain & sourcing)   ┐
 └─→ F6 (eligibility screening)   ├─→ F4 (program launch, pilot 25) ─→ F5 (subscription)
                                  ┘                                  └─→ B5 (companion bundle)
G3 (COGS/margin model) also gates F5 (pricing the subscription).
```
G6 is the only unblocked node. Everything else waits on it. **Sequence, not parallel.**

### Existing milestones (all open, undated)
- **G6:** BPOM classification opinion obtained
- **G5:** Cold-chain 3PL shortlisted
- **F4:** Regulatory pathway confirmed (G6) · Cold-chain supplier signed (G5) · Clinical protocol + consult flow drafted · Pilot cohort (25 patients) live

---

## 3 · Suggested workstreams (double-down backlog)

Pick top-down; confirm scope with the founder where flagged. Each edit flows through the model.

**A. Sequence & own the critical path** *(fast, high-value)*
- Assign owners (PICs: Andrew / Berthin / Jimmy — table `pics`) to each of the six, especially G6.
- Add **dated** milestones across the chain; make G6 the near-term focus and advance it to **Execute** once scoping actually starts.
- Use the drawer's playbook fields (`how_it_works`, `steps`, `done_when`) — already seeded, refine them.

**B. Regulatory track (G6) — the unlock**
- Scope the BPOM classification for GLP-1 + telehealth prescribing rules + import/distribution licence. This likely splits into ≥2 initiatives (legal classification vs import/distribution licence).
- Decide the **sourcing model** — this is the pivotal fork (see §4).

**C. Economics validation** *(replaces the placeholder pools)*
- Build a bottom-up GLP-1 model: price per titration-month × active patients × retention curve → monthly revenue; GLP-1 COGS (higher than base) → true margin; CAC for a regulated category. Compare to the Rp 130M (F4) / Rp 50M (F5) pools and **revise or flag** (D8).
- Consider adding `kpi_baseline`s and a leading indicator per initiative.

**D. Deepen the register**
- Where a card hides real work, split it (rule 3: new IDs in-bucket, e.g. `F7`, `G7`; never renumber). Candidates: import/distribution licence, clinical protocol/medical governance, GLP-1 demand/marketing (compliant), pricing/titration cohort tiers.

**E. Surface it** *(optional)*
- A GLP-1-specific view or one-page deck for partners (clinical, regulatory, 3PL) — reuse the ledger aesthetic and the existing builder.

---

## 4 · Open decisions for the founder (surface these; don't assume)

1. **Sourcing model** — branded import (Wegovy/Mounjaro, licence-heavy, higher COGS) **vs** compounded semaglutide (different regulatory + clinical risk). This drives G6, G5, and the economics. **Biggest fork.**
2. **Build budget** — the ~Rp 103M one-off is currently unapproved and should be **staged on the gates** (release G5 cold-chain spend only after G6 clears).
3. **Regulatory owner** — founder + external counsel? Who drives BPOM?
4. **Target volume & pricing** — the KPI is 300 active patients; confirm the price point and titration cadence the model should assume.

Use `AskUserQuestion` for these rather than guessing — they change the numbers materially.

---

## 5 · Guardrails (from CLAUDE.md — don't violate)

- **Scoring math lives in SQL** (`v_initiatives_scored`), never re-implemented in the frontend. Change the migration + view.
- **Stable IDs, never renumber.** New GLP-1 initiatives get the next free ID in their bucket (F… or G… for enablers — note `left(bucket,1)='G'` forces the Enabler quadrant).
- **Migrations additive & numbered;** never edit a run migration in place. Apply to the live Supabase project and commit the file.
- **Service-role key is server-only.** Don't move it client-side.
- **Money in Rp, mono tabular numerals;** register voice, "so-what" titles, RAG.
- **Don't advance a stage-gate to fake confidence** — advancing L1→L4 jumps value to 90%. Only move state when the work is genuinely there.

---

## 6 · Kickoff prompt for the new session

> You are picking up a dedicated workstream to **double down on the GLP-1 program** in the Barawell value-capture tracker. Read `docs/HANDOVER-GLP1.md` and `CLAUDE.md`, then confirm the current GLP-1 cluster state against the live Supabase project (`vabxprioxgklkjeytbvh`). Start with workstream A (sequence & own the critical path) and surface the §4 founder decisions — especially the sourcing-model fork — before changing any economics. Develop on `claude/initiative-tracker-improve-cmglob`, migrations start at `0010`.
