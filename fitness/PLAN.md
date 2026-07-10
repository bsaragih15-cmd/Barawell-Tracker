# Body Cockpit — Plan of Record

**Two goals, one body, one calendar.** Cut to single-digit body fat *and* arrive fit for a Half Ironman (70.3) in October. This is the task register behind `cockpit.html`. RAG = status; L1–L5 = how hardened the work is.

> Dates assume today = 2026-07-10 and race ≈ 2026-10-18 (~14 weeks). Adjust the race date in the cockpit's **Baseline & targets** and everything reflows.

---

## The honest read (don't skip this)

The two goals are **partially in conflict**, and the model should not pretend otherwise:

- A calorie deficit deep enough to reach single-digit BF **degrades endurance adaptation and recovery** — exactly what a 70.3 build needs most.
- You cannot maximize both in the same 14 weeks. You periodize.

**Recommended sequencing:**
1. **Now → ~6 weeks out (early Sept):** moderate deficit (~0.5 kg/wk). Fat loss *and* base building coexist while volume is still moderate.
2. **Peak build (6 → 2 weeks out):** shift to **maintenance calories**. Protect the biggest training sessions of the year. Fat loss pauses — that's the plan, not a failure.
3. **Race week:** taper + carb load, not deficit.
4. **After the race:** resume the deficit and finish the cut to single digits.

Reaching **true single-digit BF (<10%)** is a photoshoot-lean, hard-to-hold level. Expect the last 3–4 points to be the slowest. The cockpit's amber banner fires automatically when the deficit and the build collide.

---

## Track S — Setup & instrumentation *(do first)*

| ID | Initiative | So-what | Stage | RAG |
|----|-----------|---------|-------|-----|
| S1 | Baseline capture | Anchor the real numbers before optimizing anything | L5 | 🟢 |
| S2 | App sync live | One data spine: Apple Health ⇄ Strava ⇄ Polar ⇄ MFP | L2 | 🟠 |

**S1 — tasks**
- [ ] Morning weigh-in protocol: same time, post-toilet, pre-food, 5×/wk → trend, not single readings.
- [ ] Get a **DEXA scan** (or 7-site caliper) for a true BF baseline. Re-scan every 4–6 wks.
- [ ] Enter all of it in **Baseline & targets** (start weight, start BF, target BF, race date, longest swim/bike/run).

**S2 — tasks** *(needs an interactive session for the OAuth linking)*
- [ ] Make **Apple Health** the hub; grant Strava, Polar Flow, MyFitnessPal read/write on Body Mass, Body Fat %, Active Energy, Dietary Energy, Protein, Workouts, Heart Rate.
- [ ] Polar Flow → Connect → Apple Health + Strava (HR-zone data flows through).
- [ ] Weekly export via `Health Auto Export` (iOS) → paste into the **Daily Log** tab.
- [ ] *(Later)* Wire Zapier: Strava activity → tracker row, so logging becomes automatic.

---

## Track A — The cut (single-digit body fat)

| ID | Initiative | So-what | Stage | RAG |
|----|-----------|---------|-------|-----|
| A1 | Hold a clean deficit | The whole cut is adherence to kcal + protein | L4 | 🟢 |
| A2 | Lean-mass protection | Lose fat, not muscle — 2× lifts/wk | L3 | 🟠 |
| A3 | Periodize around the race | Maintenance in peak build, resume after | L2 | 🟠 |

**Operating targets** (auto-computed in the cockpit, shown for reference):
- **Calorie target** = TDEE − 500–600 kcal (≈0.5–0.55 kg/wk).
- **Protein floor** ≈ 2 g per kg **lean** mass — non-negotiable during a deficit.
- **Cap loss at ~1%/wk** of bodyweight. Faster = muscle loss + wrecked training.

**Tasks**
- [ ] Log every day in MyFitnessPal; hit protein floor first, calories second.
- [ ] 2× full-body resistance sessions/wk (keeps lean mass, keeps target weight honest).
- [ ] Weekly: read the trend on the cockpit, adjust intake ±150–250 kcal only if the 2-wk trend says so.
- [ ] At ~6 weeks out, execute A3: switch to maintenance until after the race.

---

## Track B — Race readiness (70.3 in October)

70.3 = **1.9 km swim · 90 km bike · 21.1 km run.** Readiness = your longest recent session ÷ the race leg.

| ID | Initiative | So-what | Stage | RAG |
|----|-----------|---------|-------|-----|
| B1 | Aerobic base (Z2 engine) | 80/20 easy volume builds the diesel engine | L4 | 🟢 |
| B2 | Long ride build → 90k+ | The bike makes or breaks your race | L3 | 🟠 |
| B3 | Long run build → 18–21k | Run off tired legs (bricks) | L3 | 🟠 |
| B4 | Open-water swim → 1.9k | Continuous 1.9k + sighting, not pool-only | L2 | 🔴 |
| B5 | Taper & race-day fuelling | 60–90 g carb/hr; nothing new on race day | L1 | 🟠 |

**Weekly build rules**
- **80/20**: ~80% of volume easy (Polar HR-capped, Zone 2). This is where most people get it wrong.
- **Progress long sessions ≤10%/wk.** Cockpit shows the exact `+per week` needed to close each gap by taper.
- **One brick/wk** (bike→run) from ~8 weeks out.
- **Swim is your current limiter** (see cockpit) — bias the next block there and get open-water reps.
- **2-week taper** before race day; volume down, intensity touches stay.

**Tasks**
- [ ] Set your true longest swim/bike/run in **Baseline** so readiness is real.
- [ ] Build the long ride toward 90–95 km; long run toward 18–21 km.
- [ ] Book/train ≥3 open-water swims; practice sighting and wetsuit if applicable.
- [ ] Draft race-day fuel plan (carb/hr, bottles, gels); rehearse it on long sessions.
- [ ] Lock race logistics: entry confirmed, travel, bike transport, gear checklist.

---

## Cadence — how you actually run this

- **Daily:** weigh in (AM), log food + training in the apps → they land in Apple Health/Strava → paste to the **Daily Log** tab (or auto via Zapier once wired).
- **Weekly (Sunday):** open the **Weekly Review** tab. It writes the so-what: is the cut too hard, is loss stalled, which discipline is the limiter, is it time to periodize. Adjust one thing.
- **Every 4–6 weeks:** DEXA re-scan, re-baseline, re-plan the block. Advance the gates on the **Plan** tab.
- **6 weeks out:** execute the periodization switch (A3). Protect the build.
- **Race week:** taper, carb load, rehearsed fuel plan. Cut resumes after.

---

## Deferred / later

- DB-backed version (Supabase + the auto-sync Zapier/n8n ingestion) so logging is passive, not manual.
- Auto-derive RAG from milestone slippage.
- HR-zone distribution chart from Polar (are you actually training 80/20?).
- Sleep & HRV as a recovery gate before hard sessions.
