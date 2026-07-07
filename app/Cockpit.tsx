'use client';

import { useState, useTransition, useMemo } from 'react';
import type { ChangeEvent as ReactChangeEvent, DragEvent as ReactDragEvent } from 'react';
import type { ScoredRow, Coverage, Config, Stage, Milestone, Pic, Snapshot } from './types';
import { setStage, setRag, toggleMilestone, addMilestone, deleteMilestone, updateConfig, createInitiative, updateInitiative, setOwner, setStatus } from './actions';

const rp = (v: number) => {
  const a = Math.abs(v); let s: string;
  if (a >= 1e9) s = (v / 1e9).toFixed(a >= 1e10 ? 0 : 1) + 'B';
  else if (a >= 1e6) s = (v / 1e6).toFixed(a >= 1e8 ? 0 : 1) + 'M';
  else if (a >= 1e3) s = (v / 1e3).toFixed(0) + 'k';
  else s = Math.round(v).toString();
  return 'Rp ' + s;
};
const STCOLOR = (n: number) => `--s${n}`;
const RAGV: Record<string, string> = { Green: '--rag-g', Amber: '--rag-a', Red: '--rag-r' };
const STALE_DAYS = 14;

// The only lifecycle vocabulary in the UI. The SQL engine still weights value
// by the underlying stage confidence; the UI never surfaces L-codes.
type StateName = 'Idea' | 'Execute' | 'Done';
const stateOf = (stage: number): StateName => (stage <= 2 ? 'Idea' : stage === 5 ? 'Done' : 'Execute');
const STATE_STAGE: Record<StateName, number> = { Idea: 2, Execute: 4, Done: 5 }; // canonical stage per state
const STATE_COLOR: Record<StateName, string> = { Idea: '--s2', Execute: '--s4', Done: '--s5' };

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

export default function Cockpit({ rows: allRows, coverage, config, stages, milestones, pics, snapshots }:
  { rows: ScoredRow[]; coverage: Coverage; config: Config; stages: Stage[]; milestones: Milestone[]; pics: Pic[]; snapshots: Snapshot[]; }) {

  const [view, setView] = useState<'board' | 'list'>('board');
  const [sortKey, setSortKey] = useState<keyof ScoredRow>('ra_rev');
  const [sortDir, setSortDir] = useState(-1);
  const [openId, setOpenId] = useState<string | null>(null);
  const [cfgOpen, setCfgOpen] = useState(false);
  const [formOpen, setFormOpen] = useState<null | { mode: 'new' } | { mode: 'edit'; row: ScoredRow }>(null);
  const [showKilled, setShowKilled] = useState(false);
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [ownerFilter, setOwnerFilter] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const today = new Date().toISOString().slice(0, 10);
  const daysSince = (iso: string) => Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);

  // ---- adherence signals (display-layer only; scoring stays in SQL) ----
  const overdueIds = useMemo(() => {
    const s = new Set<string>();
    milestones.forEach(m => { if (!m.done && m.due_date && m.due_date < today) s.add(m.initiative_id); });
    return s;
  }, [milestones, today]);
  const isStale = (r: ScoredRow) => r.status === 'Active' && r.stage < 5 && daysSince(r.updated_at) >= STALE_DAYS;
  const needsAttention = (r: ScoredRow) =>
    r.status === 'Active' && r.stage < 5 &&
    (r.rag_effective === 'Red' || r.rag_effective === 'Amber' || overdueIds.has(r.id) || isStale(r));

  const killedCount = allRows.filter(r => r.status === 'Killed').length;
  const attentionCount = allRows.filter(needsAttention).length;
  const rows = allRows
    .filter(r => (showKilled ? true : r.status !== 'Killed'))
    .filter(r => (attentionOnly ? needsAttention(r) : true))
    .filter(r => (ownerFilter ? r.owner_id === ownerFilter : true));
  const buckets = useMemo(() => Array.from(new Set(allRows.map(r => r.bucket))).sort(), [allRows]);

  const open = allRows.find(r => r.id === openId) || null;
  const openMs = milestones.filter(m => m.initiative_id === openId);

  const T = coverage.target, cur = coverage.current_rev, gap = coverage.gap;
  const seg = (v: number) => `${Math.max(0, (v / T) * 100)}%`;
  const pipeCapped = Math.min(coverage.pipeline, Math.max(0, T - cur - coverage.committed - coverage.planned));

  // Δ vs last week's snapshot (this week's row is index 0 — page refreshes it on load).
  const prevSnap = snapshots.length > 1 ? snapshots[1] : null;
  const delta = prevSnap && prevSnap.coverage_pct != null ? coverage.coverage_pct - Number(prevSnap.coverage_pct) : null;

  const act = (fn: () => Promise<void>) => start(() => { fn(); });

  // ---- drag & drop: cards carry their id; lanes accept a drop ----
  const dragProps = (r: ScoredRow) => ({
    draggable: true,
    onDragStart: (e: ReactDragEvent) => { setDragId(r.id); e.dataTransfer.setData('text/plain', r.id); e.dataTransfer.effectAllowed = 'move'; },
    onDragEnd: () => { setDragId(null); setDropTarget(null); },
  });
  const dropProps = (key: string, toStage: number) => ({
    onDragOver: (e: ReactDragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDropTarget(key); },
    onDragLeave: () => setDropTarget(t => (t === key ? null : t)),
    onDrop: (e: ReactDragEvent) => {
      e.preventDefault();
      const id = e.dataTransfer.getData('text/plain') || dragId;
      setDragId(null); setDropTarget(null);
      if (!id) return;
      const row = allRows.find(x => x.id === id);
      if (row && row.stage !== toStage) act(() => setStage(id, toStage));
    },
  });

  // 3-layer execution board mapped onto the stage-gates (no second state):
  // Idea = L1–L2 · Execute = L3–L4 · Done = L5. Dropping into a lane moves
  // the gate to the lane's canonical stage.
  const LANES = [
    { key: 'idea', title: 'Idea', hint: 'backlog · not yet started', match: (s: number) => stateOf(s) === 'Idea', toStage: STATE_STAGE.Idea, color: STATE_COLOR.Idea },
    { key: 'execute', title: 'Execute', hint: 'in progress', match: (s: number) => stateOf(s) === 'Execute', toStage: STATE_STAGE.Execute, color: STATE_COLOR.Execute },
    { key: 'done', title: 'Done', hint: 'realized · value landing', match: (s: number) => stateOf(s) === 'Done', toStage: STATE_STAGE.Done, color: STATE_COLOR.Done },
  ] as const;

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
          <div className="cov mono">
            {coverage.coverage_pct}%<small>of gap covered</small>
            {delta != null && (
              <span className={'delta mono ' + (delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat')}>
                {delta > 0 ? '▲' : delta < 0 ? '▼' : '—'} {Math.abs(delta)} pt vs last wk
              </span>
            )}
          </div>
        </div>
        <div className="bridge">
          <div className="seg base" style={{ width: seg(cur) }} />
          <div className="seg commit" style={{ width: seg(coverage.committed + coverage.planned) }} />
          <div className="seg pipe" style={{ width: seg(pipeCapped) }} />
          <div className="g-target" />
        </div>
        <div className="g-labels mono"><span>Current <b>{rp(cur)}</b></span><span>Target {rp(T)}</span></div>
        <div className="g-legend">
          <span><i className="sw" style={{ background: '#1E2530' }} />Current run-rate</span>
          <span><i className="sw" style={{ background: 'var(--s5)' }} />Executing + Done</span>
          <span><i className="sw" style={{ background: '#C3CEDA' }} />Ideas</span>
          <span><i className="sw" style={{ background: 'var(--line)' }} />Gap remaining</span>
        </div>
      </div>

      <div className="tiles">
        <div className="tile accent"><div className="eyebrow">Projected run-rate · risk-adj</div><div className="k mono">{rp(coverage.projected)}</div><div className="d">current + confidence-weighted pipeline</div></div>
        <div className="tile"><div className="eyebrow">Executing value / mo</div><div className="k mono">{rp(coverage.committed + coverage.planned)}</div><div className="d">confidence-weighted · Execute + Done</div></div>
        <div className="tile"><div className="eyebrow">Coverage of gap</div><div className="k mono">{coverage.coverage_pct}%</div><div className="d">ideas only: {rp(coverage.pipeline)}</div></div>
        <div className="tile"><div className="eyebrow">Gap remaining · risk-adj</div><div className="k mono">{rp(Math.max(0, gap - coverage.total_ra))}</div><div className="d">to {rp(T)} target</div></div>
      </div>

      {/* FILTER BAR */}
      <div className="tabs">
        <div className="filterset">
          <div className="tabset">
            {([['board', 'Board'], ['list', 'Full list']] as const).map(([v, l]) =>
              <button key={v} className={'tab' + (view === v ? ' on' : '')} onClick={() => setView(v)}>{l}</button>)}
          </div>
          <button className={'filter-chip attn' + (attentionOnly ? ' on' : '')} onClick={() => setAttentionOnly(a => !a)}>
            <span className="fc-dot" />Needs attention <b className="mono">{attentionCount}</b>
          </button>
          {pics.map(p => (
            <button key={p.id} className={'filter-chip' + (ownerFilter === p.id ? ' on' : '')}
              onClick={() => setOwnerFilter(o => (o === p.id ? null : p.id))}>
              <Avatar name={p.name} ownerId={p.id} size={16} />{p.name}
            </button>
          ))}
        </div>
        <div className="meta">
          {rows.filter(r => r.status !== 'Killed').length} shown
          {killedCount > 0 && <button className="killtoggle" onClick={() => setShowKilled(s => !s)}>{showKilled ? 'hide' : 'show'} {killedCount} killed</button>}
        </div>
      </div>

      {/* EXECUTION BOARD */}
      {view === 'board' && (
      <div className="exec-board">
        {LANES.map(lane => {
          const rs = rows.filter(r => lane.match(r.stage)).sort((a, b) => b.ra_rev - a.ra_rev);
          const sum = rs.reduce((s, r) => s + r.ra_rev, 0);
          return (
            <div className={'lane' + (dropTarget === 'lane-' + lane.key ? ' dropon' : '')} key={lane.key} {...dropProps('lane-' + lane.key, lane.toStage)}>
              <div className="lane-h">
                <span className="lane-t" style={{ color: `var(${lane.color})` }}>{lane.title}</span>
                <span className="lane-n">{rs.length}</span>
              </div>
              <div className="lane-hint">{lane.hint}</div>
              <div className="lane-sum mono" style={{ color: `var(${lane.color})` }}>{rp(sum)}/mo risk-adj</div>
              {rs.map(r => {
                const nextMs = milestones.filter(m => m.initiative_id === r.id && !m.done && m.due_date).sort((a, b) => (a.due_date! < b.due_date! ? -1 : 1))[0];
                const stale = isStale(r);
                return (
                  <div className={'pcard' + (r.status === 'Killed' ? ' killed' : '') + (dragId === r.id ? ' dragging' : '')} key={r.id}
                    style={{ borderTopColor: `var(${STCOLOR(r.stage)})` }} onClick={() => setOpenId(r.id)} {...dragProps(r)}>
                    <div className="pcid mono">
                      {r.id}
                      {r.rag_effective && <span className="rag" style={{ background: `var(${RAGV[r.rag_effective]})`, marginLeft: 6 }} />}
                      {stale && <span className="staletag" title={`No update in ${daysSince(r.updated_at)} days`}>stale {daysSince(r.updated_at)}d</span>}
                      {r.status === 'Killed' && <span className="killtag">killed</span>}
                    </div>
                    <div className="pcname">{r.name}</div>
                    {nextMs && (
                      <div className={'pcnext mono' + (nextMs.due_date! < today ? ' over' : '')}>
                        {nextMs.due_date! < today ? 'OVERDUE · ' : 'next · '}{nextMs.title.length > 34 ? nextMs.title.slice(0, 34) + '…' : nextMs.title} · {nextMs.due_date}
                      </div>
                    )}
                    <div className="pcfoot">
                      <span className="mono">{r.ra_rev > 0 ? rp(r.ra_rev) : r.pl_line === 'Enabler' ? 'enabler' : '—'}</span>
                      <span className="pcfoot-r">
                        {r.ms_total > 0 && <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{r.ms_done}/{r.ms_total}</span>}
                        {r.owner_name && r.owner_id && <Avatar name={r.owner_name} ownerId={r.owner_id} size={18} />}
                      </span>
                    </div>
                  </div>
                );
              })}
              {rs.length === 0 && <div className="lane-empty">drop here</div>}
            </div>
          );
        })}
      </div>
      )}

      {/* FULL LIST */}
      {view === 'list' && (
        <div className="panel">
          <table>
            <thead><tr>
              {([['id', 'ID', 0], ['name', 'Initiative', 0], ['owner_name', 'Owner', 0], ['stage', 'State', 0], ['pl_line', 'P&L', 0], ['rag', 'RAG', 0],
                ['incr_rev', 'Gross / mo', 1], ['ra_rev', 'Risk-adj / mo', 1], ['ice', 'ICE', 1], ['updated_at', 'Updated', 1]] as const)
                .map(([k, l, n], i) => <th key={i} className={n ? 'num' : ''} onClick={() => { setSortKey(k as keyof ScoredRow); setSortDir((d: number) => sortKey === k ? -d : (k === 'name' || k === 'id' || k === 'pl_line' || k === 'owner_name') ? 1 : -1); }}>{l}</th>)}
            </tr></thead>
            <tbody>
              {[...rows].sort((a, b) => { const av = a[sortKey] as string | number | null, bv = b[sortKey] as string | number | null; return typeof av === 'string' ? sortDir * av.localeCompare((bv as string) ?? '') : sortDir * (((av as number) || 0) - ((bv as number) || 0)); }).map(r => {
                const st = stateOf(r.stage);
                return (
                  <tr key={r.id} className={r.status === 'Killed' ? 'killed-row' : ''} onClick={() => setOpenId(r.id)}>
                    <td className="id mono">{r.id}</td>
                    <td className="name">{r.name}{isStale(r) && <span className="staletag">stale {daysSince(r.updated_at)}d</span>}{r.status === 'Killed' && <span className="killtag">killed</span>}<div className="drv">{r.driver}</div></td>
                    <td>{r.owner_name && r.owner_id
                      ? <span className="ownercell"><Avatar name={r.owner_name} ownerId={r.owner_id} size={18} />{r.owner_name}</span>
                      : <span style={{ color: 'var(--ink-3)' }}>—</span>}</td>
                    <td><span className="stg" style={{ background: `var(${STATE_COLOR[st]}s)`, color: `var(${STATE_COLOR[st]})` }}>{st}</span></td>
                    <td className="pl">{r.pl_line}</td>
                    <td>{r.rag_effective ? <span className="rag" title={r.rag_override ? 'manual' : 'auto'} style={{ background: `var(${RAGV[r.rag_effective]})`, opacity: r.rag_override ? 1 : 0.75 }} /> : <span style={{ color: 'var(--ink-3)' }}>—</span>}</td>
                    <td className="num mono">{r.incr_rev > 0 ? rp(r.incr_rev) : '—'}</td>
                    <td className="num mono" style={{ fontWeight: 600, color: 'var(--accent-ink)' }}>{r.ra_rev > 0 ? rp(r.ra_rev) : '—'}</td>
                    <td className="num mono" style={{ fontWeight: 600 }}>{r.ice}</td>
                    <td className="num mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{r.updated_at.slice(0, 10)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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

              <p className="section-t">State</p>
              <div className="state-set">
                {(['Idea', 'Execute', 'Done'] as StateName[]).map(s => (
                  <button key={s}
                    className={'state-btn' + (stateOf(open.stage) === s ? ' on' : '')}
                    style={stateOf(open.stage) === s ? { borderColor: `var(${STATE_COLOR[s]})`, background: `var(${STATE_COLOR[s]}s)`, color: `var(${STATE_COLOR[s]})` } : undefined}
                    onClick={() => { if (stateOf(open.stage) !== s) act(() => setStage(open.id, STATE_STAGE[s])); }}>
                    {s}
                  </button>
                ))}
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
                    : <>No milestones yet — add one below so RAG derives automatically</>}
              </div>

              <p className="section-t">Milestones ({open.ms_done}/{open.ms_total})</p>
              {open.ms_total > 0 && <div className="msbar"><i style={{ width: `${open.ms_total ? (open.ms_done / open.ms_total) * 100 : 0}%` }} /></div>}
              {openMs.map(m => {
                const overdue = !m.done && m.due_date != null && m.due_date < today;
                return (
                  <label className={'ms' + (m.done ? ' done' : '') + (overdue ? ' over' : '')} key={m.id}>
                    <input type="checkbox" checked={m.done} onChange={(e: ReactChangeEvent<HTMLInputElement>) => act(() => toggleMilestone(m.id, e.target.checked))} />
                    <span>{m.title}</span>
                    {m.due_date && <span className="due mono">{overdue ? 'overdue · ' : ''}{m.due_date}</span>}
                    <button className="ms-del" title="Delete milestone" onClick={(e) => { e.preventDefault(); act(() => deleteMilestone(m.id)); }}>✕</button>
                  </label>
                );
              })}
              <MilestoneAdd onAdd={(title, due) => act(() => addMilestone(open.id, title, due))} />

              <div className="calc">
                <div className="ct2">Impact math</div>
                <div className="crow"><span className="cl">Base pool · {open.base_type}</span><span className="cv mono">{rp(open.base_rp)}</span></div>
                <div className="crow"><span className="cl">× Uplift</span><span className="cv mono">{Math.round(open.uplift * 100)}%</span></div>
                <div className="crow"><span className="cl">× Coverage</span><span className="cv mono">{Math.round(open.coverage * 100)}%</span></div>
                <div className="crow"><span className="cl">= Gross revenue / mo</span><span className="cv mono">{open.incr_rev > 0 ? rp(open.incr_rev) : '—'}</span></div>
                <div className="crow"><span className="cl">× Confidence ({stateOf(open.stage)})</span><span className="cv mono">{Math.round(open.stage_conf * 100)}%</span></div>
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

function MilestoneAdd({ onAdd }: { onAdd: (title: string, due: string | null) => void }) {
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');
  const submit = () => {
    if (!title.trim()) return;
    onAdd(title, due || null);
    setTitle(''); setDue('');
  };
  return (
    <div className="ms-add">
      <input className="ms-add-t" placeholder="New milestone…" value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit(); }} />
      <input className="ms-add-d mono" type="date" value={due} onChange={e => setDue(e.target.value)} />
      <button className="ms-add-b" disabled={!title.trim()} onClick={submit}>Add</button>
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

function InitiativeModal({ mode, row, buckets, pics, onClose, save }: {
  mode: 'new' | 'edit'; row: ScoredRow | null; buckets: string[]; pics: Pic[];
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
              <span className="flbl">State</span>
              <div className="finput"><select value={STATE_STAGE[stateOf(f.stage)]} onChange={e => upd('stage', parseInt(e.target.value, 10))}>
                {(['Idea', 'Execute', 'Done'] as StateName[]).map(s => <option key={s} value={STATE_STAGE[s]}>{s}</option>)}
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
