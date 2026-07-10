import React from "react";
import { Button } from "../../components/actions/Button.jsx";
import { StatusChip } from "../../components/journey/StatusChip.jsx";
import { PhotoCompare } from "../../components/journey/PhotoCompare.jsx";
import { MessageBubble } from "../../components/messaging/MessageBubble.jsx";
import { OrderCard } from "../../components/commerce/OrderCard.jsx";

/* Dara — portal, Kulit/Rambut (mobile). Slow-results categories, so the
   progress photo log leads. Weight cross-sell is quiet and appears only
   after month 2 (no aggressive upsell in the first lifecycle). */
const CFG = {
  kulit: {
    tag: "Kulit", plan: "Rutin Kulit Kustom", concern: "Formula jerawat & flek · bulan ke-3",
    after: "Bulan 3", price: "Rp 189.000",
    regimen: [["Pagi", "Pembersih lembut → vitamin C → tabir surya SPF 30+"], ["Malam", "Pembersih → formula resep (tretinoin 0,025%) → pelembap"]],
    note: "Naikkan pemakaian malam jadi tiap hari kalau kulit sudah nyaman.",
  },
  rambut: {
    tag: "Rambut", plan: "Rutin Rambut Kustom", concern: "Perawatan penipisan · bulan ke-4",
    after: "Bulan 4", price: "Rp 165.000",
    regimen: [["Malam", "Minoxidil 5% ke kulit kepala kering, biarkan semalam"], ["Harian", "Sampo lembut; hindari ikatan rambut terlalu ketat"]],
    note: "Shedding awal sudah lewat — sekarang fase tumbuh. Konsisten ya.",
  },
};

export function PortalSkinHair({ category = "kulit", onExplore }) {
  const c = CFG[category] || CFG.kulit;
  const [photoDone, setPhotoDone] = React.useState(false);

  const card = (children) => (
    <div style={{ background: "var(--surface-card)", border: "var(--border-hairline)", borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-card)", padding: "var(--space-25)", display: "flex", flexDirection: "column", gap: 14 }}>
      {children}
    </div>
  );

  return (
    <div style={{ background: "var(--surface-page)", minHeight: "100%", fontFamily: "var(--font-ui)", padding: "24px 20px 40px", display: "flex", flexDirection: "column", gap: 16, boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600 }}>Dara</span>
        <span style={{ fontSize: 13, color: "var(--text-meta)" }}>Halo, Dina</span>
      </div>

      {card(
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div>
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 550 }}>{c.plan}</p>
              <p style={{ margin: "3px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>{c.concern}</p>
            </div>
            <StatusChip status="approved" label="Aktif" />
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-meta)", fontFeatureSettings: "var(--numeric-tabular)", borderTop: "var(--border-hairline)", paddingTop: 12 }}>
            Perpanjangan berikutnya: <strong style={{ color: "var(--text-secondary)" }}>9 Agustus 2026</strong> · {c.price}
          </p>
        </>
      )}

      {/* Progress photo log — the retention hook */}
      {card(
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Perkembanganmu</p>
            <Button variant="secondary" disabled={photoDone} onClick={() => setPhotoDone(true)} style={{ minHeight: 40, padding: "8px 14px" }}>
              {photoDone ? "Foto tersimpan" : "Ambil foto bulan ini"}
            </Button>
          </div>
          <PhotoCompare beforeLabel="Bulan 1" afterLabel={c.after} />
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: photoDone ? "var(--dara-sage-deep)" : "var(--text-secondary)", background: photoDone ? "var(--dara-sage-tint)" : "transparent", padding: photoDone ? "10px 12px" : 0, borderRadius: "var(--radius-control)" }}>
            {photoDone ? "Tersimpan privat. Kamu sedang maju — pelan tapi nyata." : "Foto disimpan privat, hanya kamu dan doktermu. Ambil di cahaya & sudut yang sama tiap bulan."}
          </p>
        </>
      )}

      {/* Regimen */}
      {card(
        <>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Rutinitasmu</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {c.regimen.map(([when, how]) => (
              <div key={when} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--dara-terracotta)", minWidth: 52 }}>{when}</span>
                <span style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--text-secondary)" }}>{how}</span>
              </div>
            ))}
          </div>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "var(--text-secondary)", borderTop: "var(--border-hairline)", paddingTop: 12 }}>{c.note}</p>
        </>
      )}

      {/* Messages */}
      {card(
        <>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Pesan dengan doktermu</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <MessageBubble from="doctor" author="dr. Sinta Halim" text="Fotonya bagus, progresmu kelihatan. Bulan depan boleh kita naikkan sedikit kekuatannya ya." time="Kemarin, 15.20" />
            <MessageBubble from="patient" text="Siap dok, makasih." time="Kemarin, 17.02" />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="secondary" style={{ flex: 1 }}>Tulis pesan</Button>
            <Button variant="secondary" style={{ flex: 1 }}>Lanjut di WhatsApp</Button>
          </div>
        </>
      )}

      <OrderCard
        orderNumber="Pesanan #DR-20260709-341"
        title={c.plan + " — kiriman bulan ini"}
        statusLabel="Dalam perjalanan"
        eta="Tiba diperkirakan 11 Juli 2026"
        address="Jl. Braga No. 14, Bandung"
      />

      {/* Quiet cross-sell — only after month 2, one line, easy to ignore */}
      <div style={{ background: "var(--surface-card-tint)", border: "var(--border-hairline)", borderRadius: "var(--radius-card)", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: "var(--text-secondary)" }}>
          Sudah beberapa bulan bareng kami. Kalau kesehatan berat badan juga ada di pikiranmu, dokter yang sama bisa bantu — tanpa terburu-buru.
        </p>
        <button onClick={onExplore} style={{ alignSelf: "flex-start", background: "none", border: "none", padding: 0, minHeight: 32, fontFamily: "var(--font-ui)", fontSize: 13.5, fontWeight: 600, color: "var(--dara-terracotta)", cursor: "pointer" }}>
          Lihat program berat badan →
        </button>
      </div>
    </div>
  );
}
