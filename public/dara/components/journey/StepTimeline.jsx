import React from "react";

/* Step timeline for how-it-works and titration schedules.
   done = sage check · current = terracotta ring · upcoming = quiet. */
export function StepTimeline({ steps = [], style }) {
  return (
    <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", fontFamily: "var(--font-ui)", ...style }}>
      {steps.map((step, i) => {
        const state = step.state || "upcoming";
        const last = i === steps.length - 1;
        const marker =
          state === "done" ? (
            <span style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--dara-sage)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            </span>
          ) : (
            <span
              style={{
                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 600,
                fontFeatureSettings: "var(--numeric-tabular)",
                border: "1.5px solid " + (state === "current" ? "var(--dara-terracotta)" : "var(--dara-line)"),
                color: state === "current" ? "var(--dara-terracotta)" : "var(--text-meta)",
                background: state === "current" ? "var(--dara-terracotta-tint)" : "transparent",
              }}
            >
              {i + 1}
            </span>
          );
        return (
          <li key={i} style={{ display: "flex", gap: 14 }}>
            <span style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              {marker}
              {!last && <span style={{ width: 1, flex: 1, minHeight: 20, background: "var(--dara-line)", margin: "4px 0" }} />}
            </span>
            <div style={{ paddingBottom: last ? 0 : 20, paddingTop: 3 }}>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: state === "upcoming" ? "var(--text-meta)" : "var(--text-primary)", lineHeight: 1.4 }}>
                {step.title}
              </p>
              {step.description && (
                <p style={{ margin: "3px 0 0", fontSize: "var(--text-small)", color: state === "upcoming" ? "var(--text-meta)" : "var(--text-secondary)", lineHeight: 1.55 }}>
                  {step.description}
                </p>
              )}
              {step.meta && (
                <p style={{ margin: "5px 0 0", fontSize: "var(--text-caption)", color: "var(--text-meta)", fontFeatureSettings: "var(--numeric-tabular)" }}>
                  {step.meta}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
