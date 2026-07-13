'use client';

import { useMemo, useState } from 'react';
import type { SegData, SegMatrixCell, ActionRow } from './types';

// Local money helper — mirrors the cockpit convention (mono, Rp, compact).
const rp = (v: number) => {
  const a = Math.abs(v); let s: string;
  if (a >= 1e9) s = (v / 1e9).toFixed(a >= 1e10 ? 0 : 1) + 'B';
  else if (a >= 1e6) s = (v / 1e6).toFixed(a >= 1e8 ? 0 : 1) + 'M';
  else if (a >= 1e3) s = (v / 1e3).toFixed(0) + 'k';
  else s = Math.round(v).toString();
  return 'Rp ' + s;
};
const N = (v: unknown) => (typeof v === 'number' ? v : Number(v)) || 0;
const pc = (v: unknown) => N(v).toFixed(1);

const TIERS = ['Whale', 'Core', 'Entry'] as const;
const LIFE = ['New', 'Active-repeat', 'At-risk', 'Dormant'] as const;
// The primary play each lifecycle column implies (so-what labels).
const PLAY: Record<string, string> = {
  'New': '2nd-order nudge', 'Active-repeat': 'bundle · cross-sell',
  'At-risk': 'refill now', 'Dormant': 'win-back',
};
const LIFE_COLOR: Record<string, string> = {
  'New': 'var(--s2)', 'Active-repeat': 'var(--s5)', 'At-risk': 'var(--fi)', 'Dormant': 'var(--rag-r)',
};

const QUEUES: { key: string; label: string; blurb: string }[] = [
  { key: 'refill_due', label: 'Refill due', blurb: 'One-order buyers inside the refill window — the 2nd-order engine' },
  { key: 'winback_value', label: 'Win-back value', blurb: 'High-value customers gone >90d silent — recover the money that left' },
  { key: 'cross_sell', label: 'Cross-sell', blurb: 'Trusting repeaters with no Baralast attach' },
  { key: 'aov_expand', label: 'AOV expand', blurb: 'Active single-box buyers — bundle / subscribe' },
  { key: 'channel_migrate', label: 'Channel migrate', blurb: 'Marketplace-captive — move to owned before blocks bite' },
];

export default function Segments({ seg }: { seg: SegData }) {
  const [cell, setCell] = useState<{ t: string; l: string } | null>(null);
  const [queue, setQueue] = useState('refill_due');
  const [copied, setCopied] = useState(false);

  const s = seg.summary;
  if (!s) {
    return (
      <div className="panel" style={{ padding: 40, textAlign: 'center', color: 'var(--ink-2)' }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Segments</div>
        No segmentation data yet. Apply migration <span className="mono">0004_segments</span> and run{' '}
        <span className="mono">scripts/ingest_segments.py</span> against the project.
      </div>
    );
  }

  const cellMap = useMemo(() => {
    const m = new Map<string, SegMatrixCell>();
    seg.matrix.forEach(c => m.set(c.value_tier + '|' + c.lifecycle, c));
    return m;
  }, [seg.matrix]);
  const maxCellSpend = useMemo(
    () => Math.max(1, ...seg.matrix.map(c => N(c.spend))), [seg.matrix]);

  const qRows = useMemo(
    () => seg.queues.filter(r => r.queue === queue).sort((a, b) => a.rn - b.rn),
    [seg.queues, queue]);

  const copyList = () => {
    const text = qRows.map(r => `${r.name ?? '—'}\t${r.city ?? ''}\t${rp(N(r.spend))}\t${r.reason}`).join('\n');
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1600);
    });
  };

  const f = seg.funnel;
  const acquired = N(f?.acquired);
  const funnelSteps = f ? [
    { label: 'Acquired', v: N(f.acquired), note: 'all customers' },
    { label: '2nd order', v: N(f.ordered_2plus), note: 'came back once' },
    { label: '3rd+ order', v: N(f.ordered_3plus), note: 'habit forming' },
    { label: '5th+ order', v: N(f.ordered_5plus), note: 'loyal core' },
  ] : [];

  const maxRefill = Math.max(1, ...seg.refill.map(b => N(b.customers)));
  const totChan = Math.max(1, seg.channels.reduce((a, c) => a + N(c.orders), 0));
  const ownedShare = seg.channels.filter(c => ['website', 'whatsapp'].includes(c.channel))
    .reduce((a, c) => a + N(c.orders), 0) / totChan * 100;
  const toko = seg.channels.find(c => c.channel === 'tokopedia');

  const p = seg.product;

  return (
    <div className="seg">
      {/* headline */}
      <div className="seg-tiles">
        <Tile k={pc(s.repeat_rate) + '%'} lbl="Repeat rate" sub={`${N(s.repeaters).toLocaleString()} of ${N(s.customers).toLocaleString()} buy again`} accent />
        <Tile k={N(s.one_and_done).toLocaleString()} lbl="One-and-done" sub={`${pc(100 - N(s.repeat_rate))}% never reorder`} />
        <Tile k={N(s.dormant_ct).toLocaleString()} lbl="Dormant pool" sub=">90d silent · reactivate" />
        <Tile k="≈46d" lbl="Refill window" sub="median 1st→2nd order" />
        <Tile k={N(p?.bara_crosssell_targets).toLocaleString()} lbl="Cross-sell headroom" sub="repeaters w/o Baralast" />
      </div>

      {/* MATRIX */}
      <div className="seg-block">
        <div className="seg-h">
          <div>
            <div className="eyebrow">Where the value sits · value tier × lifecycle</div>
            <div className="seg-lead">Count and lifetime Rp per cell. Colour = revenue weight. The play per column is the so-what.</div>
          </div>
          <div className="seg-asof mono">as of {s.asof}</div>
        </div>
        <div className="matrix">
          <div className="mx-corner" />
          {LIFE.map(l => (
            <div className="mx-colh" key={l}>
              <span className="mx-life" style={{ color: LIFE_COLOR[l] }}>{l}</span>
              <span className="mx-play">{PLAY[l]}</span>
            </div>
          ))}
          {TIERS.map(t => (
            <FragmentRow key={t} t={t} cellMap={cellMap} maxSpend={maxCellSpend} sel={cell} onSel={setCell} />
          ))}
        </div>
        {cell && (() => {
          const c = cellMap.get(cell.t + '|' + cell.l);
          return (
            <div className="mx-detail mono">
              <b>{cell.t} · {cell.l}</b>{c ? <>
                {' — '}{N(c.customers).toLocaleString()} customers · {rp(N(c.spend))} lifetime ·
                avg AOV {rp(N(c.avg_aov))} · avg recency {N(c.avg_recency)}d ·
                play: <span style={{ color: 'var(--accent-ink)' }}>{PLAY[cell.l]}</span>
              </> : ' — no customers'}
            </div>
          );
        })()}
      </div>

      <div className="seg-two">
        {/* FUNNEL */}
        <div className="seg-block">
          <div className="eyebrow">The leak is the second order</div>
          <div className="seg-lead">Retention funnel — how many survive each reorder step.</div>
          <div className="funnel">
            {funnelSteps.map((st, i) => {
              const w = acquired ? (st.v / acquired) * 100 : 0;
              const conv = i > 0 && funnelSteps[i - 1].v ? (st.v / funnelSteps[i - 1].v) * 100 : null;
              return (
                <div className="fn-row" key={st.label}>
                  <div className="fn-lbl">{st.label}</div>
                  <div className="fn-track">
                    <div className="fn-bar" style={{ width: Math.max(w, 1.5) + '%' }} />
                    <span className="fn-v mono">{st.v.toLocaleString()}</span>
                  </div>
                  <div className="fn-conv mono">{conv != null ? '↳ ' + conv.toFixed(0) + '%' : ''}</div>
                </div>
              );
            })}
          </div>
          <div className="fn-note">
            <b className="mono">{pc(100 - N(s.repeat_rate))}%</b> drop after the first order —
            the single biggest, cheapest lever.
          </div>
        </div>

        {/* REFILL COHORT */}
        <div className="seg-block">
          <div className="eyebrow">Everyone refills around day 46</div>
          <div className="seg-lead">Gap between 1st and 2nd order. The bar under the marker is your nudge-send window.</div>
          <div className="cohort">
            {seg.refill.map(b => {
              const h = (N(b.customers) / maxRefill) * 100;
              const hot = b.bin === '31-45' || b.bin === '46-60';
              return (
                <div className="co-col" key={b.bin}>
                  <div className="co-v mono">{N(b.customers)}</div>
                  <div className="co-bar" style={{ height: Math.max(h, 3) + '%', background: hot ? 'var(--accent)' : 'var(--s2)' }} />
                  <div className={'co-lbl mono' + (hot ? ' hot' : '')}>{b.bin}</div>
                </div>
              );
            })}
          </div>
          <div className="fn-note">Median <b className="mono">46 days</b>. Fire the reorder nudge at day 30–45, before they lapse.</div>
        </div>
      </div>

      <div className="seg-two">
        {/* CHANNEL */}
        <div className="seg-block">
          <div className="eyebrow">You already own your biggest channel</div>
          <div className="seg-lead">Orders by channel. Owned (website + WhatsApp) = {ownedShare.toFixed(0)}%.</div>
          <div className="chan">
            {seg.channels.map(c => {
              const owned = ['website', 'whatsapp'].includes(c.channel);
              const w = (N(c.orders) / totChan) * 100;
              return (
                <div className="ch-row" key={c.channel}>
                  <div className="ch-lbl">{c.channel}{owned && <span className="ch-tag">owned</span>}</div>
                  <div className="ch-track">
                    <div className="ch-bar" style={{ width: Math.max(w, 1) + '%', background: owned ? 'var(--accent)' : 'var(--s3)' }} />
                  </div>
                  <div className="ch-v mono">{w.toFixed(0)}%</div>
                </div>
              );
            })}
          </div>
          {toko && (
            <div className="fn-note">
              Tokopedia (blocked channel) is only <b className="mono">{(N(toko.orders) / totChan * 100).toFixed(0)}%</b> of orders —
              exposure is bounded; migrate its captives to owned.
            </div>
          )}
        </div>

        {/* PRODUCT */}
        <div className="seg-block">
          <div className="eyebrow">Cross-sell is a blank canvas</div>
          <div className="seg-lead">Adoption across the catalogue. Attach today is near-zero — all upside.</div>
          {p && (() => {
            const cu = Math.max(1, N(p.customers));
            const bars = [
              { l: 'Sildenafil 50mg', v: N(p.s50_buyers), c: 'var(--s5)' },
              { l: 'Sildenafil 100mg', v: N(p.s100_buyers), c: 'var(--s3)' },
              { l: 'Baralast', v: N(p.bara_buyers), c: 'var(--en)' },
              { l: 'Tadalafil', v: N(p.tada_buyers), c: 'var(--fi)' },
            ];
            return (
              <>
                <div className="chan">
                  {bars.map(b => (
                    <div className="ch-row" key={b.l}>
                      <div className="ch-lbl">{b.l}</div>
                      <div className="ch-track"><div className="ch-bar" style={{ width: Math.max((b.v / cu) * 100, 0.6) + '%', background: b.c }} /></div>
                      <div className="ch-v mono">{(b.v / cu * 100).toFixed(0)}%</div>
                    </div>
                  ))}
                </div>
                <div className="prod-head">
                  <div className="ph"><span className="mono">{N(p.bara_crosssell_targets).toLocaleString()}</span><small>Baralast cross-sell targets</small></div>
                  <div className="ph"><span className="mono">{N(p.dosage_upsell_targets).toLocaleString()}</span><small>50→100mg dosage upsell</small></div>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* ACTION QUEUES */}
      <div className="seg-block">
        <div className="seg-h">
          <div>
            <div className="eyebrow">Work the list · ranked action queues</div>
            <div className="seg-lead">{QUEUES.find(q => q.key === queue)?.blurb}. Ranked by value — work the top down.</div>
          </div>
          <button className="copy-btn" onClick={copyList}>{copied ? '✓ copied' : 'Copy list'}</button>
        </div>
        <div className="q-tabs">
          {QUEUES.map(q => {
            const n = seg.queues.filter(r => r.queue === q.key).length;
            return (
              <button key={q.key} className={'q-tab' + (queue === q.key ? ' on' : '')} onClick={() => setQueue(q.key)}>
                {q.label}<span className="q-n">{n}</span>
              </button>
            );
          })}
        </div>
        <QueueTable rows={qRows} />
      </div>
    </div>
  );
}

function Tile({ k, lbl, sub, accent }: { k: string; lbl: string; sub: string; accent?: boolean }) {
  return (
    <div className={'seg-tile' + (accent ? ' accent' : '')}>
      <div className="eyebrow">{lbl}</div>
      <div className="st-k mono">{k}</div>
      <div className="st-sub">{sub}</div>
    </div>
  );
}

function FragmentRow({ t, cellMap, maxSpend, sel, onSel }:
  { t: string; cellMap: Map<string, SegMatrixCell>; maxSpend: number;
    sel: { t: string; l: string } | null; onSel: (c: { t: string; l: string } | null) => void }) {
  return (
    <>
      <div className="mx-rowh"><span className="mx-tier">{t}</span></div>
      {LIFE.map(l => {
        const c = cellMap.get(t + '|' + l);
        const spend = N(c?.spend);
        const alpha = c ? 0.06 + (spend / maxSpend) * 0.5 : 0;
        const on = sel?.t === t && sel?.l === l;
        return (
          <button key={l} className={'mx-cell' + (on ? ' on' : '') + (c ? '' : ' empty')}
            style={{ background: c ? `rgba(15,122,90,${alpha})` : 'var(--line-2)' }}
            onClick={() => onSel(on ? null : { t, l })}>
            {c ? (
              <>
                <span className="mx-n mono">{N(c.customers).toLocaleString()}</span>
                <span className="mx-rp mono">{rp(spend)}</span>
              </>
            ) : <span className="mx-dash">—</span>}
          </button>
        );
      })}
    </>
  );
}

function QueueTable({ rows }: { rows: ActionRow[] }) {
  if (!rows.length) return <div className="q-empty">No customers in this queue.</div>;
  return (
    <div className="q-wrap">
      <table className="q-tbl">
        <thead><tr>
          <th className="num">#</th><th>Customer</th><th>City</th>
          <th className="num">Lifetime</th><th className="num">Orders</th><th className="num">Recency</th>
          <th>Segment</th><th>Why</th>
        </tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.rn}>
              <td className="num id mono">{r.rn}</td>
              <td className="q-name">{r.name ?? '—'}</td>
              <td className="q-city">{r.city ?? '—'}</td>
              <td className="num mono" style={{ fontWeight: 600 }}>{rp(N(r.spend))}</td>
              <td className="num mono">{N(r.orders_n)}</td>
              <td className="num mono">{N(r.recency_days)}d</td>
              <td><span className="q-seg">{r.value_tier} · {r.lifecycle}</span></td>
              <td className="q-why">{r.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
