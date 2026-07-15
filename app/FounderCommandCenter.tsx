'use client';

import { useEffect, useMemo, useState } from 'react';
import { actionClass, formatRp, initiatives, ragClass, stageOrder, type Initiative } from './founder-data';

export default function FounderCommandCenter() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = initiatives.find((item) => item.id === selectedId) ?? null;

  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === 'Escape' && setSelectedId(null);
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, []);

  const metrics = useMemo(() => {
    const target = 500;
    const current = 210;
    const committed = initiatives.filter((i) => i.stage.startsWith('L4') || i.stage.startsWith('L5')).reduce((s, i) => s + i.grossValue, 0);
    const planned = initiatives.filter((i) => i.stage.startsWith('L3')).reduce((s, i) => s + i.grossValue, 0);
    const pipeline = initiatives.filter((i) => i.stage.startsWith('L1') || i.stage.startsWith('L2')).reduce((s, i) => s + i.grossValue, 0);
    const riskAdjustedIncrement = initiatives.reduce((s, i) => s + i.riskAdjustedValue, 0);
    const gap = target - current;
    const projected = current + riskAdjustedIncrement;
    return {
      target, current, committed, planned, pipeline, projected,
      coverage: Math.round((riskAdjustedIncrement / gap) * 100),
      remaining: Math.max(0, target - projected),
      fullPotential: current + committed + planned + pipeline,
    };
  }, []);

  const posture = useMemo(() => (['Quick Win', 'Big Bet', 'Enabler'] as const).map((name) => {
    const rows = initiatives.filter((i) => i.posture === name);
    return {
      name,
      count: rows.length,
      gross: rows.reduce((s, i) => s + i.grossValue, 0),
      riskAdjusted: rows.reduce((s, i) => s + i.riskAdjustedValue, 0),
    };
  }), []);

  const blockers = initiatives.filter((i) => i.rag !== 'Green').slice(0, 4);

  return (
    <main className="fcc-shell">
      <section className="fcc-hero">
        <div className="fcc-hero-topline">
          <div className="fcc-brand-lockup">
            <span className="fcc-brand-mark">B</span>
            <div><div className="fcc-brand-name">BARAWELL</div><div className="fcc-brand-sub">Founder Command Center</div></div>
          </div>
          <div className="fcc-hero-meta"><span className="fcc-live-dot" />Weekly decision snapshot · 15 Jul 2026</div>
        </div>

        <div className="fcc-command-copy">
          <div>
            <p className="fcc-kicker">THIS WEEK&apos;S COMMAND</p>
            <h1>Scale the proven engine. Unblock measurement. Protect the revenue base.</h1>
          </div>
          <div className="fcc-command-pill"><span>Founder attention</span><strong>3 decisions</strong><small>2 can be delegated</small></div>
        </div>

        <div className="fcc-metric-grid">
          <MetricTile label="Projected run-rate" value={formatRp(metrics.projected)} note="risk-adjusted portfolio" emphasis />
          <MetricTile label="Committed value / mo" value={formatRp(metrics.committed)} note="L4–L5 initiatives" />
          <MetricTile label="Coverage of gap" value={`${metrics.coverage}%`} note={`${formatRp(metrics.target - metrics.current)} gap to target`} />
          <MetricTile label="Risk-adjusted gap remaining" value={formatRp(metrics.remaining)} note={`to ${formatRp(metrics.target)} target`} warning />
        </div>
      </section>

      <section className="fcc-card fcc-bridge-card">
        <SectionHead kicker="TARGET CONTROL" title="Path to Rp 500M / month" right={<div className="fcc-bridge-summary"><span>Full upside</span><strong className="fcc-mono">{formatRp(metrics.fullPotential)}</strong></div>} />
        <div className="fcc-bridge-label-row"><span>Current run-rate</span><span>Committed</span><span>Planned</span><span>Pipeline</span><span>Target</span></div>
        <div className="fcc-bridge-wrap">
          <div className="fcc-bridge-segments">
            <div className="fcc-segment fcc-current" style={{ width: `${(metrics.current / metrics.target) * 100}%` }} />
            <div className="fcc-segment fcc-committed" style={{ width: `${(metrics.committed / metrics.target) * 100}%` }} />
            <div className="fcc-segment fcc-planned" style={{ width: `${(metrics.planned / metrics.target) * 100}%` }} />
            <div className="fcc-segment fcc-pipeline" style={{ width: `${(metrics.pipeline / metrics.target) * 100}%` }} />
          </div>
          <div className="fcc-projected-marker" style={{ left: `${(metrics.projected / metrics.target) * 100}%` }}><span>Risk-adjusted</span><strong className="fcc-mono">{formatRp(metrics.projected)}</strong></div>
          <div className="fcc-target-marker"><span>Target</span></div>
        </div>
        <div className="fcc-bridge-values fcc-mono"><span>{formatRp(metrics.current)}</span><span>+{formatRp(metrics.committed)}</span><span>+{formatRp(metrics.planned)}</span><span>+{formatRp(metrics.pipeline)}</span><span>{formatRp(metrics.target)}</span></div>
        <div className="fcc-bridge-foot">
          <span><i className="fcc-legend-dot fcc-current-dot" />Base</span><span><i className="fcc-legend-dot fcc-committed-dot" />Committed value</span><span><i className="fcc-legend-dot fcc-planned-dot" />Planned value</span><span><i className="fcc-legend-dot fcc-pipeline-dot" />Unweighted pipeline</span>
          <strong>Founder read: enough gross upside exists; confidence and execution are the constraint.</strong>
        </div>
      </section>

      <div className="fcc-main-grid">
        <section className="fcc-card fcc-command-card">
          <SectionHead kicker="COMMAND QUEUE" title="Top 5 founder actions" right={<span className="fcc-inline-note">Ordered by risk-adjusted value and urgency</span>} />
          <div className="fcc-command-table">
            <div className="fcc-command-header"><span>#</span><span>Initiative</span><span>Founder action</span><span>Risk-adj.</span><span>Stage</span><span>RAG</span><span>Next checkpoint</span></div>
            {initiatives.slice(0, 5).map((item, index) => (
              <button key={item.id} className="fcc-command-row" onClick={() => setSelectedId(item.id)}>
                <span className="fcc-rank">0{index + 1}</span>
                <span className="fcc-initiative-cell"><strong>{item.name}</strong><small>{item.owner} · {item.posture}</small></span>
                <span><ActionBadge action={item.action} /></span>
                <strong className="fcc-mono fcc-value-cell">{formatRp(item.riskAdjustedValue)}</strong>
                <span className="fcc-stage-badge">{item.stage}</span>
                <span><RagBadge rag={item.rag} /></span>
                <span className="fcc-checkpoint-cell">{item.checkpoint}<small>{item.due}</small></span>
              </button>
            ))}
          </div>
        </section>

        <aside className="fcc-side-stack">
          <section className="fcc-card fcc-posture-card">
            <SectionHead kicker="PORTFOLIO POSTURE" title="Where the value sits" compact />
            <div className="fcc-posture-list">
              {posture.map((item) => (
                <div className="fcc-posture-row" key={item.name}>
                  <div className={`fcc-posture-icon ${item.name.toLowerCase().replace(' ', '-')}`}>{item.name === 'Quick Win' ? '↗' : item.name === 'Big Bet' ? '◆' : '∞'}</div>
                  <div className="fcc-posture-copy"><strong>{item.name}</strong><span>{item.count} initiatives · {formatRp(item.riskAdjusted)} risk-adjusted</span></div>
                  <strong className="fcc-mono">{formatRp(item.gross)}</strong>
                </div>
              ))}
            </div>
            <div className="fcc-posture-bar">{posture.map((item) => <span key={item.name} className={`fcc-posture-segment ${item.name.toLowerCase().replace(' ', '-')}`} style={{ width: `${(item.gross / 292) * 100}%` }} />)}</div>
          </section>

          <section className="fcc-card fcc-blocker-card">
            <SectionHead kicker="BLOCKERS" title="Red, amber, and stalled" compact right={<span className="fcc-alert-count">{blockers.length}</span>} />
            <div className="fcc-blocker-list">
              {blockers.map((item) => (
                <button key={item.id} className="fcc-blocker-row" onClick={() => setSelectedId(item.id)}>
                  <span className={`fcc-risk-stripe ${ragClass(item.rag)}`} />
                  <span className="fcc-blocker-copy"><strong>{item.name}</strong><small>{item.blocker}</small></span>
                  <span className="fcc-stalled">{item.daysStalled ? <><strong>{item.daysStalled}d</strong><small>stalled</small></> : <RagBadge rag={item.rag} />}</span>
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <section className="fcc-card fcc-checkpoints-card">
        <SectionHead kicker="NEXT CHECKPOINTS" title="Upcoming milestones" compact right={<span className="fcc-inline-note">Next 10 days</span>} />
        <div className="fcc-timeline">
          {initiatives.slice(0, 6).map((item, index) => (
            <button key={item.id} className="fcc-timeline-item" onClick={() => setSelectedId(item.id)}>
              <span className={`fcc-timeline-node ${index === 0 ? 'active' : ''}`} /><span className="fcc-timeline-date">{item.due}</span><strong>{item.checkpoint}</strong><small>{item.name}</small>
            </button>
          ))}
        </div>
      </section>

      <div className={`fcc-scrim ${selected ? 'open' : ''}`} onClick={() => setSelectedId(null)} />
      <aside className={`fcc-drawer ${selected ? 'open' : ''}`} aria-hidden={!selected}>{selected && <InitiativeDrawer item={selected} onClose={() => setSelectedId(null)} />}</aside>
    </main>
  );
}

function InitiativeDrawer({ item, onClose }: { item: Initiative; onClose: () => void }) {
  const activeIndex = stageOrder.indexOf(item.stage);
  return <>
    <div className="fcc-drawer-head"><div><span className="fcc-drawer-id">{item.id} · {item.owner}</span><h2>{item.name}</h2></div><button className="fcc-close" onClick={onClose} aria-label="Close detail drawer">×</button></div>
    <div className="fcc-drawer-body">
      <div className="fcc-drawer-badges"><ActionBadge action={item.action} /><span className="fcc-stage-badge">{item.stage}</span><RagBadge rag={item.rag} /></div>
      <div className="fcc-decision-box"><span>FOUNDER DECISION</span><strong>{item.decision}</strong></div>
      <div className="fcc-detail-metrics">
        <div><span>Gross value / mo</span><strong className="fcc-mono">{formatRp(item.grossValue)}</strong></div><div><span>Risk-adjusted / mo</span><strong className="fcc-mono">{formatRp(item.riskAdjustedValue)}</strong></div><div><span>Portfolio posture</span><strong>{item.posture}</strong></div><div><span>Next checkpoint</span><strong>{item.due}</strong></div>
      </div>
      <DetailSection title="EXECUTION PROGRESS">
        <div className="fcc-progress-head"><strong>{item.progress}% complete</strong><span>{item.stage}</span></div><div className="fcc-progress-track"><span style={{ width: `${item.progress}%` }} /></div><div className="fcc-stage-rail">{stageOrder.map((stage, index) => <span key={stage} className={index <= activeIndex ? 'done' : ''}>{stage.split(' ')[0]}</span>)}</div>
      </DetailSection>
      <DetailSection title="WHY THIS ACTION"><p>{item.rationale}</p></DetailSection>
      <DetailSection title="CURRENT BLOCKER"><div className={`fcc-blocker-detail ${ragClass(item.rag)}`}><span className={`fcc-rag-dot ${ragClass(item.rag)}`} /><p>{item.blocker}</p></div></DetailSection>
      <DetailSection title="NEXT CHECKPOINT"><div className="fcc-next-box"><div><strong>{item.checkpoint}</strong><span>{item.due}</span></div><small>Owner: {item.owner}</small></div></DetailSection>
    </div>
    <div className="fcc-drawer-footer"><button className="fcc-secondary-button" onClick={onClose}>Close</button><button className="fcc-primary-button">Confirm: {item.action}</button></div>
  </>;
}

function SectionHead({ kicker, title, right, compact }: { kicker: string; title: string; right?: React.ReactNode; compact?: boolean }) {
  return <div className={`fcc-section-head ${compact ? 'compact' : ''}`}><div><span className="fcc-section-kicker">{kicker}</span><h2>{title}</h2></div>{right}</div>;
}
function DetailSection({ title, children }: { title: string; children: React.ReactNode }) { return <div className="fcc-detail-section"><span className="fcc-section-kicker">{title}</span>{children}</div>; }
function MetricTile({ label, value, note, emphasis, warning }: { label: string; value: string; note: string; emphasis?: boolean; warning?: boolean }) { return <div className={`fcc-metric-tile ${emphasis ? 'emphasis' : ''} ${warning ? 'warning' : ''}`}><span>{label}</span><strong className="fcc-mono">{value}</strong><small>{note}</small></div>; }
function RagBadge({ rag }: { rag: Initiative['rag'] }) { return <span className={`fcc-rag-badge ${ragClass(rag)}`}><i />{rag}</span>; }
function ActionBadge({ action }: { action: Initiative['action'] }) { return <span className={`fcc-action-badge ${actionClass(action)}`}>{action}</span>; }
