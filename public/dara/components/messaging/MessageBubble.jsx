import React from "react";

/* Doctor–patient thread bubble. Doctor = white card left, patient = blush right.
   Medical messages deserve card treatment, not chat-app gloss. */
export function MessageBubble({ from = "doctor", author, text, time, style }) {
  const isDoctor = from === "doctor";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isDoctor ? "flex-start" : "flex-end",
        fontFamily: "var(--font-ui)",
        ...style,
      }}
    >
      <div
        style={{
          maxWidth: "82%",
          background: isDoctor ? "var(--surface-card)" : "var(--dara-blush)",
          border: isDoctor ? "var(--border-hairline)" : "1px solid transparent",
          borderRadius: isDoctor ? "16px 16px 16px 4px" : "16px 16px 4px 16px",
          padding: "12px 16px",
        }}
      >
        {isDoctor && author && (
          <p style={{ margin: "0 0 4px", fontSize: "var(--text-caption)", fontWeight: 600, color: "var(--dara-sage-deep)" }}>{author}</p>
        )}
        <p style={{ margin: 0, fontSize: "var(--text-small)", lineHeight: 1.55, color: "var(--text-primary)", whiteSpace: "pre-line" }}>{text}</p>
      </div>
      {time && (
        <p style={{ margin: "4px 2px 0", fontSize: 11, color: "var(--text-meta)", fontFeatureSettings: "var(--numeric-tabular)" }}>{time}</p>
      )}
    </div>
  );
}
