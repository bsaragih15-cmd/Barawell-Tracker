# Live App Sync — Runbook

Goal: your workouts and daily metrics land in one place **automatically**, so the weekly review reads real data, not hand-entry.

**The data spine is already built** — an Airtable base called **Body Cockpit**:
👉 https://airtable.com/appxY2BIm3Yd89KkU

Four tables, ready to receive:
| Table | What flows in | From |
|-------|---------------|------|
| **Activities** | swim / bike / run — distance, duration, HR, elevation | Strava (Polar HR rides through Strava) |
| **Daily Metrics** | weight, body-fat %, calories, protein, steps, sleep | Apple Health / MyFitnessPal / scale |
| **Weekly Review** | the Sunday so-what | you (or the cockpit) |
| **Plan** | 10 stage-gated initiatives | seeded ✓ |

Below is exactly what to do. Steps 1–2 are one-time app authorizations only you can do. Step 3 wires the automatic pipe.

---

## 1. Make Apple Health the hub *(one-time, ~5 min, on your iPhone)*

Let every app read/write Apple Health so there's a single source of truth:

- **Strava** → Settings → Applications, Services & Devices → **Health** → enable **all** (esp. Workouts, Heart Rate, Active Energy).
- **Polar Flow** → Settings → General → **Apple Health** → turn on. Also Polar Flow → **Connect** → link to **Strava** (so HR-based sessions appear in Strava).
- **MyFitnessPal** → Settings → Apps & Devices → **Apple Health** → enable **Nutrition (calories, protein)** and let it read weight.
- **Smart scale** (Withings/Renpho/etc.) → in its app, enable **Apple Health** for Weight + Body Fat %.

Result: one tap in each app, and everything pools in Apple Health.

## 2. Connect Strava — the endurance ledger *(one-time)*

Strava becomes the single feed for all three disciplines. Confirm your recent swim/bike/runs show up in Strava (they will, once step 1's Polar↔Strava link is on). Strava is the trigger for the automatic pipe in step 3.

## 3. Wire the automatic pipe: Strava → Airtable *(one-time, ~10 min)*

This is the "live" part. Build **one Zap** so every new Strava activity creates a row in the Body Cockpit **Activities** table.

1. Go to **https://zapier.com** → **Create → Zaps** → new Zap.
2. **Trigger:** app **Strava**, event **New Activity**. Connect your Strava account when asked.
3. **Action:** app **Airtable**, event **Create Record**. Connect your Airtable account.
4. Point it at: Base **Body Cockpit** → Table **Activities**. Map the fields:

   | Airtable field | Strava value |
   |----------------|--------------|
   | Activity | Name |
   | Date | Start Date |
   | Sport | Type (Run/Ride/Swim) |
   | Distance km | Distance ÷ 1000 *(Strava gives metres — use a Formatter step, or store metres and note it)* |
   | Duration min | Moving Time ÷ 60 |
   | Avg HR | Average Heartrate |
   | Max HR | Max Heartrate |
   | Elevation m | Total Elevation Gain |
   | Source | set constant **Strava** |

5. **Turn it on.** Done — every workout now auto-lands in Airtable.

> Tip: add a **Formatter by Zapier** step between trigger and action to divide metres→km and seconds→minutes cleanly.

### Weight / calories / body metrics → Route 2
These live in **Apple Health**, which has no cloud API — so they need an on-device bridge, not a cloud Zap trigger. That's **Route 2**, fully documented in **`route2-healthexport.md`** with a tested parser (`zapier-healthexport-code.js`). Short version: *Health Auto Export* (iPhone) POSTs Apple Health JSON nightly → Zapier Catch Raw Hook + Code step → **Daily Metrics** table. MyFitnessPal calories/protein ride this same bridge (they write into Apple Health).

---

## Path B — let Claude pull & write for you *(alternative to step 3)*

Instead of a standing Zap, you can connect Strava + Airtable to the assistant's Zapier connector and have me pull recent activities and write them to the base on request (or on a schedule):

1. Open the connector config: **https://mcp.zapier.com/mcp/servers/785cf903-867b-48fb-bbd9-0525172166f0/config**
2. Add & authenticate **Strava** and **Airtable**.
3. Tell me "sync my Strava" in an interactive session and I'll fetch recent activities → Body Cockpit → Activities, then refresh the weekly review.

Path A is hands-off and always-on; Path B keeps a human in the loop. Use A as the default, B when you want an on-demand pull.

---

## How this connects back to the cockpit

- **Airtable** is the live system of record + phone logging (its own grid + interface dashboards).
- **`cockpit.html`** stays the designed weekly-review instrument (bridges, conflict banner, so-what). Until the DB-backed version ships, paste each week's Airtable rollup into the cockpit's Daily Log, or use Airtable's own charts for the trend.
- **Next build (deferred, see PLAN.md):** a Supabase-backed version that reads Airtable/Strava directly so the cockpit updates itself — no paste step.
