# Route 2 — Apple Health → Airtable (weight, body-fat, calories, protein, steps, sleep)

Apple Health has no cloud API, so an on-device app has to **push** its data out. This wires that bridge, automatically, once a day.

```
Apple Health ─► Health Auto Export (your iPhone, nightly)
             ─► POST JSON ─► Zapier (Catch Raw Hook ─► Code) ─► Airtable "Daily Metrics"
```

The tricky middle — parsing Health Auto Export's nested JSON, fixing units, and upserting one row per day — is done for you in **`zapier-healthexport-code.js`** (tested). You just connect the two ends.

**Heads-up on costs:** this route needs **Health Auto Export** (one-time ~US$3 for the REST/automation feature) and a **Zapier Starter** plan (Webhooks + Code steps are paid). Route 1 (Strava) is free.

---

## Step 1 — Airtable Personal Access Token *(2 min)*

1. Go to **https://airtable.com/create/tokens** → **Create token**.
2. Scopes: `data.records:read` **and** `data.records:write`.
3. Access: add the **Body Cockpit** base.
4. Create → **copy the token** (starts `pat…`). You'll paste it into Zapier in step 3. Treat it like a password.

## Step 2 — Zapier: Catch Raw Hook → Code *(5 min)*

1. **https://zapier.com** → Create Zap.
2. **Trigger:** *Webhooks by Zapier* → event **Catch Raw Hook** → Continue. Copy the **custom webhook URL** it gives you (you'll paste it into the phone app next).
3. **Action:** *Code by Zapier* → **Run Javascript**.
4. Under **Input Data**, add exactly two rows:
   - `raw`  → map to the trigger's **Raw Body**
   - `token` → paste your Airtable PAT from step 1
5. Paste the entire contents of **`zapier-healthexport-code.js`** into the Code box.
6. Leave it — you'll test after step 3 sends real data. **Publish/turn on** the Zap.

> Use **Catch *Raw* Hook**, not plain Catch Hook — the raw variant hands the Code step the untouched JSON string, which is what the parser expects.

## Step 3 — Health Auto Export on your iPhone *(5 min)*

1. Install **Health Auto Export – JSON+CSV** from the App Store; grant it read access to Apple Health.
2. Go to **Automations** → **＋ New Automation**.
3. Configure:
   - **Automation type:** REST API
   - **URL:** paste the Zapier webhook URL from step 2
   - **Method:** POST · **Format:** JSON
   - **Data type:** Health Metrics *(workouts come via Strava — leave them off here)*
   - **Metrics:** Weight & Body Mass · Body Fat Percentage · Dietary Energy · Protein · Step Count · Sleep Analysis *(add Resting Heart Rate / Active Energy if you want them later — the code ignores extras safely)*
   - **Aggregation:** Daily · **Period:** Today (or Last 1 day)
   - **Schedule:** automatic, ~23:30 daily (after the day's food is logged)
4. Tap **Run now** once to send today's data.

## Step 4 — Confirm the loop *(2 min)*

- Back in Zapier, open the Code step's test — it should show `{ ok: true, date: …, wrote: {…} }`.
- Open **Body Cockpit → Daily Metrics**: today's row should have weight, body-fat, calories, protein, steps, sleep. Run the phone automation again — it should **update the same row**, not add a duplicate.

Done. From here it runs itself nightly.

---

## What the code handles (so you don't have to)

- **Units:** dietary energy **kJ → kcal** (÷4.184), body-fat **fraction → %** (0.214 → 21.4), sleep **min → hr** if needed.
- **Dedupe:** finds the day's row by date and **PATCHes** it; only creates when absent — safe to re-send.
- **Tolerance:** matches metric names loosely (Apple/HAE rename them between versions) and skips anything it doesn't recognise instead of failing.

## Troubleshooting

| Symptom | Fix |
|--------|-----|
| Code returns `{ skipped: true, names: [...] }` | HAE used different metric names; send me that `names` list and I'll add them to the matcher. |
| `Airtable write failed` 403 | PAT missing `data.records:write` or the Body Cockpit base wasn't added to the token. |
| Calories look ~4× too big | Energy came through as kJ without a units tag — already auto-corrected above 4000; tell me if a real 4000+ kcal day is expected. |
| Duplicate daily rows | You're on plain *Catch Hook*; switch the trigger to **Catch Raw Hook**. |
| Body-fat blank | Your scale isn't writing Body Fat % to Apple Health — enable it in the scale's app, or a bioimpedance scale is needed. |

## Nutrition note (MyFitnessPal)

MFP writes calories + protein into Apple Health, so they ride this same bridge — **no separate MFP integration needed**. Just confirm MFP → Settings → Apps & Devices → Apple Health has Nutrition enabled.
