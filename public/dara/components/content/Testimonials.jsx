import React from "react";

/* Honest social proof — real-toned quotes with name + city, a horizontal
   snap row. No star ratings, no miracle claims; the disclaimer is part of
   the design. */
const DEFAULT_ITEMS = [
  { quote: "Empat bulan, turun 7 kilo. Tapi yang paling terasa: aku berhenti perang sama makanan.", name: "Sari, 34", city: "Jakarta", program: "Berat badan" },
  { quote: "Formulaku disesuaikan tiap bulan, dan dokternya jelasin kenapa. Kulitku — dan aku — jauh lebih tenang.", name: "Maya, 27", city: "Bandung", program: "Kulit" },
  { quote: "Dokternya jawab pesanku hari itu juga. Rasanya ditemani, bukan sekadar diproses.", name: "Dina, 31", city: "Surabaya", program: "Rambut" },
];

export function Testimonials({ title = "Dari perempuan yang sudah mulai.", items = DEFAULT_ITEMS, style }) {
  return (
    <section style={{ background: "var(--surface-band)", padding: "40px 0 36px", fontFamily: "var(--font-ui)", ...style }}>
      <h2 style={{ margin: "0 20px 18px", fontFamily: "var(--font-display)", fontSize: "var(--text-h2)", fontWeight: 550, lineHeight: 1.2 }}>{title}</h2>
      <div style={{ display: "flex", gap: 12, overflowX: "auto", padding: "2px 20px 10px", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}>
        {items.map((t, i) => (
          <figure key={i} style={{ margin: 0, flex: "0 0 auto", width: 264, scrollSnapAlign: "start", background: "var(--surface-card)", border: "var(--border-hairline)", borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-card)", padding: "20px", display: "flex", flexDirection: "column", gap: 14, boxSizing: "border-box" }}>
            <blockquote style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 17.5, fontStyle: "italic", fontWeight: 500, lineHeight: 1.45, color: "var(--text-primary)" }}>
              “{t.quote}”
            </blockquote>
            <figcaption style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>{t.name} · {t.city}</span>
              <span style={{ fontSize: 12, color: "var(--text-meta)" }}>{t.program}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      <p style={{ margin: "10px 20px 0", fontSize: 11.5, lineHeight: 1.5, color: "var(--text-meta)" }}>
        Cerita asli dari pengguna, dibagikan atas izin. Hasil tiap orang berbeda.
      </p>
    </section>
  );
}
