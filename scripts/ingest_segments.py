#!/usr/bin/env python3
"""
Barawell — customer-segmentation ingestion (the ETL behind migration 0004).

Reads the order-history export (one block per customer) and computes the
segmentation marts that back the v_* views the cockpit reads. This is the
single place the segmentation model is defined; the frontend does no math.

  Value tiers   : Whale ≥ Rp2,000,000 lifetime · Core ≥ Rp400,000 · else Entry
  Lifecycle     : (recency vs the ~46-day median refill cadence)
                  Dormant  recency > 90d
                  At-risk  recency 46–90d
                  Active-repeat  recency ≤ 45d and ≥ 2 orders
                  New      1 order, recency ≤ 45d
  Recency       : (max last_order in the dataset) − customer.last_order
  Queues        : refill_due · winback_value · cross_sell · channel_migrate · aov_expand

Usage:  python3 scripts/ingest_segments.py <export.csv|export.json> [top_n] > load.sql
        (json = the Drive download wrapper {content,...}; csv = raw export text)

Emits idempotent SQL (DELETE + INSERT) for the marts. No PII is written to
disk or committed — it flows export → SQL → Supabase only. Phone numbers are
deliberately excluded from the action-queue mart (anon-readable surface).
"""
import sys, os, re, json, base64
from datetime import date
from collections import Counter

TOP_N = int(sys.argv[2]) if len(sys.argv) > 2 else 80

def load_text(path):
    raw = open(path, "r", encoding="utf-8", errors="replace").read()
    # Accept either raw export text or the Drive download wrapper {content: b64|text},
    # regardless of file extension.
    if raw.lstrip().startswith("{") and '"content"' in raw[:200]:
        try:
            c = json.loads(raw).get("content", "")
        except Exception:
            c = ""
        if c:
            try:
                t = base64.b64decode(c).decode("utf-8", "replace")
                return t if "Belanja" in t else c
            except Exception:
                return c
    return raw

MON = {"Jan":1,"Feb":2,"Mar":3,"Apr":4,"Mei":5,"Jun":6,"Jul":7,"Agu":8,"Sep":9,"Okt":10,"Nov":11,"Des":12}
def pdate(s):
    m = re.match(r"(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})", s.strip())
    if not m: return None
    d, mo, y = m.groups()
    return date(int(y), MON[mo], int(d)) if mo in MON else None
def rp(s):
    m = re.search(r"Rp\s*([\d\.]+)", s); return int(m.group(1).replace(".", "")) if m else 0
def field(parts, label):
    for p in parts:
        p = p.strip()
        if p.startswith(label): return p[len(label):].strip()
    return ""
def q(v):
    if v is None: return "null"
    if isinstance(v, bool): return "true" if v else "false"
    if isinstance(v, (int, float)): return str(v)
    return "'" + str(v).replace("'", "''") + "'"

CH = ["Tokopedia","Shopee","website","whatsapp","tiktok","Lazada","Blibli"]
OWNED = {"website","whatsapp"}; MKT = {"tokopedia","shopee","lazada","blibli"}
datepat = re.compile(r"^\s*\d{1,2}\s+[A-Za-z]+\s+\d{4},")

def parse(text):
    lines = text.split("\n"); N = len(lines); custs = []
    chan_orders, chan_custs = Counter(), Counter(); i = 0
    while i < N:
        ln = lines[i]; st = ln.strip()
        if st.startswith("HP ") and "Kota" in ln and "Belanja" in ln:
            j = i - 1; name_seg = ""
            while j >= 0:
                if lines[j].strip(): name_seg = lines[j].strip(); break
                j -= 1
            seg = ""; nm = name_seg
            for tag in ("Dormant","Repeat","Baru"):
                if re.search(r",\s*" + tag + r"\s*$", name_seg):
                    seg = tag; nm = re.sub(r",\s*" + tag + r"\s*$", "", name_seg).strip(); break
            nm = re.sub(r"[\s,]+$", "", nm).strip()   # strip trailing empty CSV cells
            parts = ln.split(",")
            om = re.search(r"(\d+)", field(parts, "Order")); orders = int(om.group(1)) if om else 0
            bm = re.search(r"(\d+)", field(parts, "Total box")); boxes = int(bm.group(1)) if bm else 0
            belanja = rp(field(parts, "Belanja")); aov = rp(field(parts, "AOV"))
            terakhir = pdate(field(parts, "Terakhir")); kota = field(parts, "Kota").strip()
            if kota in ("-", ""): kota = None
            prod = ""
            if i + 1 < N and "Produk dipesan" in lines[i + 1]:
                prod = lines[i + 1].split("Produk dipesan:", 1)[1].strip()
            odates = []; cchans = []; k = i + 1
            while k < N:
                lk = lines[k]
                if lk.strip().startswith("HP ") and "Belanja" in lk: break
                if datepat.match(lk):
                    dd = pdate(lk.split(",")[0])
                    if dd: odates.append(dd)
                    for ch in CH:
                        if re.search(r"[,\s]" + ch + r"([,\s]|$)", lk, re.I):
                            cchans.append(ch.lower()); break
                k += 1
            odates.sort()
            cset = set(cchans); pl = prod.lower()
            custs.append(dict(
                cust_key=len(custs)+1, name=(nm[:120] if nm else None), city=kota, segment_raw=seg or None,
                orders_n=orders, boxes=boxes, spend=belanja, aov=aov,
                last_order=(terakhir or (odates[-1] if odates else None)),
                first_gap=((odates[1]-odates[0]).days if len(odates) >= 2 else None),
                has_s50=bool(re.search(r"sildenafil\s*50", pl)),
                has_s100=bool(re.search(r"sildenafil\s*100", pl)),
                has_bara=("baralast" in pl or "baralas" in pl), has_tada=("tadalafil" in pl),
                ch_owned=any(x in OWNED for x in cset), ch_marketplace=any(x in MKT for x in cset)))
            for ch in cchans: chan_orders[ch] += 1
            for ch in cset: chan_custs[ch] += 1
            i = k
        else:
            i += 1
    return custs, chan_orders, chan_custs

def classify(c, asof):
    rec = (asof - c["last_order"]).days if c["last_order"] else None
    tier = "Whale" if c["spend"] >= 2_000_000 else "Core" if c["spend"] >= 400_000 else "Entry"
    if rec is None:          life = "Dormant"
    elif rec > 90:           life = "Dormant"
    elif rec > 45:           life = "At-risk"
    elif c["orders_n"] >= 2: life = "Active-repeat"
    else:                    life = "New"
    return rec, tier, life

def main():
    text = load_text(sys.argv[1])
    custs, chan_orders, chan_custs = parse(text)
    asof = max(c["last_order"] for c in custs if c["last_order"])
    for c in custs:
        c["recency"], c["tier"], c["life"] = classify(c, asof)
    n = len(custs); tot = sum(c["spend"] for c in custs)
    rep = [c for c in custs if c["orders_n"] >= 2]
    def pct(x, d): return round(100.0 * x / d, 1) if d else 0
    out = []
    out.append("-- generated by scripts/ingest_segments.py — no PII on disk; marts only")
    out.append("begin;")

    # summary
    out.append("delete from seg_summary;")
    out.append("insert into seg_summary values (1,%s);" % ",".join(q(v) for v in [
        n, tot, round(sum(c["aov"] for c in custs)/n),
        len(rep), pct(len(rep), n), sum(1 for c in custs if c["orders_n"] == 1),
        pct(sum(c["spend"] for c in rep), tot),
        sum(1 for c in custs if c["life"] == "New"), sum(1 for c in custs if c["life"] == "Active-repeat"),
        sum(1 for c in custs if c["life"] == "At-risk"), sum(1 for c in custs if c["life"] == "Dormant"),
        sum(1 for c in custs if c["tier"] == "Whale"),
        sum(1 for c in custs if c["has_bara"]), pct(sum(1 for c in custs if c["has_bara"]), n),
        sum(1 for c in custs if c["has_s100"]), asof.isoformat()]))

    # matrix
    out.append("delete from seg_matrix;")
    cells = {}
    for c in custs:
        cells.setdefault((c["tier"], c["life"]), []).append(c)
    for (tier, life), cs in cells.items():
        recs = [x["recency"] for x in cs if x["recency"] is not None]
        out.append("insert into seg_matrix values (%s,%s,%s,%s,%s,%s);" % (
            q(tier), q(life), len(cs), q(sum(x["spend"] for x in cs)),
            round(sum(x["aov"] for x in cs)/len(cs)), round(sum(recs)/len(recs)) if recs else 0))

    # funnel
    out.append("delete from seg_funnel;")
    out.append("insert into seg_funnel values (1,%s);" % ",".join(q(v) for v in [
        n, sum(1 for c in custs if c["orders_n"] >= 2), sum(1 for c in custs if c["orders_n"] >= 3),
        sum(1 for c in custs if c["orders_n"] >= 5), sum(1 for c in custs if c["orders_n"] == 1),
        sum(1 for c in custs if c["life"] == "Dormant")]))

    # refill cohort
    out.append("delete from seg_refill;")
    bins = [("0-14",1,lambda g:g<=14),("15-30",2,lambda g:15<=g<=30),("31-45",3,lambda g:31<=g<=45),
            ("46-60",4,lambda g:46<=g<=60),("61-90",5,lambda g:61<=g<=90),("91-120",6,lambda g:91<=g<=120),
            ("120+",7,lambda g:g>120)]
    gaps = [c["first_gap"] for c in custs if c["first_gap"] is not None and 0 <= c["first_gap"] <= 400]
    for label, o, pred in bins:
        out.append("insert into seg_refill values (%s,%s,%s);" % (q(label), o, sum(1 for g in gaps if pred(g))))

    # channel
    out.append("delete from seg_channel_stat;")
    for ch in chan_orders:
        out.append("insert into seg_channel_stat values (%s,%s,%s);" % (q(ch), chan_orders[ch], chan_custs[ch]))

    # product
    out.append("delete from seg_product;")
    out.append("insert into seg_product values (1,%s);" % ",".join(q(v) for v in [
        sum(1 for c in custs if c["has_s50"]), sum(1 for c in custs if c["has_s100"]),
        sum(1 for c in custs if c["has_bara"]), sum(1 for c in custs if c["has_tada"]),
        sum(1 for c in rep if not c["has_bara"]),
        sum(1 for c in custs if c["has_s50"] and not c["has_s100"]), n]))

    # action queues
    out.append("delete from seg_action_queue;")
    def emit_queue(name, rows, reason):
        for rn, c in enumerate(rows[:TOP_N], 1):
            out.append("insert into seg_action_queue values (%s);" % ",".join(q(v) for v in [
                name, rn, c["cust_key"], c["name"], c["city"], c["spend"], c["orders_n"],
                c["recency"], c["tier"], c["life"], reason(c)]))
    emit_queue("refill_due",
               sorted([c for c in custs if c["orders_n"] == 1 and c["recency"] is not None and 25 <= c["recency"] <= 90],
                      key=lambda c: (-c["spend"], c["recency"])),
               lambda c: "One order, %sd since - inside refill window" % c["recency"])
    emit_queue("winback_value",
               sorted([c for c in custs if c["life"] == "Dormant" and c["tier"] in ("Whale","Core")],
                      key=lambda c: -c["spend"]),
               lambda c: "%s gone quiet %sd" % (c["tier"], c["recency"]))
    emit_queue("cross_sell",
               sorted([c for c in custs if c["orders_n"] >= 2 and not c["has_bara"]], key=lambda c: -c["spend"]),
               lambda c: "%s orders, no Baralast yet" % c["orders_n"])
    emit_queue("channel_migrate",
               sorted([c for c in custs if c["ch_marketplace"] and not c["ch_owned"]], key=lambda c: -c["spend"]),
               lambda c: "Marketplace-only - migrate to owned")
    emit_queue("aov_expand",
               sorted([c for c in custs if c["boxes"] < 2 and c["life"] in ("New","Active-repeat")], key=lambda c: -c["spend"]),
               lambda c: "Single-box, active - bundle / subscribe")

    out.append("commit;")
    sys.stdout.write("\n".join(out) + "\n")
    sys.stderr.write("parsed %d customers · asof %s · %d queue rows/queue cap\n" % (n, asof, TOP_N))

if __name__ == "__main__":
    main()
