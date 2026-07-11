import React from "react";

/* Weight-trend chart — trajectory, never daily judgment.
   Sage line on hairline grid; summary states the trend plainly. */
export function TrendChart({ points = [], unit = "kg", goalNote, rangeLabel, style }) {
  const W = 560, H = 180, PAD = { t: 16, r: 12, b: 26, l: 40 };
  const vals = points.map((p) => p.value);
  const min = Math.min(...vals), max = Math.max(...vals);
  const span = Math.max(max - min, 1);
  const lo = min - span * 0.25, hi = max + span * 0.25;
  const x = (i) => PAD.l + (i / Math.max(points.length - 1, 1)) * (W - PAD.l - PAD.r);
  const y = (v) => PAD.t + (1 - (v - lo) / (hi - lo)) * (H - PAD.t - PAD.b);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(" ");
  const first = vals[0], last = vals[vals.length - 1];
  const delta = last - first;
  const fmt = (v) => String(Math.round(v * 10) / 10).replace(".", ",");

  return (
    <div style={{ fontFamily: "var(--font-ui)", ...style }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
        <span style={{ fontSize: "var(--text-small)", fontWeight: 600, color: "var(--text-primary)" }}>Tren berat badan</span>
        {points.length > 1 && (
          <span style={{ fontSize: "var(--text-small)", color: "var(--dara-sage-deep)", fontWeight: 600, fontFeatureSettings: "var(--numeric-tabular)" }}>
            {delta <= 0 ? "−" : "+"}{fmt(Math.abs(delta))} {unit} · {rangeLabel || `${points.length} minggu`}
          </span>
        )}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={`Tren berat badan: dari ${fmt(first)} ke ${fmt(last)} ${unit}`}>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={PAD.l} x2={W - PAD.r} y1={PAD.t + f * (H - PAD.t - PAD.b)} y2={PAD.t + f * (H - PAD.t - PAD.b)} stroke="var(--dara-line)" strokeWidth="1" />
        ))}
        <text x={PAD.l - 8} y={y(max) + 4} textAnchor="end" fontSize="11" fill="var(--dara-ink-faint)" style={{ fontFeatureSettings: "'tnum' 1" }}>{fmt(max)}</text>
        <text x={PAD.l - 8} y={y(min) + 4} textAnchor="end" fontSize="11" fill="var(--dara-ink-faint)" style={{ fontFeatureSettings: "'tnum' 1" }}>{fmt(min)}</text>
        <path d={path} fill="none" stroke="var(--dara-sage)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.value)} r={i === points.length - 1 ? 4.5 : 3} fill={i === points.length - 1 ? "var(--dara-sage)" : "var(--surface-page)"} stroke="var(--dara-sage)" strokeWidth="2" />
        ))}
        {points.map((p, i) =>
          p.label ? (
            <text key={"l" + i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="10.5" fill="var(--dara-ink-faint)">{p.label}</text>
          ) : null
        )}
      </svg>
      {goalNote && (
        <p style={{ margin: "8px 0 0", fontSize: "var(--text-caption)", lineHeight: 1.55, color: "var(--text-secondary)" }}>{goalNote}</p>
      )}
    </div>
  );
}
