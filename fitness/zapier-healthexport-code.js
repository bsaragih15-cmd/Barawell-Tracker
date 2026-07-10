/*
 * Route 2 bridge — Health Auto Export (Apple Health) -> Airtable "Daily Metrics"
 * ---------------------------------------------------------------------------
 * Paste this into a Zapier "Code by Zapier -> Run Javascript" step.
 *
 * Zap shape:  [Webhooks by Zapier: Catch Raw Hook]  ->  [Code by Zapier: this]
 *
 * Code step INPUT DATA (add these two keys in the Zapier UI):
 *   raw    = the Catch Raw Hook step's  "Raw Body"
 *   token  = your Airtable Personal Access Token (scopes: data.records:read + write,
 *            access to the "Body Cockpit" base)
 *
 * It upserts ONE row per day (keyed on Date) so re-sends don't duplicate.
 * Unit fixes: body-fat fraction->%, dietary energy kJ->kcal, sleep min->hr.
 */

const BASE  = 'appxY2BIm3Yd89KkU';   // Body Cockpit
const TABLE = 'tblgm9y4oHuirO58U';   // Daily Metrics
const F = {
  date:    'fldVeoySwF1ItEdC1',
  weight:  'fldIbMav2uZ4RgPoh',
  bodyfat: 'fldRbh7mfOFzW5IL4',
  cals:    'fldj4T5HtOkU1kUxL',
  protein: 'fld1VeYizP8FIgZjt',
  steps:   'fld1rQkdlqzbIJAEz',
  sleep:   'fldGd9Syv8mhwDQSB',
};

const token = inputData.token;
const round = (n, d) => { const p = Math.pow(10, d); return Math.round(Number(n) * p) / p; };
const isoDate = (s) => String(s || '').slice(0, 10);   // "2026-07-10 06:15:00 +0700" -> "2026-07-10"

// --- parse Health Auto Export payload ---
let payload;
try { payload = typeof inputData.raw === 'string' ? JSON.parse(inputData.raw) : inputData.raw; }
catch (e) { return { error: 'Could not parse webhook body', detail: String(e) }; }

const metrics = (payload && payload.data && payload.data.metrics) || [];

// find a metric whose name contains any fragment; return its NEWEST data point
function latest(frags) {
  const m = metrics.find(mm => frags.some(f => String(mm.name || '').toLowerCase().includes(f)));
  if (!m || !Array.isArray(m.data) || !m.data.length) return null;
  const pt = m.data[m.data.length - 1];
  return { qty: Number(pt.qty != null ? pt.qty : (pt.Avg != null ? pt.Avg : pt.value)), units: String(m.units || '').toLowerCase(), pt };
}

const w  = latest(['weight', 'body_mass']);
const bf = latest(['body_fat']);
const en = latest(['dietary_energy', 'energy_consumed']);
const pr = latest(['protein']);
const st = latest(['step_count', 'steps']);
const sl = latest(['sleep']);

const dateSrc = w || bf || en || pr || st || sl;
if (!dateSrc) return { skipped: true, reason: 'No recognised metrics in payload', names: metrics.map(m => m.name) };
const date = isoDate(dateSrc.pt.date);

// --- normalize into Airtable fields ---
const fields = {};
fields[F.date] = date;
if (w)  fields[F.weight]  = round(w.qty, 1);
if (bf) fields[F.bodyfat] = round(bf.qty <= 1 ? bf.qty * 100 : bf.qty, 1);   // 0.22 -> 22.0
if (en) {
  let kcal = en.qty;
  if (en.units.includes('kj') || kcal > 4000) kcal = kcal / 4.184;          // kJ -> kcal
  fields[F.cals] = Math.round(kcal);
}
if (pr) fields[F.protein] = Math.round(pr.qty);
if (st) fields[F.steps]   = Math.round(st.qty);
if (sl) {
  const p = sl.pt;
  let hrs = Number(p.asleep != null ? p.asleep : (p.totalSleep != null ? p.totalSleep : (p.sleepHours != null ? p.sleepHours : p.qty)));
  if (!hrs && p.sleepStart && p.sleepEnd) hrs = (new Date(p.sleepEnd) - new Date(p.sleepStart)) / 3.6e6;
  if (sl.units.includes('min') && hrs) hrs = hrs / 60;
  if (hrs) fields[F.sleep] = round(hrs, 1);
}

// --- upsert: find today's row, then PATCH or POST ---
const api = `https://api.airtable.com/v0/${BASE}/${TABLE}`;
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

const q = `${api}?filterByFormula=${encodeURIComponent(`DATESTR({Date})='${date}'`)}&maxRecords=1`;
const foundRes = await fetch(q, { headers });
const found = await foundRes.json();
if (found.error) return { error: 'Airtable read failed', detail: found.error };

let writeRes;
if (found.records && found.records.length) {
  const id = found.records[0].id;
  writeRes = await fetch(api, { method: 'PATCH', headers, body: JSON.stringify({ records: [{ id, fields }], typecast: true }) });
} else {
  writeRes = await fetch(api, { method: 'POST', headers, body: JSON.stringify({ records: [{ fields }], typecast: true }) });
}
const out = await writeRes.json();
if (out.error) return { error: 'Airtable write failed', detail: out.error };

return { ok: true, date, wrote: fields, recordId: out.records && out.records[0] && out.records[0].id };
