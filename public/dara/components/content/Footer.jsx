import React from "react";

/* Footer with the legal identifiers a telemedicine brand must carry.
   Oat band, hairline top, no dark-mode drama. */
export function Footer({ brand = "Dara", columns, legal, style }) {
  const cols = columns || [
    { title: "Layanan", links: ["Program berat badan", "Kulit", "Rambut", "Kesehatan mental", "Cara kerja", "Harga"] },
    { title: "Bantuan", links: ["FAQ", "Hubungi kami", "Lacak pesanan", "Kebijakan privasi"] },
    { title: "Perusahaan", links: ["Tentang Dara", "Tim medis", "Karier", "Artikel"] },
  ];
  const legalLines = legal || [
    "PT Dara Sehat Indonesia · Jl. TB Simatupang, Jakarta Selatan 12430",
    "Layanan telemedisin diselenggarakan bersama klinik partner berizin (izin sarana Kemenkes; dokter ber-STR & SIP aktif). Obat keras hanya diberikan dengan resep dokter.",
    "Terdaftar sebagai PSE lingkup privat di Kominfo · Obat terdaftar BPOM — cek di cekbpom.pom.go.id",
    "Data pribadimu dilindungi sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi. Baca Kebijakan Privasi.",
    "Layanan untuk usia 18 tahun ke atas. Bukan untuk keadaan darurat — hubungi 119 atau IGD terdekat.",
    "Pengaduan layanan kesehatan: Kemenkes 1500-567. Ozempic® dan Mounjaro® adalah merek dagang pemiliknya; Dara tidak berafiliasi.",
  ];
  return (
    <footer
      style={{
        background: "var(--surface-card-tint)",
        borderTop: "var(--border-hairline)",
        padding: "var(--space-6) var(--space-3) var(--space-4)",
        fontFamily: "var(--font-ui)",
        ...style,
      }}
    >
      <div style={{ maxWidth: "var(--measure-page)", margin: "0 auto", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-5)", justifyContent: "space-between" }}>
          <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600, color: "var(--text-primary)" }}>
            {brand}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-5)" }}>
            {cols.map((col, i) => (
              <div key={i} style={{ minWidth: 140 }}>
                <p style={{ margin: "0 0 10px", fontSize: "var(--text-caption)", fontWeight: 600, color: "var(--text-meta)" }}>{col.title}</p>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {col.links.map((l, j) => (
                    <li key={j}>
                      <a href="#" style={{ fontSize: "var(--text-small)", color: "var(--text-secondary)", textDecoration: "none" }}>{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: "var(--border-hairline)", paddingTop: "var(--space-25)", display: "flex", flexDirection: "column", gap: 6 }}>
          {legalLines.map((line, i) => (
            <p key={i} style={{ margin: 0, fontSize: "var(--text-caption)", lineHeight: 1.6, color: "var(--text-meta)" }}>{line}</p>
          ))}
        </div>
      </div>
    </footer>
  );
}
