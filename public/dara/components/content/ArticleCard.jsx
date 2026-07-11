import React from "react";

/* Article teaser with medically-reviewed byline.
   Image is a striped placeholder until real photography lands. */
export function ArticleCard({ category, title, excerpt, reviewer, imageUrl, imageLabel = "foto artikel", href = "#", style }) {
  const [hover, setHover] = React.useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        background: "var(--surface-card)",
        border: "1px solid " + (hover ? "var(--dara-ink-faint)" : "var(--dara-line)"),
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-card)",
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        transform: hover ? "translateY(-2px)" : "none",
        transition: "border-color var(--dur-fast) var(--ease-out), transform var(--dur-base) var(--ease-out)",
        fontFamily: "var(--font-ui)",
        ...style,
      }}
    >
      <div
        style={{
          position: "relative",
          aspectRatio: "16 / 9",
          background: imageUrl
            ? `center / cover no-repeat url(${imageUrl})`
            : "repeating-linear-gradient(45deg, var(--dara-oat) 0 8px, var(--dara-blush) 8px 16px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!imageUrl && (
          <image-slot
            id={"article-" + String(title || imageLabel).toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 48)}
            placeholder={imageLabel}
            style={{ position: "absolute", inset: 0 }}
          ></image-slot>
        )}
      </div>
      <div style={{ padding: "var(--space-25)", display: "flex", flexDirection: "column", gap: 8 }}>
        {category && (
          <p style={{ margin: 0, fontSize: "var(--text-caption)", fontWeight: 600, color: "var(--dara-terracotta)" }}>{category}</p>
        )}
        <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", fontWeight: 550, lineHeight: 1.3, color: "var(--text-primary)", textDecoration: hover ? "underline" : "none", textDecorationColor: "var(--dara-line)", textUnderlineOffset: 3 }}>
          {title}
        </p>
        {excerpt && (
          <p style={{ margin: 0, fontSize: "var(--text-small)", lineHeight: 1.55, color: "var(--text-secondary)" }}>{excerpt}</p>
        )}
        {reviewer && (
          <p style={{ margin: "4px 0 0", display: "flex", alignItems: "center", gap: 6, fontSize: "var(--text-caption)", color: "var(--text-meta)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--dara-sage)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            Ditinjau secara medis oleh {reviewer}
          </p>
        )}
      </div>
    </a>
  );
}
