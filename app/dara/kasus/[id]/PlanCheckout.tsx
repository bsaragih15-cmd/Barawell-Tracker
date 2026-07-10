'use client';
/* Plan reveal + checkout. Honest commerce: renewal date in bold BEFORE the
   pay button, totals never hidden, prepay is the discount mechanism. */
import React from 'react';
import { PlanCard, rp } from '../../ui';
import { payCase } from '../../actions';

type PlanView = {
  id: string; name: string; medication: string | null; features: string[];
  fulfillment: string; monthly: number; m3: number | null; m6: number | null;
};

export function PlanCheckout({ caseId, plan }: { caseId: string; plan: PlanView }) {
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState('');

  const prices: Record<number, { perMonth: number; total?: number; savings?: string }> = {
    1: { perMonth: plan.monthly },
  };
  if (plan.m3) prices[3] = { perMonth: plan.m3, total: plan.m3 * 3, savings: `hemat ${rp((plan.monthly - plan.m3) * 3)}` };
  if (plan.m6) prices[6] = { perMonth: plan.m6, total: plan.m6 * 6, savings: `hemat ${rp((plan.monthly - plan.m6) * 6)}` };

  const renewal = new Date();
  renewal.setMonth(renewal.getMonth() + 1);
  const renewalStr = renewal.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <PlanCard
        planName={plan.name}
        medication={plan.medication ?? undefined}
        features={plan.features}
        prices={prices}
        ctaLabel={busy ? 'Memproses…' : 'Bayar & mulai program'}
        onCta={async (term) => {
          setBusy(true); setErr('');
          try { await payCase(caseId, term); }
          catch (e) { setErr(e instanceof Error ? e.message : 'Pembayaran gagal — coba lagi.'); setBusy(false); }
        }}
        footer={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: 'var(--text-secondary)' }}>
              {plan.fulfillment === 'clinic_pickup'
                ? 'Obat suntik diambil / diberikan di klinik partner terdekat — jadwal diatur tim care setelah pembayaran. Tidak dikirim ke rumah.'
                : 'Dikirim diskret dengan nama pengirim netral. Kiriman ulang otomatis, 6 hari sebelum habis.'}
            </p>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: 'var(--text-primary)' }}>
              Perpanjangan berikutnya: <strong>{renewalStr}</strong>. Batalkan kapan saja hingga 48 jam sebelum pemrosesan.
            </p>
          </div>
        }
      />
      {err && <p role="alert" style={{ margin: 0, fontSize: 13, color: 'var(--dara-error)' }}>{err}</p>}
      <p style={{ margin: 0, fontSize: 12, color: 'var(--text-meta)' }}>
        Pembayaran dalam versi ini masih simulasi (belum terhubung ke payment gateway).
      </p>
    </>
  );
}
