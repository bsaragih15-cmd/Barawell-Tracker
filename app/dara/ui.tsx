'use client';
/* Dara shared components — ported from the design handoff (public/dara/components).
   Inline styles + CSS custom properties, faithful to the prototype. */
import React from 'react';
import Link from 'next/link';

type CSS = React.CSSProperties;

/* ── Button ─────────────────────────────────────────────────────────── */
export function Button({
  variant = 'primary', size = 'md', fullWidth = false, disabled = false, children, style, ...rest
}: {
  variant?: 'primary' | 'secondary' | 'quiet'; size?: 'md' | 'lg'; fullWidth?: boolean;
  disabled?: boolean; children: React.ReactNode; style?: CSS;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const s = size === 'lg' ? { padding: '15px 28px', fontSize: 17, minHeight: 52 } : { padding: '11px 20px', fontSize: 15, minHeight: 44 };
  const variants: Record<string, CSS> = {
    primary: {
      background: disabled ? 'var(--dara-line)' : hover ? 'var(--accent-action-hover)' : 'var(--accent-action)',
      color: disabled ? 'var(--text-meta)' : 'var(--text-on-accent)', border: '1px solid transparent',
    },
    secondary: {
      background: hover && !disabled ? 'rgba(33,26,20,0.05)' : 'transparent',
      color: disabled ? 'var(--text-meta)' : 'var(--text-primary)',
      border: `1px solid ${disabled ? 'var(--dara-line)' : 'var(--dara-ink-faint)'}`,
    },
    quiet: {
      background: 'transparent', color: disabled ? 'var(--text-meta)' : hover ? 'var(--accent-action-hover)' : 'var(--accent-action)',
      border: '1px solid transparent', textDecoration: hover && !disabled ? 'underline' : 'none', textUnderlineOffset: 3,
    },
  };
  return (
    <button
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={{
        display: fullWidth ? 'flex' : 'inline-flex', width: fullWidth ? '100%' : undefined,
        alignItems: 'center', justifyContent: 'center', gap: 8,
        fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: s.fontSize, lineHeight: 1.2,
        padding: s.padding, minHeight: s.minHeight, borderRadius: 'var(--radius-control)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out)',
        transform: press && !disabled ? 'scale(0.985)' : 'none',
        ...variants[variant], ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ── ProgressBar — thin terracotta line ─────────────────────────────── */
export function ProgressBar({ value = 0, label = 'Kemajuan kuis', style }: { value?: number; label?: string; style?: CSS }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={label}
      style={{ height: 3, width: '100%', background: 'var(--dara-line)', borderRadius: 'var(--radius-pill)', overflow: 'hidden', ...style }}>
      <div style={{ height: '100%', width: pct + '%', background: 'var(--dara-terracotta)', borderRadius: 'var(--radius-pill)', transition: 'width var(--dur-slow) var(--ease-out)' }} />
    </div>
  );
}

/* ── Input — errors inline, in words ────────────────────────────────── */
export function Input({ label, hint, error, type = 'text', suffix, id, style, ...rest }: {
  label: string; hint?: string; error?: string; type?: string; suffix?: string; id?: string; style?: CSS;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const [focus, setFocus] = React.useState(false);
  const autoId = React.useId();
  const fieldId = id || autoId;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--font-ui)', ...style }}>
      <label htmlFor={fieldId} style={{ fontSize: 'var(--text-small)', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input id={fieldId} type={type} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} aria-invalid={!!error}
          style={{
            width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-ui)', fontSize: 16, color: 'var(--text-primary)',
            background: 'var(--surface-card)',
            border: `1px solid ${error ? 'var(--dara-error)' : focus ? 'var(--dara-terracotta)' : 'var(--dara-line)'}`,
            boxShadow: focus ? '0 0 0 3px var(--dara-terracotta-tint)' : 'none',
            borderRadius: 'var(--radius-control)', padding: suffix ? '13px 56px 13px 16px' : '13px 16px', minHeight: 48, outline: 'none',
            transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
          }}
          {...rest}
        />
        {suffix && <span style={{ position: 'absolute', right: 16, fontSize: 'var(--text-small)', color: 'var(--text-meta)', pointerEvents: 'none' }}>{suffix}</span>}
      </div>
      {error ? (
        <p role="alert" style={{ margin: 0, fontSize: 'var(--text-caption)', color: 'var(--dara-error)' }}>{error}</p>
      ) : hint ? (
        <p style={{ margin: 0, fontSize: 'var(--text-caption)', color: 'var(--text-meta)' }}>{hint}</p>
      ) : null}
    </div>
  );
}

/* ── ConsentCheckbox — never pre-checked, whole row tappable ────────── */
export function ConsentCheckbox({ checked = false, onChange, children, style }: {
  checked?: boolean; onChange?: (v: boolean) => void; children: React.ReactNode; style?: CSS;
}) {
  return (
    <label style={{
      display: 'flex', gap: 12, alignItems: 'flex-start', padding: '14px 16px', background: 'var(--surface-card)',
      border: `1px solid ${checked ? 'var(--dara-terracotta)' : 'var(--dara-line)'}`, borderRadius: 'var(--radius-control)',
      cursor: 'pointer', fontFamily: 'var(--font-ui)', transition: 'border-color var(--dur-fast) var(--ease-out)', ...style,
    }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange?.(e.target.checked)}
        style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }} />
      <span aria-hidden="true" style={{
        width: 22, height: 22, flexShrink: 0, marginTop: 1, borderRadius: 6,
        border: `1.5px solid ${checked ? 'var(--dara-terracotta)' : 'var(--dara-ink-faint)'}`,
        background: checked ? 'var(--dara-terracotta)' : 'var(--surface-card)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)',
      }}>
        {checked && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
        )}
      </span>
      <span style={{ fontSize: 'var(--text-small)', lineHeight: 1.55, color: 'var(--text-secondary)' }}>{children}</span>
    </label>
  );
}

/* ── Check icon (sage) ──────────────────────────────────────────────── */
export const Check = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--dara-sage)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="M20 6 9 17l-5-5" /></svg>
);

/* ── TierCard — GLP-1 vs Oral, EQUAL design weight ──────────────────── */
export function TierCard({ eyebrow, name, description, priceFrom, delivery, features = [], recommended = false, ctaLabel = 'Mulai kuis', href, onCta, style }: {
  eyebrow: string; name: string; description: string; priceFrom: string; delivery?: string;
  features?: string[]; recommended?: boolean; ctaLabel?: string; href?: string; onCta?: () => void; style?: CSS;
}) {
  const cta = href ? (
    <Link href={href} style={{ textDecoration: 'none', display: 'flex' }}>
      <Button size="lg" fullWidth variant={recommended ? 'primary' : 'secondary'} style={{ flex: 1 }}>{ctaLabel}</Button>
    </Link>
  ) : (
    <Button size="lg" fullWidth variant={recommended ? 'primary' : 'secondary'} onClick={onCta}>{ctaLabel}</Button>
  );
  return (
    <div className="dara-lift" style={{
      position: 'relative', background: 'var(--surface-card)',
      border: '1px solid ' + (recommended ? 'var(--dara-terracotta)' : 'var(--dara-line)'),
      borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)', padding: 'var(--space-3)',
      fontFamily: 'var(--font-ui)', display: 'flex', flexDirection: 'column', gap: 14, boxSizing: 'border-box', ...style,
    }}>
      {recommended && (
        <span style={{ position: 'absolute', top: -10, left: 'var(--space-3)', fontSize: 11.5, fontWeight: 700, color: 'var(--text-on-accent)', background: 'var(--dara-terracotta)', padding: '3px 10px', borderRadius: 'var(--radius-pill)' }}>
          Disarankan untukmu
        </span>
      )}
      <div>
        <p style={{ margin: 0, fontSize: 'var(--text-caption)', fontWeight: 600, letterSpacing: '0.02em', color: 'var(--text-meta)' }}>{eyebrow}</p>
        <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', fontWeight: 600, color: 'var(--text-primary)' }}>{name}</p>
        <p style={{ margin: '6px 0 0', fontSize: 'var(--text-small)', lineHeight: 1.55, color: 'var(--text-secondary)' }}>{description}</p>
      </div>
      {features.length > 0 && (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {features.map((f, i) => (
            <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 'var(--text-small)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <Check />{f}
            </li>
          ))}
        </ul>
      )}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap', borderTop: 'var(--border-hairline)', paddingTop: 14 }}>
        <span style={{ fontSize: 'var(--text-small)', color: 'var(--text-meta)' }}>mulai</span>
        <span className="dara-mono-price" style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-primary)' }}>{priceFrom}</span>
        <span style={{ fontSize: 'var(--text-small)', color: 'var(--text-meta)' }}>/bln</span>
      </div>
      {delivery && <p style={{ margin: 0, fontSize: 'var(--text-caption)', color: 'var(--text-meta)' }}>{delivery}</p>}
      {cta}
    </div>
  );
}

/* ── MedicationCard — Wegovy/Mounjaro PREFERENCE chip, never a cart ─── */
export function MedicationCard({ name, molecule, cadence, results, priceLabel, selected = false, onSelect, style }: {
  name: string; molecule: string; cadence: string; results: string; priceLabel: string;
  selected?: boolean; onSelect?: () => void; style?: CSS;
}) {
  const [hover, setHover] = React.useState(false);
  const row = (label: string, value: string) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
      <span style={{ fontSize: 12.5, color: 'var(--text-meta)' }}>{label}</span>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', textAlign: 'right', fontFeatureSettings: 'var(--numeric-tabular)' }}>{value}</span>
    </div>
  );
  return (
    <button type="button" role="radio" aria-checked={selected} onClick={onSelect}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font-ui)', background: 'var(--surface-card)',
        border: '1px solid ' + (selected ? 'var(--dara-terracotta)' : hover ? 'var(--dara-ink-faint)' : 'var(--dara-line)'),
        boxShadow: selected ? 'inset 0 0 0 1px var(--dara-terracotta)' : 'var(--shadow-card)',
        borderRadius: 'var(--radius-card)', padding: 'var(--space-25)', display: 'flex', flexDirection: 'column', gap: 12, boxSizing: 'border-box',
        transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)', ...style,
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div>
          <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}>{name}</p>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>{molecule}</p>
        </div>
        {selected ? (
          <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--dara-terracotta)', background: 'var(--dara-terracotta-tint)', padding: '4px 10px', borderRadius: 'var(--radius-pill)', whiteSpace: 'nowrap' }}>Pilihanmu</span>
        ) : (
          <span aria-hidden="true" style={{ width: 20, height: 20, borderRadius: '50%', border: '1.5px solid var(--dara-ink-faint)', flexShrink: 0 }} />
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, borderTop: 'var(--border-hairline)', paddingTop: 12 }}>
        {row('Ritme', cadence)}
        {row('Hasil (uji klinis)', results)}
        {row('Harga program', priceLabel)}
      </div>
      <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--dara-sage-deep)', background: 'var(--dara-sage-tint)', padding: '3px 9px', borderRadius: 'var(--radius-pill)', alignSelf: 'flex-start' }}>
        Indikasi berat badan · terdaftar BPOM
      </span>
    </button>
  );
}

/* ── PlanCard — value stack first, price after; 1/3/6-bln toggle ────── */
export function rp(n: number) { return 'Rp ' + Number(n).toLocaleString('id-ID'); }

export function PlanCard({ planName, medication, bpom = true, features = [], prices, defaultTerm = 1, ctaLabel = 'Lanjutkan', onCta, footer, style }: {
  planName: string; medication?: string; bpom?: boolean; features?: string[];
  prices: Record<number, { perMonth: number; total?: number; savings?: string }>;
  defaultTerm?: number; ctaLabel?: string; onCta?: (term: number) => void; footer?: React.ReactNode; style?: CSS;
}) {
  const [term, setTerm] = React.useState(defaultTerm);
  const terms = [1, 3, 6].filter((t) => prices[t]);
  const current = prices[term] || { perMonth: 0 };
  return (
    <div style={{
      background: 'var(--surface-card)', border: 'var(--border-hairline)', borderRadius: 'var(--radius-card)',
      boxShadow: 'var(--shadow-card)', padding: 'var(--space-3)', fontFamily: 'var(--font-ui)',
      display: 'flex', flexDirection: 'column', gap: 18, boxSizing: 'border-box', ...style,
    }}>
      <div>
        <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', fontWeight: 550, color: 'var(--text-primary)' }}>{planName}</p>
        {medication && (
          <p style={{ margin: '6px 0 0', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 'var(--text-small)', color: 'var(--text-secondary)' }}>
            {medication}
            {bpom && <span style={{ fontSize: 'var(--text-caption)', fontWeight: 600, color: 'var(--dara-sage-deep)', background: 'var(--dara-sage-tint)', padding: '2px 8px', borderRadius: 'var(--radius-pill)' }}>Terdaftar BPOM</span>}
          </p>
        )}
      </div>
      {features.length > 0 && (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {features.map((f, i) => (
            <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 'var(--text-small)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <Check />{f}
            </li>
          ))}
        </ul>
      )}
      {terms.length > 1 && (
        <div role="radiogroup" aria-label="Pilih durasi prabayar" style={{ display: 'grid', gridTemplateColumns: `repeat(${terms.length}, 1fr)`, gap: 4, background: 'var(--dara-oat)', borderRadius: 'var(--radius-control)', padding: 4 }}>
          {terms.map((t) => {
            const active = t === term;
            return (
              <button key={t} type="button" role="radio" aria-checked={active} onClick={() => setTerm(t)}
                style={{
                  border: '1px solid ' + (active ? 'var(--dara-line)' : 'transparent'),
                  background: active ? 'var(--surface-card)' : 'transparent', borderRadius: 9, padding: '9px 4px', minHeight: 44,
                  fontFamily: 'var(--font-ui)', fontSize: 'var(--text-small)', fontWeight: 600,
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer',
                  transition: 'background var(--dur-fast) var(--ease-out)',
                }}>
                {t} bln
                {prices[t]?.savings ? <span style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--dara-sage-deep)' }}>{prices[t].savings}</span> : null}
              </button>
            );
          })}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <span className="dara-mono-price" style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)' }}>{rp(current.perMonth)}</span>
        <span style={{ fontSize: 'var(--text-small)', color: 'var(--text-meta)' }}>/bulan</span>
        {term > 1 && current.total != null && (
          <span style={{ width: '100%', fontSize: 'var(--text-caption)', color: 'var(--text-meta)', fontFeatureSettings: 'var(--numeric-tabular)' }}>
            Dibayar {rp(current.total)} sekali untuk {term} bulan
          </span>
        )}
      </div>
      {footer}
      {onCta && <Button size="lg" fullWidth onClick={() => onCta(term)}>{ctaLabel}</Button>}
    </div>
  );
}

/* ── StatusChip — PRD case states ───────────────────────────────────── */
const STATUS: Record<string, { label: string; bg: string; border: string; color: string; dot: string }> = {
  in_review: { label: 'Sedang ditinjau dokter', bg: 'transparent', border: 'var(--dara-sage)', color: 'var(--dara-sage-deep)', dot: 'var(--dara-sage)' },
  approved: { label: 'Disetujui', bg: 'var(--dara-sage)', border: 'var(--dara-sage)', color: '#FFFFFF', dot: '#FFFFFF' },
  needs_info: { label: 'Dokter butuh info tambahan', bg: 'var(--dara-info-tint)', border: 'var(--dara-info)', color: 'var(--dara-info)', dot: 'var(--dara-info)' },
  rejected: { label: 'Tidak dapat dilanjutkan', bg: 'transparent', border: 'var(--dara-ink-faint)', color: 'var(--text-secondary)', dot: 'var(--dara-ink-faint)' },
  paid: { label: 'Aktif — program berjalan', bg: 'var(--dara-sage)', border: 'var(--dara-sage)', color: '#FFFFFF', dot: '#FFFFFF' },
  cancelled: { label: 'Dibatalkan', bg: 'transparent', border: 'var(--dara-ink-faint)', color: 'var(--text-secondary)', dot: 'var(--dara-ink-faint)' },
};
export function StatusChip({ status = 'in_review', label, style }: { status?: string; label?: string; style?: CSS }) {
  const s = STATUS[status] || STATUS.in_review;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 'var(--radius-pill)',
      background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontFamily: 'var(--font-ui)',
      fontSize: 'var(--text-caption)', fontWeight: 600, lineHeight: 1.4, whiteSpace: 'nowrap', ...style,
    }}>
      <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {label || s.label}
    </span>
  );
}

/* ── TrustBar — quiet dots-separated strip ──────────────────────────── */
export function TrustBar({ items, style }: { items?: string[]; style?: CSS }) {
  const list = items || ['Obat terdaftar BPOM', 'Dokter berlisensi (STR aktif)', 'Pengiriman diskret', 'Bermitra dengan klinik berizin'];
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', columnGap: 12, rowGap: 6,
      padding: '14px 16px', borderTop: 'var(--border-hairline)', borderBottom: 'var(--border-hairline)', fontFamily: 'var(--font-ui)', ...style,
    }}>
      {list.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span aria-hidden="true" style={{ color: 'var(--dara-line)', fontSize: 10 }}>●</span>}
          <span style={{ fontSize: 'var(--text-caption)', fontWeight: 500, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{item}</span>
        </React.Fragment>
      ))}
    </div>
  );
}

/* ── FAQAccordion ───────────────────────────────────────────────────── */
export function FAQAccordion({ items = [], style }: { items: { q: string; a: string }[]; style?: CSS }) {
  const [open, setOpen] = React.useState<number | null>(null);
  return (
    <div style={{ fontFamily: 'var(--font-ui)', borderTop: 'var(--border-hairline)', ...style }}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i} style={{ borderBottom: 'var(--border-hairline)' }}>
            <button aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i)}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, width: '100%', textAlign: 'left',
                background: 'none', border: 'none', cursor: 'pointer', padding: '18px 2px', minHeight: 44,
                fontFamily: 'var(--font-ui)', fontSize: 16, fontWeight: 550, color: 'var(--text-primary)', lineHeight: 1.4,
              }}>
              {item.q}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--dara-ink-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-base) var(--ease-out)' }}>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            <div style={{ display: 'grid', gridTemplateRows: isOpen ? '1fr' : '0fr', transition: 'grid-template-rows var(--dur-base) var(--ease-out)' }}>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ margin: '0 0 18px', fontSize: 'var(--text-small)', lineHeight: 1.6, color: 'var(--text-secondary)', maxWidth: '62ch' }}>{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── StickyCta — mobile-only bottom bar (prototype landing pages).
   With priceFrom it renders the berat-badan price-anchor variant;
   without, a full-width CTA. Hidden ≥768px via .dara-sticky-cta. ────── */
export function StickyCta({ href, label, priceFrom }: { href: string; label: string; priceFrom?: string }) {
  return (
    <div className="dara-sticky-cta">
      {priceFrom && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <span style={{ fontSize: 11, color: 'var(--text-meta)' }}>mulai dari</span>
          <span className="dara-mono-price" style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
            {priceFrom}<span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 400, color: 'var(--text-meta)' }}>/bln</span>
          </span>
        </div>
      )}
      <Link href={href} style={{
        flex: 1, textDecoration: 'none', textAlign: 'center', whiteSpace: 'nowrap',
        background: 'var(--accent-action)', color: 'var(--text-on-accent)',
        fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 17, lineHeight: 1.2,
        padding: '15px 20px', minHeight: 52, borderRadius: 'var(--radius-control)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {label}
      </Link>
    </div>
  );
}

/* ── HelpStrip — crisis line, quiet, on every mental-health surface ─── */
export function HelpStrip({ style }: { style?: CSS }) {
  return (
    <div style={{
      background: 'var(--dara-info-tint)', borderTop: '1px solid var(--dara-info)', padding: '10px 16px',
      textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: 'var(--text-caption)', color: 'var(--dara-info)', ...style,
    }}>
      Butuh bantuan sekarang? Hubungi layanan krisis Kemenkes <strong>119 ext. 8</strong> — 24 jam, gratis.
    </div>
  );
}

/* ── Footer — legal identifiers a telemedicine brand must carry ─────── */
export function Footer({ style }: { style?: CSS }) {
  const cols = [
    { title: 'Layanan', links: [['Program berat badan', '/dara/berat-badan'], ['Pil KB', '/dara/pil-kb'], ['Kulit', '/dara/kulit'], ['Rambut', '/dara/rambut'], ['Kesehatan mental', '/dara/kesehatan-mental']] },
    { title: 'Bantuan', links: [['Cara kerja', '/dara#cara-kerja'], ['Cek status konsultasi', '/dara#status'], ['Hubungi kami', '#']] },
  ];
  const legalLines = [
    'PT Dara Sehat Indonesia · Jakarta Selatan',
    'Layanan telemedisin diselenggarakan bersama klinik partner berizin (dokter ber-STR & SIP aktif). Obat keras hanya diberikan dengan resep dokter.',
    'Obat terdaftar BPOM — cek di cekbpom.pom.go.id. Obat suntik diambil / diberikan di klinik partner, tidak dikirim ke rumah.',
    'Data pribadimu dilindungi sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.',
    'Layanan untuk usia 18 tahun ke atas. Bukan untuk keadaan darurat — hubungi 119 atau IGD terdekat.',
    'Wegovy® dan Mounjaro® adalah merek dagang pemiliknya; Dara tidak berafiliasi.',
  ];
  return (
    <footer style={{ background: 'var(--surface-card-tint)', borderTop: 'var(--border-hairline)', padding: 'var(--space-6) var(--space-3) var(--space-4)', fontFamily: 'var(--font-ui)', ...style }}>
      <div style={{ maxWidth: 'var(--measure-page)', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-5)', justifyContent: 'space-between' }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: 'var(--text-primary)' }}>Dara</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-5)' }}>
            {cols.map((col, i) => (
              <div key={i} style={{ minWidth: 140 }}>
                <p style={{ margin: '0 0 10px', fontSize: 'var(--text-caption)', fontWeight: 600, color: 'var(--text-meta)' }}>{col.title}</p>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {col.links.map(([label, href], j) => (
                    <li key={j}><Link href={href} style={{ fontSize: 'var(--text-small)', color: 'var(--text-secondary)', textDecoration: 'none' }}>{label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: 'var(--border-hairline)', paddingTop: 'var(--space-25)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {legalLines.map((line, i) => (
            <p key={i} style={{ margin: 0, fontSize: 'var(--text-caption)', lineHeight: 1.6, color: 'var(--text-meta)' }}>{line}</p>
          ))}
        </div>
      </div>
    </footer>
  );
}
