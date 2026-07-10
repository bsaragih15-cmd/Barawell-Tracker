import React from "react";

/* Progress-photo compare slider (kulit/rambut portal). Drag or arrow-key
   the divider; month labels in sage. Placeholders are the brand's striped
   convention until the user's private monthly photos are dropped in.
   Tone: encouraging, never judging — this is the retention hook for
   slow-results categories. */
export function PhotoCompare({ beforeLabel = "Bulan 1", afterLabel = "Bulan 3", height = 280, style }) {
  const [pos, setPos] = React.useState(52);
  const ref = React.useRef(null);
  const dragging = React.useRef(false);

  const setFromX = (clientX) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  };
  const onDown = (e) => { dragging.current = true; setFromX(e.clientX); try { e.currentTarget.setPointerCapture(e.pointerId); } catch (x) {} };
  const onMove = (e) => { if (dragging.current) setFromX(e.clientX); };
  const onUp = () => { dragging.current = false; };
  const onKey = (e) => {
    if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 4));
    if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 4));
  };

  const stripe = (a, b) => `repeating-linear-gradient(45deg, ${a} 0 8px, ${b} 8px 16px)`;
  const chip = (t) => (
    <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 600, color: "var(--dara-sage-deep)", background: "var(--dara-sage-tint)", padding: "3px 9px", borderRadius: "var(--radius-pill)" }}>{t}</span>
  );
  const ph = (label) => (
    <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: "var(--text-meta)", background: "var(--surface-page)", padding: "3px 8px", borderRadius: 4 }}>{label}</span>
  );

  return (
    <div style={{ fontFamily: "var(--font-ui)", ...style }}>
      <div
        ref={ref}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        style={{ position: "relative", height, borderRadius: "var(--radius-card)", overflow: "hidden", border: "var(--border-hairline)", userSelect: "none", touchAction: "none", cursor: "ew-resize" }}
      >
        {/* after (bottom, revealed on the right) */}
        <div style={{ position: "absolute", inset: 0, background: stripe("#EEE2D6", "#F5E7DC"), display: "flex", alignItems: "flex-end", justifyContent: "flex-end", padding: 12 }}>{ph("foto — " + afterLabel.toLowerCase())}</div>
        {/* before (top, clipped to the left of the divider) */}
        <div style={{ position: "absolute", inset: 0, background: stripe("var(--dara-oat)", "var(--dara-blush)"), clipPath: `inset(0 ${100 - pos}% 0 0)`, display: "flex", alignItems: "flex-end", padding: 12 }}>{ph("foto — " + beforeLabel.toLowerCase())}</div>
        {/* divider */}
        <div aria-hidden="true" style={{ position: "absolute", top: 0, bottom: 0, left: `${pos}%`, width: 2, background: "var(--surface-page)", transform: "translateX(-1px)", boxShadow: "0 0 0 1px rgba(33,26,20,.08)" }} />
        {/* handle */}
        <div
          role="slider"
          tabIndex={0}
          aria-valuenow={Math.round(pos)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Geser untuk membandingkan foto"
          onKeyDown={onKey}
          style={{ position: "absolute", top: "50%", left: `${pos}%`, transform: "translate(-50%,-50%)", width: 36, height: 36, borderRadius: "50%", background: "var(--surface-card)", border: "1px solid var(--dara-line)", boxShadow: "var(--shadow-raised)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "ew-resize" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--dara-ink-soft)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6 3 12l6 6M15 6l6 6-6 6" /></svg>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>{chip(beforeLabel)}{chip(afterLabel)}</div>
    </div>
  );
}
