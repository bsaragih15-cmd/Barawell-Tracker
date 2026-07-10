import React from "react";

/* FAQ accordion — hairline rows, chevron rotates 200ms, one open at a time. */
export function FAQAccordion({ items = [], style }) {
  const [open, setOpen] = React.useState(null);
  return (
    <div style={{ fontFamily: "var(--font-ui)", borderTop: "var(--border-hairline)", ...style }}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i} style={{ borderBottom: "var(--border-hairline)" }}>
            <button
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
                width: "100%",
                textAlign: "left",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "18px 2px",
                minHeight: 44,
                fontFamily: "var(--font-ui)",
                fontSize: 16,
                fontWeight: 550,
                color: "var(--text-primary)",
                lineHeight: 1.4,
              }}
            >
              {item.q}
              <svg
                width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="var(--dara-ink-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ flexShrink: 0, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform var(--dur-base) var(--ease-out)" }}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            <div
              style={{
                display: "grid",
                gridTemplateRows: isOpen ? "1fr" : "0fr",
                transition: "grid-template-rows var(--dur-base) var(--ease-out)",
              }}
            >
              <div style={{ overflow: "hidden" }}>
                <p style={{ margin: "0 0 18px", fontSize: "var(--text-small)", lineHeight: 1.6, color: "var(--text-secondary)", maxWidth: "62ch" }}>
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
