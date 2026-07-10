# Body Cockpit

A KEY-style transformation cockpit for a personal goal set: **cut to single-digit body fat** while training for a **Half Ironman (70.3) in October** — two tracks that pull against each other, on one screen.

Same instrument philosophy as the Barawell pipeline in this repo: confidence-weighted bridges, RAG, so-what titles, a weekly decision — not a to-do list.

## Files

| File | What it is |
|------|-----------|
| `cockpit.html` | The instrument. Open it in any browser. Self-contained, no build, no server. |
| `PLAN.md` | The task register — setup, the cut, and the race — with the honest read on periodization. |
| `weekly-review.md` | Sunday review template (the cockpit computes most of it live). |

## Run it

Open `cockpit.html` in a browser. First thing: click **Baseline & targets** and enter your real numbers (sex, age, height, start weight/BF, target BF, race date, longest swim/bike/run). Everything recomputes from there.

- **Two hero bridges** — fat shed vs. to-go, and readiness across the three race legs.
- **Amber banner** fires when the deficit collides with the race build.
- **Daily Log** — paste weight, calories, protein, and training hours from your apps.
- **Trajectory** — weight / BF / intake trends + weekly training volume.
- **Weekly Review** — writes the so-what every Sunday.
- **Plan** — 10 stage-gated initiatives; advance a gate as work hardens.
- Data lives in your browser (localStorage). **Setup & Sync** has Export/Import for backup.

## Syncing your apps

Live OAuth linking (Apple Health, Strava, Polar Flow, MyFitnessPal) has to be done in a normal interactive session, not here. The **Setup & Sync** tab documents the exact steps. Until then: weekly CSV export → paste into the Daily Log. The DB-backed, auto-syncing version is in `PLAN.md` under *Deferred*.
