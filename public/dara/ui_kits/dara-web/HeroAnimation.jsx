import React from "react";
import { Button } from "../../components/actions/Button.jsx";

/* Dara — HeroAnimation (autoplay, single-pen focus). Hers/Hims-style:
   a rich background, the Mounjaro pen floating with a gentle idle bob, and a
   gold text ring tilted into a 3D orbit that circles the product — its near
   arc crossing in front of the pen, its far arc passing behind (no scroll).
   `variant` selects a background theme. */

const { useState, useEffect } = React;

const CSS = `
@keyframes dara-spin { to { transform: rotate(360deg); } }
@keyframes dara-floatA { 0%,100% { transform: translateY(0) rotate(var(--rot)); } 50% { transform: translateY(-15px) rotate(var(--rot)); } }
@keyframes dara-bob { 0%,100% { transform: translate(-50%, -50%); } 50% { transform: translate(-50%, calc(-50% - 12px)); } }
@keyframes dara-glowpulse { 0%,100% { opacity: .85; } 50% { opacity: 1; } }
`;

// Text ring geometry — one circle path, tiled claim string.
const ORBIT_PATH = "M50,50 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0";
const ORBIT_TEXT = "DOSIS TINGGI • BARU • DIRESEPKAN DOKTER • TERDAFTAR BPOM • ";

const THEMES = {
  caramel: {
    bg: "radial-gradient(125% 96% at 50% 36%, #D4AD82 0%, #A97B52 34%, #5A3F29 70%, #281A10 100%)",
    glow: "radial-gradient(54% 42% at 52% 46%, rgba(255,239,216,0.55), rgba(255,239,216,0) 70%)",
    top: "#FFF7EF", accent: "#F1C68F", foot: "rgba(255,247,239,.62)", badge: "#F1C68F", onDark: true,
  },
  clay: {
    bg: "radial-gradient(132% 100% at 50% 26%, #EAAB8E 0%, #C4553B 46%, #7C2E1E 74%, #3B160F 100%)",
    glow: "radial-gradient(54% 42% at 50% 42%, rgba(255,226,208,0.5), rgba(255,226,208,0) 70%)",
    top: "#FFF3EC", accent: "#FBDCB4", foot: "rgba(255,243,236,.66)", badge: "#FBDCB4", onDark: true,
  },
  blush: {
    bg: "radial-gradient(120% 92% at 50% 26%, #FCEFE7 0%, #F3E0D4 44%, #E6C7B5 100%)",
    glow: "radial-gradient(50% 40% at 50% 46%, rgba(255,251,247,0.7), rgba(255,251,247,0) 70%)",
    top: "#3A2A20", accent: "#C4553B", foot: "rgba(58,42,32,.55)", badge: "#B85539", onDark: false,
  },
  spotlight: {
    bg: "radial-gradient(72% 54% at 50% 34%, #715339 0%, #2E2013 52%, #130C07 100%)",
    glow: "radial-gradient(46% 36% at 50% 38%, rgba(242,199,145,0.48), rgba(242,199,145,0) 70%)",
    top: "#FFF7EF", accent: "#F1C68F", foot: "rgba(255,247,239,.55)", badge: "#F1C68F", onDark: true,
  },
  dusk: {
    bg: "linear-gradient(163deg, #C96E4E 0%, #8A4436 38%, #4C2842 76%, #281625 100%)",
    glow: "radial-gradient(54% 42% at 50% 40%, rgba(255,216,192,0.42), rgba(255,216,192,0) 70%)",
    top: "#FFF3EC", accent: "#F5C9A0", foot: "rgba(255,243,236,.6)", badge: "#F5C9A0", onDark: true,
  },
};

export function HeroAnimation({ onStartQuiz, onSelectProduct, variant = "blush", frameHeight, assetBase = "../../assets/" }) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) setReduced(true);
  }, []);
  const t = THEMES[variant] || THEMES.caramel;
  const anim = (name, dur, delay) => (reduced ? "none" : `${name} ${dur} ease-in-out ${delay || "0s"} infinite`);
  const pick = (id) => (onSelectProduct || onStartQuiz)(id);

  return (
    <section style={{ position: "relative", overflow: "hidden", height: frameHeight, minHeight: frameHeight || "90vh", display: "flex", flexDirection: "column", background: t.bg, fontFamily: "var(--font-ui)" }}>
      <style>{CSS}</style>

      {/* Headline */}
      <div style={{ position: "relative", zIndex: 3, textAlign: "center", padding: "48px 24px 0", pointerEvents: "none" }}>
        <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "clamp(30px, 8.5vw, 40px)", fontWeight: 550, lineHeight: 1.08, letterSpacing: "-0.01em" }}>
          <span style={{ color: t.top }}>Terobosan berat badanmu</span><br />
          <span style={{ color: t.accent }}>ada di sini.</span>
        </h1>
      </div>

      {/* Product stage */}
      <div style={{ position: "relative", flex: 1, minHeight: 300, overflow: "hidden", perspective: "1000px" }}>
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: t.glow, animation: reduced ? "none" : "dara-glowpulse 5s ease-in-out infinite" }} />

        {/* Product — the three GLP-1 pens standing together (transparent cutout, floating with a gentle bob). */}
        <img
          src={assetBase + "pens-trio.png"}
          alt="Pen Ozempic®, Mounjaro®, dan Wegovy®"
          style={{ position: "absolute", left: "50%", top: "46%", transform: "translate(-50%, -50%)", width: "86%", height: "auto", zIndex: 2, filter: "drop-shadow(0 26px 34px rgba(58,42,32,.34))", animation: reduced ? "none" : "dara-bob 6.5s ease-in-out infinite" }}
        />

        {/* Gold text ring — 3D orbit circling the product. Split into a far
           half (behind the pen, z1) and a near half (in front, z3), both
           tilted the same and spinning in sync, so the ring wraps the pen. */}
        {[
          { key: "back", z: 1, clip: "inset(0 0 50% 0)" },   // far arc — behind
          { key: "front", z: 3, clip: "inset(50% 0 0 0)" }, // near arc — in front
        ].map((half) => (
          <div
            key={half.key}
            aria-hidden="true"
            style={{ position: "absolute", left: "50%", top: "46%", width: "94%", aspectRatio: "1", transform: "translate(-50%, -50%) rotateX(58deg)", clipPath: half.clip, zIndex: half.z, pointerEvents: "none" }}
          >
            <div style={{ width: "100%", height: "100%", animation: reduced ? "none" : "dara-spin 32s linear infinite" }}>
              <svg viewBox="0 0 100 100" width="100%" height="100%">
                <defs>
                  <path id={"dara-orbit-" + half.key + "-" + variant} d={ORBIT_PATH} />
                </defs>
                <text fill={t.badge} style={{ fontFamily: "var(--font-ui)", fontSize: 4.4, fontWeight: 600, letterSpacing: "1.15px" }}>
                  <textPath href={"#dara-orbit-" + half.key + "-" + variant} startOffset="0">{ORBIT_TEXT}</textPath>
                </text>
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Product lineup — each card starts the purchase journey */}
      <div style={{ position: "relative", zIndex: 3, padding: "8px 0 26px", display: "flex", flexDirection: "column", gap: 10 }}>
        <p style={{ margin: "0 22px", fontSize: 13, fontWeight: 600, color: t.onDark ? "rgba(255,247,239,.8)" : "var(--text-secondary)" }}>Pilih titik mulaimu</p>
        <div style={{ display: "flex", gap: 10, overflowX: "auto", padding: "2px 22px 6px", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}>
          {[
            { id: "wegovy", name: "Wegovy® Pen", mol: "semaglutide · 1×/minggu", price: "Rp 3.900.000/bln", img: assetBase + "pen-wegovy.png" },
            { id: "mounjaro", name: "Mounjaro® KwikPen", mol: "tirzepatide · 1×/minggu", price: "Rp 3.900.000/bln", img: assetBase + "pen-mounjaro-cut.png" },
            { id: "oral", name: "Program Oral", mol: "pil harian · tanpa suntik", price: "Rp 1.200.000/bln", img: null },
          ].map((c) => (
            <button
              key={c.id}
              className="dara-lift"
              onClick={() => pick(c.id)}
              style={{
                flex: "0 0 auto", width: 150, scrollSnapAlign: "start", textAlign: "left", cursor: "pointer",
                fontFamily: "var(--font-ui)", borderRadius: "var(--radius-card)", padding: 10, boxSizing: "border-box",
                display: "flex", flexDirection: "column", gap: 8,
                background: t.onDark ? "rgba(255,247,239,.09)" : "var(--surface-card)",
                border: t.onDark ? "1px solid rgba(255,247,239,.18)" : "var(--border-hairline)",
                boxShadow: t.onDark ? "none" : "var(--shadow-card)",
              }}
            >
              <span style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", height: 74, borderRadius: 10, overflow: "hidden", background: t.onDark ? "rgba(255,247,239,.07)" : "var(--surface-card-tint)" }}>
                {c.img ? (
                  <img src={c.img} alt="" style={{ maxWidth: "86%", maxHeight: "86%", objectFit: "contain", filter: "drop-shadow(0 6px 10px rgba(20,12,6,.3))" }} />
                ) : (
                  <image-slot id={"hero-lineup-" + c.id} placeholder={"foto " + c.name} style={{ position: "absolute", inset: 0 }}></image-slot>
                )}
              </span>
              <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 650, lineHeight: 1.25, color: t.onDark ? "#FFF7EF" : "var(--text-primary)" }}>{c.name}</span>
                <span style={{ fontSize: 11, color: t.onDark ? "rgba(255,247,239,.65)" : "var(--text-meta)" }}>{c.mol}</span>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: t.accent, fontFeatureSettings: "var(--numeric-tabular)" }}>{c.price}</span>
              </span>
            </button>
          ))}
        </div>
        <p style={{ margin: "0 22px", fontSize: 10.5, lineHeight: 1.5, color: t.foot, textAlign: "center" }}>
          Semua dimulai dari kuis kesehatan — dokter yang memutuskan obat & dosismu. *Hasil berbeda tiap orang. Mounjaro® (tirzepatide) adalah merek dagang Eli Lilly; Dara tidak berafiliasi.
        </p>
      </div>
    </section>
  );
}
