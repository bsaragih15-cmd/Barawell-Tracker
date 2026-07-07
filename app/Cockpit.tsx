'use client';

import { useState, useTransition, useMemo } from 'react';
import type { MouseEvent as ReactMouseEvent, ChangeEvent as ReactChangeEvent } from 'react';
import type { ScoredRow, Coverage, Config, Stage, Milestone, Pic } from './types';
import { moveStage, setRag, toggleMilestone, updateConfig, createInitiative, updateInitiative, setOwner, setStatus } from './actions';

const rp = (v: number) => {
  const a = Math.abs(v); let s: string;
  if (a >= 1e9) s = (v / 1e9).toFixed(a >= 1e10 ? 0 : 1) + 'B';
  else if (a >= 1e6) s = (v / 1e6).toFixed(a >= 1e8 ? 0 : 1) + 'M';
  else if (a >= 1e3) s = (v / 1e3).toFixed(0) + 'k';
  else s = Math.round(v).toString();
  return 'Rp ' + s;
};
const QC: Record<string, string> = { 'Quick Win': 'qw', 'Big Bet': 'bb', 'Fill-in': 'fi', 'Deprioritize': 'dp', 'Enabler': 'en' };
const STCOLOR = (n: number) => `--s${n}`;
const RAGV: Record<string, string> = { Green: '--rag-g', Amber: '--rag-a', Red: '--rag-r' };
const initials = (name: string) => name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
// Deterministic muted colour per owner id so avatars are recognisable at a glance.
const AV_COLORS = ['--s5', '--s3', '--en', '--fi', '--bb', '--s4'];
const avColor = (id: string) => AV_COLORS[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % AV_COLORS.length];

function Avatar({ name, ownerId, size = 20 }: { name: string; ownerId: string; size?: number }) {
  return (
    <span className="av" title={name}
      style={{ width: size, height: size, background: `var(${avColor(ownerId)}s)`, color: `var(${avColor(ownerId)})`, fontSize: size * 0.42 }}>
      {initials(name)}
    </span>
  );
}

export default function Cockpit({ rows: allRows, coverage, config, stages, milestones, pics }:
  { rows: ScoredRow[]; coverage: Coverage; config: Config; stages: Stage[]; milestones: Milestone[]; pics: Pic[]; }) {

  const [view, setView] = useState<'pipe' | 'table' | 'board' | 'traj'>('pipe');
  const [openId, setOpenId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<keyof ScoredRow>('ice');
  const [sortDir, setSortDir] = useState(-1);
  const [cfgOpen, setCfgOpen] = useState(false);
  const [formOpen, setFormOpen] = useState<null | { mode: 'new' } | { mode: 'edit'; row: ScoredRow }>(null);
  const [showKilled, setShowKilled] = useState(false);
  const [pending, start] = useTransition();

  const killedCount = allRows.filter(r => r.status === 'Killed').length;
  const rows = showKilled ? allRows : allRows.filter(r => r.status !== 'Killed');
  const buckets = useMemo(() => Array.from(new Set(allRows.map(r => r.bucket))).sort(), [allRows]);

  const open = allRows.find(r => r.id === openId) || null;
  const openMs = milestones.filter(m => m.initiative_id === openId);
  const today = new Date().toISOString().slice(0, 10);

  const T = coverage.target, cur = coverage.current_rev, gap = coverage.gap;
  const seg = (v: number) => `${Math.max(0, (v / T) * 100)}%`;
  const pipeCapped = Math.min(coverage.pipeline, Math.max(0, T - cur - coverage.committed - coverage.planned));

  const act = (fn: () => Promise<void>) => start(() => { fn(); });

  const bars = (n: number) => (
    <span className="bars">{[1, 2, 3, 4, 5].map(i => <span key={i} className={'bar' + (i <= n ? ' f' : '')} />)}</span>
  );
  const chip = (q: string) => (
    <span className="chip" style={{ background: `var(--${QC[q]}-s)`, color: `var(--${QC[q]})` }}>
      <span className="cd" style={{ background: `var(--${QC[q]})` }} />{q}
    </span>
  );
  const stgChip = (r: ScoredRow) => (
    <span className="stg" style={{ background: `var(${STCOLOR(r.stage)}s)`, color: `var(${STCOLOR(r.stage)})` }}>
      {r.stage_code} {r.stage_name}
    </span>
  );

  // ---- trajectory: 6-month risk-adjusted value ramp ----
  const traj = useMemo(() => {
    const months = 6;
    const startOf = (st: number) => [3, 3, 2, 1, 0, 0][st]; // L1..L5 start month
    const rampOf = (tti: string | null) => (tti === 'Q' ? 1 : tti === 'S' ? 4 : 2);
    const pts: number[] = [];
    for (let t = 0; t <= months; t++) {
      let add = 0;
      rows.forEach(r => {
        const s = startOf(r.stage), ramp = rampOf(r.tti);
        const frac = Math.max(0, Math.min(1, (t - s) / ramp));
        add += r.ra_rev * frac;
      });
      pts.push(cur + add);
    }
    return pts;
  }, [rows, cur]);

  return (
    <div className="wrap">
      <div className="topbar">
        <div className="brand"><h1>Barawell</h1><span className="sub">Value-Capture Pipeline · Q3 recovery</span></div>
        <div className="topright">
          <button className="assump-btn" onClick={() => setCfgOpen(true)}>Assumptions</button>
          <button className="new-btn" onClick={() => setFormOpen({ mode: 'new' })}>+ New initiative</button>
          <div className="live"><span className="dot" />{pending ? 'saving…' : 'live · Supabase'}</div>
        </div>
      </div>

      {/* HERO */}
      <div className="hero">
        <div className="hero-top">
          <div>
            <div className="eyebrow">Coverage to target · risk-adjusted by stage</div>
            <div className="lead">Current run-rate + pipeline value, confidence-weighted by stage-gate, against the {rp(T)} target</div>
          </div>
          <div className="cov mono">{coverage.coverage_pct}%<small>of gap covered</small></div>
        </div>
        <div className="bridge">
          <div className="seg base" style={{ width: seg(cur) }} />
          <div className="seg commit" style={{ width: seg(coverage.committed) }} />
          <div className="seg plan" style={{ width: seg(coverage.planned) }} />
          <div className="seg pipe" style={{ width: seg(pipeCapped) }} />
          <div className="g-target" />
        </div>
        <div className="g-labels mono"><span>Current <b>{rp(cur)}</b></span><span>Target {rp(T)}</span></div>
        <div className="g-legend">
          <span><i className="sw" style={{ background: '#1E2530' }} />Current run-rate</span>
          <span><i className="sw" style={{ background: 'var(--s5)' }} />Committed (L4–L5)</span>
          <span><i className="sw" style={{ background: 'var(--s3)' }} />Planned (L3)</span>
          <span><i className="sw" style={{ background: '#C3CEDA' }} />Pipeline (L1–L2)</span>
          <span><i className="sw" style={{ background: 'var(--line)' }} />Gap remaining</span>
        </div>
      </div>

      <div className="tiles">
        <div className="tile accent"><div className="eyebrow">Projected run-rate · risk-adj</div><div className="k mono">{rp(coverage.projected)}</div><div className="d">current + confidence-weighted pipeline</div></div>
        <div className="tile"><div className="eyebrow">Committed value / mo</div><div className="k mono">{rp(coverage.committed)}</div><div className="d">L4 in-flight + L5 realized</div></div>
        <div className="tile"><div className="eyebrow">Coverage of gap</div><div className="k mono">{coverage.coverage_pct}%</div><div className="d">committed only: {coverage.committed_pct}%</div></div>
        <div className="tile"><div className="eyebrow">Gap remaining · risk-adj</div><div className="k mono">{rp(Math.max(0, gap - coverage.total_ra))}</div><div className="d">to {rp(T)} target</div></div>
      </div>

      <div className="tabs">
        <div className="tabset">
          {([['pipe', 'Pipeline'], ['table', 'Register'], ['board', 'Prioritize'], ['traj', 'Trajectory']] as const).map(([v, l]) =>
            <button key={v} className={'tab' + (view === v ? ' on' : '')} onClick={() => setView(v)}>{l}</button>)}
        </div>
        <div className="meta">
          {rows.filter(r => r.status !== 'Killed').length} active
          {killedCount > 0 && <button className="killtoggle" onClick={() => setShowKilled(s => !s)}>{showKilled ? 'hide' : 'show'} {killedCount} killed</button>}
        </div>
      </div>

      {/* VIEWS */}
      {view === 'pipe' && (
        <div className="pipe-board">
          {stages.map(st => {
            const rs = rows.filter(r => r.stage === st.n).sort((a, b) => b.ra_rev - a.ra_rev);
            const sum = rs.reduce((s, r) => s + r.ra_rev, 0);
            return (
              <div className="pcol" key={st.n}>
                <div className="pcol-h"><span className="pt" style={{ color: `var(${STCOLOR(st.n)})` }}>{st.code} · {st.name}</span><span className="pc">{rs.length}</span></div>
                <div className="pcol-conf">confidence {Math.round(st.confidence * 100)}%</div>
                <div className="pcol-sum mono" style={{ color: `var(${STCOLOR(st.n)})` }}>{rp(sum)}/mo</div>
                {rs.map(r => (
                  <div className={'pcard' + (r.status === 'Killed' ? ' killed' : '')} key={r.id} style={{ borderTopColor: `var(${STCOLOR(st.n)})` }} onClick={() => setOpenId(r.id)}>
                    <div className="pcid mono">{r.id}{r.rag_effective && <span className="rag" title={r.rag_override ? 'RAG · manual' : 'RAG · auto from milestones'} style={{ background: `var(${RAGV[r.rag_effective]})`, marginLeft: 6 }} />}{r.status === 'Killed' && <span className="killtag">killed</span>}</div>
                    <div className="pcname">{r.name}</div>
                    <div className="pcfoot">
                      <span className="mono">{r.ra_rev > 0 ? rp(r.ra_rev) : r.pl_line === 'Enabler' ? 'enabler' : '—'}</span>
                      <span className="pcfoot-r">
                        {r.owner_name && r.owner_id && <Avatar name={r.owner_name} ownerId={r.owner_id} size={18} />}
                        {r.stage < 5
                          ? <button className="gate-mini" title="Advance stage-gate" onClick={(e: ReactMouseEvent) => { e.stopPropagation(); act(() => moveStage(r.id, 1)); }}>▸</button>
                          : <span>✓</span>}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {view === 'table' && (
        <div className="panel">
          <table>
            <thead><tr>
              {([['id', 'ID', 0], ['name', 'Initiative', 0], ['owner_name', 'Owner', 0], ['stage', 'Stage', 0], ['pl_line', 'P&L', 0], ['rag', 'RAG', 0],
                ['incr_rev', 'Gross / mo', 1], ['ra_rev', 'Risk-adj / mo', 1], ['ice', 'ICE', 1], ['quadrant', 'Quadrant', 0], ['stage', 'Gate', 1]] as const)
                .map(([k, l, n], i) => <th key={i} className={n ? 'num' : ''} onClick={() => { setSortKey(k as keyof ScoredRow); setSortDir((d: number) => sortKey === k ? -d : (k === 'name' || k === 'id' || k === 'pl_line') ? 1 : -1); }}>{l}</th>)}
            </tr></thead>
            <tbody>
              {[...rows].sort((a, b) => { const av = a[sortKey] as string | number | null, bv = b[sortKey] as string | number | null; return typeof av === 'string' ? sortDir * av.localeCompare(bv as string) : sortDir * (((av as number) || 0) - ((bv as number) || 0)); }).map(r => (
                <tr key={r.id} className={r.status === 'Killed' ? 'killed-row' : ''} onClick={() => setOpenId(r.id)}>
                  <td className="id mono">{r.id}</td>
                  <td className="name">{r.name}{r.status === 'Killed' && <span className="killtag">killed</span>}<div className="drv">{r.driver}</div></td>
                  <td>{r.owner_name && r.owner_id
                    ? <span className="ownercell"><Avatar name={r.owner_name} ownerId={r.owner_id} size={18} />{r.owner_name}</span>
                    : <span style={{ color: 'var(--ink-3)' }}>—</span>}</td>
                  <td>{stgChip(r)}</td>
                  <td className="pl">{r.pl_line}</td>
                  <td>{r.rag_effective ? <span className="rag" title={r.rag_override ? 'manual' : 'auto'} style={{ background: `var(${RAGV[r.rag_effective]})`, opacity: r.rag_override ? 1 : 0.75 }} /> : <span style={{ color: 'var(--ink-3)' }}>—</span>}</td>
                  <td className="num mono">{r.incr_rev > 0 ? rp(r.incr_rev) : '—'}</td>
                  <td className="num mono" style={{ fontWeight: 600, color: 'var(--accent-ink)' }}>{r.ra_rev > 0 ? rp(r.ra_rev) : '—'}</td>
                  <td className="num mono" style={{ fontWeight: 600 }}>{r.ice}</td>
                  <td>{chip(r.quadrant)}</td>
                  <td className="num">{r.stage < 5
                    ? <button className="gate" onClick={(e: ReactMouseEvent) => { e.stopPropagation(); act(() => moveStage(r.id, 1)); }}>Advance ▸</button>
                    : <button className="gate" disabled>Realized</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === 'board' && (
        <div className="board">
          {['Quick Win', 'Big Bet', 'Fill-in', 'Deprioritize', 'Enabler'].map(q => {
            const rs = rows.filter(r => r.quadrant === q).sort((a, b) => b.ice - a.ice);
            return (
              <div className="col" key={q}>
                <div className="col-h"><span className="ct" style={{ color: `var(--${QC[q]})` }}>{q}</span><span className="cn">{rs.length}</span></div>
                {rs.map(r => (
                  <div className="card" key={r.id} style={{ borderLeftColor: `var(--${QC[q]})` }} onClick={() => setOpenId(r.id)}>
                    <div className="cid mono">{r.id} · {r.stage_code}{r.owner_name && r.owner_id && <span style={{ float: 'right' }}><Avatar name={r.owner_name} ownerId={r.owner_id} size={16} /></span>}</div>
                    <div className="cname">{r.name}</div>
                    <div className="cfoot"><span className="mono">{r.incr_rev > 0 ? rp(r.incr_rev) : 'protective'}</span><span className="mono">ICE {r.ice}</span></div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {view === 'traj' && (
        <div className="traj">
          <div className="eyebrow" style={{ marginBottom: 4 }}>Value trajectory · next 6 months</div>
          <div className="lead" style={{ fontSize: 12, color: 'var(--ink-2)', marginBottom: 14 }}>
            Risk-adjusted run-rate as pipeline value phases in (ramp derived from stage + time-to-impact). Dashed = {rp(T)} target.
          </div>
          <Trajectory pts={traj} target={T} />
        </div>
      )}

      {/* ASSUMPTIONS MODAL */}
      {cfgOpen && (
        <ConfigModal
          config={config}
          onClose={() => setCfgOpen(false)}
          save={(patch) => act(() => updateConfig(patch))}
        />
      )}

      {/* DRAWER */}
      <div className={'scrim' + (open ? ' on' : '')} onClick={() => setOpenId(null)} />
      <div className={'drawer' + (open ? ' on' : '')}>
        {open && (
          <>
            <div className="dh">
              <div className="did mono">{open.id} · {open.bucket.split('·')[1]?.trim()} · {open.pl_line}{open.status === 'Killed' && <span className="killtag">killed</span>}</div>
              <h3>{open.name}</h3>
              <button className="x" onClick={() => setOpenId(null)}>✕</button>
              <button className="edit-link" onClick={() => setFormOpen({ mode: 'edit', row: open })}>Edit inputs</button>
            </div>
            <div className="db">
              <div className="desc">{open.description}</div>

              <p className="section-t">Owner</p>
              <div className="owner-set">
                {pics.map(p => (
                  <button key={p.id} className={'owner-btn' + (open.owner_id === p.id ? ' on' : '')}
                    onClick={() => act(() => setOwner(open.id, open.owner_id === p.id ? null : p.id))}>
                    <Avatar name={p.name} ownerId={p.id} size={18} />{p.name}{p.is_lead && <span className="leadtag">lead</span>}
                  </button>
                ))}
              </div>

              <div className="rail">
                {stages.map(st => {
                  const cls = st.n < open.stage ? 'done' : st.n === open.stage ? 'done cur' : '';
                  return <div className={'rnode ' + cls} key={st.n}><div className="rdot">{st.code.slice(1)}</div><div className="rlbl">{st.name}</div></div>;
                })}
              </div>
              <div className="gatebar">
                <button disabled={open.stage <= 1} onClick={() => act(() => moveStage(open.id, -1))}>◂ Regress</button>
                <button className="adv" disabled={open.stage >= 5} onClick={() => act(() => moveStage(open.id, 1))}>Advance gate ▸</button>
              </div>

              <p className="section-t">Delivery status (RAG)</p>
              <div className="rag-set">
                {(['Green', 'Amber', 'Red'] as const).map(g => (
                  <button key={g} className={'rag-btn' + (open.rag_effective === g ? ' on-' + g[0].toLowerCase() : '')}
                    onClick={() => act(() => setRag(open.id, open.rag === g ? null : g))}>{g}</button>
                ))}
              </div>
              <div className="rag-src">
                {open.rag_override
                  ? <>Manual override · <button className="linkbtn" onClick={() => act(() => setRag(open.id, null))}>use auto (milestones)</button></>
                  : open.rag_auto
                    ? <>Auto from milestones — set a value to override</>
                    : <>No milestones yet — add milestones or set a value manually</>}
              </div>

              {openMs.length > 0 && (
                <>
                  <p className="section-t">Milestones ({open.ms_done}/{open.ms_total})</p>
                  <div className="msbar"><i style={{ width: `${open.ms_total ? (open.ms_done / open.ms_total) * 100 : 0}%` }} /></div>
                  {openMs.map(m => {
                    const overdue = !m.done && m.due_date != null && m.due_date < today;
                    return (
                      <label className={'ms' + (m.done ? ' done' : '') + (overdue ? ' over' : '')} key={m.id}>
                        <input type="checkbox" checked={m.done} onChange={(e: ReactChangeEvent<HTMLInputElement>) => act(() => toggleMilestone(m.id, e.target.checked))} />
                        <span>{m.title}</span>
                        {m.due_date && <span className="due mono">{overdue ? 'overdue · ' : ''}{m.due_date}</span>}
                      </label>
                    );
                  })}
                  <div style={{ height: 16 }} />
                </>
              )}

              <div className="calc">
                <div className="ct2">Impact math</div>
                <div className="crow"><span className="cl">Base pool · {open.base_type}</span><span className="cv mono">{rp(open.base_rp)}</span></div>
                <div className="crow"><span className="cl">× Uplift</span><span className="cv mono">{Math.round(open.uplift * 100)}%</span></div>
                <div className="crow"><span className="cl">× Coverage</span><span className="cv mono">{Math.round(open.coverage * 100)}%</span></div>
                <div className="crow"><span className="cl">= Gross revenue / mo</span><span className="cv mono">{open.incr_rev > 0 ? rp(open.incr_rev) : '—'}</span></div>
                <div className="crow"><span className="cl">× Stage confidence ({open.stage_code})</span><span className="cv mono">{Math.round(open.stage_conf * 100)}%</span></div>
                <div className="crow eq"><span className="cl">Risk-adjusted value / mo</span><span className="cv mono">{open.ra_rev > 0 ? rp(open.ra_rev) : '—'}</span></div>
              </div>
              <div className="calc">
                <div className="ct2">Economics</div>
                <div className="crow"><span className="cl">Gross profit / mo</span><span className="cv mono">{open.incr_gp > 0 ? rp(open.incr_gp) : '—'}</span></div>
                <div className="crow"><span className="cl">Build cost · one-off</span><span className="cv mono">{rp(open.build_cost)}</span></div>
                <div className="crow"><span className="cl">Monthly running cost</span><span className="cv mono">{rp(open.monthly_cost)}</span></div>
                <div className="crow"><span className="cl">3-month net GP</span><span className="cv mono">{rp(open.net_3mo)}</span></div>
                <div className="crow"><span className="cl">Payback</span><span className="cv mono">{open.payback_mo ? open.payback_mo.toFixed(1) + ' months' : 'n/a'}</span></div>
              </div>

              <div className="danger">
                {open.status === 'Active'
                  ? <button className="kill-btn" onClick={() => act(() => setStatus(open.id, 'Killed'))}>Kill initiative</button>
                  : <button className="restore-btn" onClick={() => act(() => setStatus(open.id, 'Active'))}>Restore to register</button>}
                <p className="danger-note">
                  {open.status === 'Active'
                    ? 'Kills via status — the ID is kept (rule 3) and its value drops out of the coverage bridge. Reversible.'
                    : 'Killed — excluded from coverage. Restore to count it again.'}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {formOpen && (
        <InitiativeModal
          mode={formOpen.mode}
          row={formOpen.mode === 'edit' ? formOpen.row : null}
          buckets={buckets}
          pics={pics}
          stages={stages}
          onClose={() => setFormOpen(null)}
          save={(input) => act(async () => {
            if (formOpen.mode === 'new') { await createInitiative(input); }
            else { await updateInitiative(formOpen.row.id, input); }
          })}
        />
      )}
    </div>
  );
}

function ConfigModal({ config, onClose, save }:
  { config: Config; onClose: () => void; save: (patch: Record<string, number>) => void }) {
  const [f, setF] = useState({
    current_rev: config.current_rev / 1e6,
    target: config.target / 1e6,
    toko_lost: config.toko_lost / 1e6,
    margin: config.margin * 100,
    repeat_share: config.repeat_share * 100,
    dtc_share: config.dtc_share * 100,
    haircut: config.haircut * 100,
  });
  const set = (k: keyof typeof f) => (e: ReactChangeEvent<HTMLInputElement>) =>
    setF(s => ({ ...s, [k]: e.target.valueAsNumber }));
  const val = (n: number) => (Number.isNaN(n) ? '' : n);
  const submit = () => {
    save({
      current_rev: Math.round(f.current_rev * 1e6),
      target: Math.round(f.target * 1e6),
      toko_lost: Math.round(f.toko_lost * 1e6),
      margin: f.margin / 100,
      repeat_share: f.repeat_share / 100,
      dtc_share: f.dtc_share / 100,
      haircut: f.haircut / 100,
    });
    onClose();
  };
  const rpFields = [
    ['current_rev', 'Current run-rate', 'Rp M / mo'],
    ['target', 'Target', 'Rp M / mo'],
    ['toko_lost', 'Tokopedia lost pool', 'Rp M / mo'],
  ] as const;
  const pctFields = [
    ['margin', 'Gross margin', '%'],
    ['repeat_share', 'Repeat share', '%'],
    ['dtc_share', 'DTC share', '%'],
    ['haircut', 'Haircut', '%'],
  ] as const;
  return (
    <>
      <div className="scrim on" onClick={onClose} />
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-h">
          <div>
            <div className="eyebrow">Model assumptions</div>
            <h3>Re-price the whole portfolio</h3>
          </div>
          <button className="x" onClick={onClose}>✕</button>
        </div>
        <div className="modal-b">
          <p className="modal-note">
            Every initiative re-scores in <span className="mono">v_initiatives_scored</span> the moment you save — the app holds no formulas.
          </p>
          <div className="fgrid">
            {rpFields.map(([k, l, u]) => (
              <label className="field" key={k}>
                <span className="flbl">{l}</span>
                <div className="finput"><input type="number" className="mono" value={val(f[k])} onChange={set(k)} /><span className="funit">{u}</span></div>
              </label>
            ))}
            {pctFields.map(([k, l, u]) => (
              <label className="field" key={k}>
                <span className="flbl">{l}</span>
                <div className="finput"><input type="number" step="1" className="mono" value={val(f[k])} onChange={set(k)} /><span className="funit">{u}</span></div>
              </label>
            ))}
          </div>
        </div>
        <div className="modal-f">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-accent" onClick={submit}>Save &amp; re-price</button>
        </div>
      </div>
    </>
  );
}

const BASE_TYPES: [string, string][] = [
  ['REPEAT', 'Repeat revenue'], ['NEW', 'New-customer revenue'], ['TOTAL', 'Total revenue'],
  ['DTC', 'DTC revenue'], ['MKT', 'Marketplace revenue'], ['TOKO_LOST', 'Tokopedia lost pool'],
  ['DIRECT', 'Direct Rp (set manually)'],
];

function InitiativeModal({ mode, row, buckets, pics, stages, onClose, save }: {
  mode: 'new' | 'edit'; row: ScoredRow | null; buckets: string[]; pics: Pic[]; stages: Stage[];
  onClose: () => void; save: (input: Record<string, unknown>) => void;
}) {
  const [f, setF] = useState({
    bucket: row?.bucket ?? buckets[0] ?? '',
    name: row?.name ?? '',
    driver: row?.driver ?? '',
    description: row?.description ?? '',
    base_type: row?.base_type ?? 'REPEAT',
    direct_rp: (row?.direct_rp ?? 0) / 1e6,
    uplift: (row?.uplift ?? 0.1) * 100,
    coverage: (row?.coverage ?? 0.5) * 100,
    build_cost: (row?.build_cost ?? 0) / 1e6,
    monthly_cost: (row?.monthly_cost ?? 0) / 1e6,
    tti: row?.tti ?? 'M',
    conf: row?.conf ?? 3,
    ease: row?.ease ?? 3,
    stage: row?.stage ?? 1,
    pl_line: row?.pl_line ?? 'Revenue',
    recurring: row?.recurring ?? true,
    in_plan: row?.in_plan ?? false,
    owner_id: row?.owner_id ?? '',
  });
  const upd = (k: keyof typeof f, v: unknown) => setF(s => ({ ...s, [k]: v }));
  const num = (e: ReactChangeEvent<HTMLInputElement>) => e.target.valueAsNumber;
  const val = (n: number) => (Number.isNaN(n) ? '' : n);
  const isDirect = f.base_type === 'DIRECT';
  const valid = f.name.trim() !== '' && f.bucket.trim() !== '';

  const submit = () => {
    if (!valid) return;
    save({
      bucket: f.bucket, name: f.name.trim(),
      driver: f.driver.trim() || null, description: f.description.trim() || null,
      base_type: f.base_type,
      direct_rp: Math.round((f.direct_rp || 0) * 1e6),
      uplift: (f.uplift || 0) / 100, coverage: (f.coverage || 0) / 100,
      build_cost: Math.round((f.build_cost || 0) * 1e6),
      monthly_cost: Math.round((f.monthly_cost || 0) * 1e6),
      tti: f.tti || null, conf: f.conf, ease: f.ease, stage: f.stage,
      pl_line: f.pl_line, recurring: f.recurring, in_plan: f.in_plan,
      owner_id: f.owner_id || null,
    });
    onClose();
  };

  const nextId = mode === 'new' ? (f.bucket.trim().charAt(0).toUpperCase() + '…') : row?.id;

  return (
    <>
      <div className="scrim on" onClick={onClose} />
      <div className="modal wide" role="dialog" aria-modal="true">
        <div className="modal-h">
          <div>
            <div className="eyebrow">{mode === 'new' ? 'Add to register' : `Edit ${row?.id}`}</div>
            <h3>{mode === 'new' ? `New initiative · ${nextId}` : row?.name}</h3>
          </div>
          <button className="x" onClick={onClose}>✕</button>
        </div>
        <div className="modal-b">
          <p className="modal-note">
            Inputs only — every score (impact, ICE, quadrant, risk-adjusted value) is computed in
            <span className="mono"> v_initiatives_scored</span> the moment you save. ID is assigned automatically from the bucket (rule 3).
          </p>

          <div className="fsec">Identity</div>
          <div className="fgrid">
            <label className="field span2">
              <span className="flbl">Initiative name</span>
              <div className="finput"><input value={f.name} onChange={e => upd('name', e.target.value)} placeholder="e.g. Subscribe & save" /></div>
            </label>
            <label className="field">
              <span className="flbl">Bucket</span>
              <div className="finput"><select value={f.bucket} onChange={e => upd('bucket', e.target.value)}>
                {buckets.map(b => <option key={b} value={b}>{b}</option>)}
              </select></div>
            </label>
            <label className="field">
              <span className="flbl">Owner</span>
              <div className="finput"><select value={f.owner_id} onChange={e => upd('owner_id', e.target.value)}>
                <option value="">— unassigned —</option>
                {pics.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select></div>
            </label>
            <label className="field span2">
              <span className="flbl">Driver (one line)</span>
              <div className="finput"><input value={f.driver} onChange={e => upd('driver', e.target.value)} placeholder="e.g. Refill freq up / churn down" /></div>
            </label>
            <label className="field span2">
              <span className="flbl">Description</span>
              <textarea className="ftext" value={f.description} onChange={e => upd('description', e.target.value)} rows={3} />
            </label>
          </div>

          <div className="fsec">Value drivers</div>
          <div className="fgrid">
            <label className="field">
              <span className="flbl">Revenue base</span>
              <div className="finput"><select value={f.base_type} onChange={e => upd('base_type', e.target.value)}>
                {BASE_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select></div>
            </label>
            {isDirect ? (
              <label className="field">
                <span className="flbl">Direct base pool</span>
                <div className="finput"><input type="number" className="mono" value={val(f.direct_rp)} onChange={e => upd('direct_rp', num(e))} /><span className="funit">Rp M / mo</span></div>
              </label>
            ) : (
              <label className="field">
                <span className="flbl">Uplift on base</span>
                <div className="finput"><input type="number" className="mono" value={val(f.uplift)} onChange={e => upd('uplift', num(e))} /><span className="funit">%</span></div>
              </label>
            )}
            {!isDirect && (
              <label className="field">
                <span className="flbl">Coverage of base</span>
                <div className="finput"><input type="number" className="mono" value={val(f.coverage)} onChange={e => upd('coverage', num(e))} /><span className="funit">%</span></div>
              </label>
            )}
            {isDirect && (
              <>
                <label className="field">
                  <span className="flbl">Uplift factor</span>
                  <div className="finput"><input type="number" className="mono" value={val(f.uplift)} onChange={e => upd('uplift', num(e))} /><span className="funit">%</span></div>
                </label>
                <label className="field">
                  <span className="flbl">Coverage factor</span>
                  <div className="finput"><input type="number" className="mono" value={val(f.coverage)} onChange={e => upd('coverage', num(e))} /><span className="funit">%</span></div>
                </label>
              </>
            )}
            <label className="field">
              <span className="flbl">Build cost · one-off</span>
              <div className="finput"><input type="number" className="mono" value={val(f.build_cost)} onChange={e => upd('build_cost', num(e))} /><span className="funit">Rp M</span></div>
            </label>
            <label className="field">
              <span className="flbl">Monthly running cost</span>
              <div className="finput"><input type="number" className="mono" value={val(f.monthly_cost)} onChange={e => upd('monthly_cost', num(e))} /><span className="funit">Rp M / mo</span></div>
            </label>
            <label className="field">
              <span className="flbl">P&amp;L line</span>
              <div className="finput"><select value={f.pl_line} onChange={e => upd('pl_line', e.target.value)}>
                {['Revenue', 'Gross margin', 'Enabler'].map(v => <option key={v} value={v}>{v}</option>)}
              </select></div>
            </label>
          </div>

          <div className="fsec">Confidence &amp; lifecycle</div>
          <div className="fgrid">
            <label className="field">
              <span className="flbl">Confidence (1–5)</span>
              <div className="finput"><input type="number" min={1} max={5} className="mono" value={val(f.conf)} onChange={e => upd('conf', Math.max(1, Math.min(5, num(e))))} /></div>
            </label>
            <label className="field">
              <span className="flbl">Ease (1–5)</span>
              <div className="finput"><input type="number" min={1} max={5} className="mono" value={val(f.ease)} onChange={e => upd('ease', Math.max(1, Math.min(5, num(e))))} /></div>
            </label>
            <label className="field">
              <span className="flbl">Time-to-impact</span>
              <div className="finput"><select value={f.tti ?? ''} onChange={e => upd('tti', e.target.value)}>
                <option value="Q">Quick (≈1 mo)</option><option value="M">Medium (≈2 mo)</option><option value="S">Slow (≈4 mo)</option>
              </select></div>
            </label>
            <label className="field">
              <span className="flbl">Stage-gate</span>
              <div className="finput"><select value={f.stage} onChange={e => upd('stage', parseInt(e.target.value, 10))}>
                {stages.map(s => <option key={s.n} value={s.n}>{s.code} · {s.name}</option>)}
              </select></div>
            </label>
            <label className="field chk">
              <input type="checkbox" checked={f.recurring} onChange={e => upd('recurring', e.target.checked)} />
              <span className="flbl">Recurring value</span>
            </label>
            <label className="field chk">
              <input type="checkbox" checked={f.in_plan} onChange={e => upd('in_plan', e.target.checked)} />
              <span className="flbl">In selected plan</span>
            </label>
          </div>
        </div>
        <div className="modal-f">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-accent" disabled={!valid} onClick={submit}>
            {mode === 'new' ? 'Add & score' : 'Save changes'}
          </button>
        </div>
      </div>
    </>
  );
}

function Trajectory({ pts, target }: { pts: number[]; target: number }) {
  const W = 760, H = 260, pad = 40;
  const maxY = Math.max(target * 1.05, ...pts);
  const x = (i: number) => pad + (i / (pts.length - 1)) * (W - pad * 2);
  const y = (v: number) => H - pad - (v / maxY) * (H - pad * 2);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p)}`).join(' ');
  const area = `${line} L${x(pts.length - 1)},${H - pad} L${x(0)},${H - pad} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
        <g key={i}>
          <line x1={pad} x2={W - pad} y1={y(maxY * f)} y2={y(maxY * f)} stroke="var(--line-2)" />
          <text x={pad - 6} y={y(maxY * f) + 3} textAnchor="end" fontSize="9" fill="var(--ink-3)" fontFamily="JetBrains Mono">
            {(maxY * f / 1e6).toFixed(0)}M
          </text>
        </g>
      ))}
      <line x1={pad} x2={W - pad} y1={y(target)} y2={y(target)} stroke="var(--ink)" strokeDasharray="4 4" opacity="0.55" />
      <text x={W - pad} y={y(target) - 5} textAnchor="end" fontSize="9" fill="var(--ink)" fontFamily="JetBrains Mono">target</text>
      <path d={area} fill="var(--accent-soft)" />
      <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2.5" />
      {pts.map((p, i) => <circle key={i} cx={x(i)} cy={y(p)} r="3" fill="var(--accent)" />)}
      {pts.map((_, i) => <text key={i} x={x(i)} y={H - pad + 15} textAnchor="middle" fontSize="9" fill="var(--ink-3)" fontFamily="JetBrains Mono">M{i}</text>)}
    </svg>
  );
}
