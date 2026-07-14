'use client';

import { useMemo, useState, useTransition } from 'react';
import type { ChangeEvent } from 'react';
import {
  createExperiment,
  logCrmActivity,
  materializeAssignments,
  refreshGrowthInsights,
  type ActionResult,
} from './actions';
import type {
  ChannelDriver,
  CrmWorkspaceRow,
  GrowthData,
  Numeric,
  ProductDriver,
  SegmentMatrix,
} from './types';
import styles from './growth.module.css';

type Tab = 'pulse' | 'performance' | 'diagnose' | 'customers' | 'actions' | 'experiments';

const num = (value: Numeric | undefined) => Number(value ?? 0);
const rp = (value: Numeric | undefined) => `Rp ${Math.round(num(value)).toLocaleString('id-ID')}`;
const compactRp = (value: Numeric | undefined) => {
  const amount = num(value);
  if (Math.abs(amount) >= 1e9) return `Rp ${(amount / 1e9).toFixed(2)}B`;
  if (Math.abs(amount) >= 1e6) return `Rp ${(amount / 1e6).toFixed(1)}M`;
  if (Math.abs(amount) >= 1e3) return `Rp ${(amount / 1e3).toFixed(0)}k`;
  return rp(amount);
};
const pct = (value: Numeric | undefined, digits = 1) => `${(num(value) * 100).toFixed(digits)}%`;
const month = (value: string) => new Intl.DateTimeFormat('en', { month: 'short', year: '2-digit' }).format(new Date(`${value}T00:00:00`));
const signed = (value: Numeric | undefined, formatter: (n: number) => string) => {
  const n = num(value);
  return `${n > 0 ? '+' : ''}${formatter(n)}`;
};
const titleCase = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, char => char.toUpperCase());

const PLAY_LABELS: Record<string, string> = {
  refill_due: 'Refill due',
  new_customer_conversion: 'First-to-second order',
  winback_value: 'High-value winback',
  cross_sell: 'Cross-sell',
  aov_expand: 'AOV expansion',
  channel_migrate: 'Channel migration',
  service_recovery: 'Service recovery',
};

const OUTCOMES = [
  ['no_response', 'No response'],
  ['responded', 'Responded'],
  ['interested', 'Interested'],
  ['needs_consultation', 'Needs consultation'],
  ['follow_up_scheduled', 'Follow-up scheduled'],
  ['ordered', 'Ordered'],
  ['not_interested', 'Not interested'],
  ['wrong_timing', 'Wrong timing'],
  ['price_concern', 'Price concern'],
  ['product_concern', 'Product concern'],
  ['delivery_concern', 'Delivery concern'],
  ['do_not_contact', 'Do not contact'],
] as const;

const messageFor = (row: CrmWorkspaceRow) => {
  const name = row.customer_name.startsWith('Customer ') ? 'Bapak' : `Pak ${row.customer_name.split(/\s+/)[0]}`;
  const base = `Hi ${name}, tim Barawell ingin mengecek apakah ada pertanyaan atau kebutuhan lanjutan yang dapat kami bantu melalui proses yang nyaman dan privat.`;
  if (row.play_code === 'channel_migrate') return `${base} Kami juga dapat membantu melalui kanal resmi Barawell agar konsultasi dan tindak lanjut lebih mudah.`;
  if (row.play_code === 'cross_sell') return `${base} Kami memiliki materi edukasi mengenai pilihan pendamping yang dapat dijelaskan tanpa kewajiban pembelian.`;
  if (row.play_code === 'winback_value') return `${base} Kami ingin memahami apakah ada kendala pengalaman, layanan, atau waktu yang membuat kebutuhan Bapak tertunda.`;
  return base;
};

function StatusNotice({ result }: { result: ActionResult | null }) {
  if (!result) return null;
  return <div className={`${styles.notice} ${result.ok ? styles.noticeGood : styles.noticeBad}`}>{result.message}</div>;
}

export default function GrowthOS({ data, showCustomerNames }: { data: GrowthData; showCustomerNames: boolean }) {
  const [tab, setTab] = useState<Tab>('pulse');
  const plays = useMemo(() => Array.from(new Set(data.workspace.map(row => row.play_code))), [data.workspace]);
  const [activePlay, setActivePlay] = useState(plays[0] ?? 'refill_due');
  const actionRows = useMemo(() => data.workspace.filter(row => row.play_code === activePlay), [data.workspace, activePlay]);
  const [selectedKey, setSelectedKey] = useState(actionRows[0]?.customer_key ?? '');
  const selected = actionRows.find(row => row.customer_key === selectedKey) ?? actionRows[0] ?? null;
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();
  const [matrixSelection, setMatrixSelection] = useState<SegmentMatrix | null>(null);

  const completeMonthly = data.monthly.filter(row => row.is_complete);
  const maxRevenue = Math.max(1, ...data.monthly.map(row => num(row.revenue)));
  const latestSegmentMonth = data.segments.at(-1)?.snapshot_month;
  const currentSegments = data.segments.filter(row => row.snapshot_month === latestSegmentMonth);
  const latestMovementMonth = data.movements.at(-1)?.snapshot_month;
  const currentMovements = data.movements
    .filter(row => row.snapshot_month === latestMovementMonth)
    .sort((a, b) => b.customers - a.customers);
  const latestChannelMonth = completeMonthly.at(-1)?.metric_month;
  const latestChannels = data.channels
    .filter(row => row.metric_month === latestChannelMonth)
    .sort((a, b) => b.orders - a.orders);
  const latestProducts = data.products
    .filter(row => row.metric_month === latestChannelMonth)
    .sort((a, b) => b.orders - a.orders);
  const maxRefill = Math.max(1, ...data.refill.map(row => row.customers));

  const run = (task: () => Promise<ActionResult>) => {
    setResult(null);
    startTransition(() => { void task().then(setResult); });
  };

  const openPlay = (play: string) => {
    if (plays.includes(play)) {
      setActivePlay(play);
      const row = data.workspace.find(item => item.play_code === play);
      setSelectedKey(row?.customer_key ?? '');
      setTab('actions');
    }
  };

  const exportQueue = () => {
    const headers = ['rank', 'customer', 'city', 'tier', 'lifecycle', 'recency_days', 'orders', 'lifetime_revenue', 'aov', 'priority_score', 'expected_incremental_value', 'reason'];
    const rows = actionRows.map(row => [
      row.rank, row.customer_name, row.city ?? '', row.value_tier, row.lifecycle,
      row.recency_days, row.order_count, num(row.lifetime_revenue), num(row.aov),
      num(row.priority_score), num(row.expected_incremental_value), row.reason,
    ]);
    const csv = [headers, ...rows]
      .map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `barawell_${activePlay}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div>
          <div className="eyebrow">Barawell · Growth operating system</div>
          <h1>Measure, diagnose, act, and learn in one loop</h1>
          <p>Historical truth, automatic insight ranking, CRM execution, experiment holdouts, and directional propensity scoring.</p>
        </div>
        <div className={styles.headerMeta}>
          <span><b>Data as of</b>{data.summary?.asof ?? '—'}</span>
          <span><b>Customer view</b>{showCustomerNames ? 'Internal names enabled' : 'Names masked'}</span>
          <span><b>Model</b>Heuristic v1 · calibrate with outcomes</span>
        </div>
      </header>

      {data.warnings.length > 0 && (
        <div className={`${styles.notice} ${styles.noticeBad}`}>
          Some datasets could not be loaded: {data.warnings.join(' · ')}
        </div>
      )}

      <nav className={styles.tabs} aria-label="Growth OS sections">
        {([
          ['pulse', 'Pulse'], ['performance', 'Performance'], ['diagnose', 'Diagnose'],
          ['customers', 'Customers'], ['actions', 'Actions'], ['experiments', 'Experiments'],
        ] as [Tab, string][]).map(([key, label]) => (
          <button key={key} className={tab === key ? styles.tabOn : ''} onClick={() => setTab(key)}>{label}</button>
        ))}
      </nav>

      <StatusNotice result={result} />

      {tab === 'pulse' && (
        <section className={styles.stack}>
          <div className={styles.scoreGrid}>
            <article className={styles.metric}><span>Latest complete revenue</span><strong className="mono">{compactRp(data.scorecard?.revenue)}</strong><small>{signed(data.scorecard?.revenue_change_pct, n => `${(n * 100).toFixed(1)}%`)} vs prior month</small></article>
            <article className={styles.metric}><span>Repeat rate</span><strong className="mono">{pct(data.summary ? num(data.summary.repeat_rate) / 100 : data.scorecard?.repeat_rate)}</strong><small>Target {pct(data.scorecard?.repeat_rate_target)}</small></article>
            <article className={styles.metric}><span>Repeat revenue share</span><strong className="mono">{pct(data.summary ? num(data.summary.repeater_rev_pct) / 100 : data.scorecard?.repeat_revenue_share)}</strong><small>{data.summary?.repeaters.toLocaleString('id-ID') ?? 0} repeat customers</small></article>
            <article className={styles.metric}><span>One-and-done</span><strong className="mono">{data.summary?.one_and_done.toLocaleString('id-ID') ?? '—'}</strong><small>Largest addressable retention pool</small></article>
            <article className={styles.metric}><span>Dormant customers</span><strong className="mono">{data.summary?.dormant_ct.toLocaleString('id-ID') ?? '—'}</strong><small>Core and Whale first</small></article>
            <article className={styles.metric}><span>Baralast attach</span><strong className="mono">{`${num(data.summary?.bara_attach_pct).toFixed(1)}%`}</strong><small>Cross-sell headroom remains material</small></article>
          </div>

          <div className={styles.sectionHead}>
            <div><h2>The highest-impact changes appear before the charts</h2><p>Facts are calculated in SQL, ranked by confidence × impact × actionability × urgency.</p></div>
            <button className={styles.primary} disabled={pending} onClick={() => run(refreshGrowthInsights)}>{pending ? 'Refreshing…' : 'Refresh insights'}</button>
          </div>
          <div className={styles.insightGrid}>
            {data.insights.map(insight => (
              <article className={styles.insight} key={insight.id}>
                <div className={styles.insightTop}><span>{titleCase(insight.insight_type)}</span><b className="mono">P{num(insight.priority_score).toFixed(0)}</b></div>
                <h3>{insight.headline}</h3>
                <p>{insight.narrative}</p>
                <div className={styles.insightFacts}>
                  {insight.delta_pct !== null && <span><b className="mono">{signed(insight.delta_pct, n => `${(n * 100).toFixed(1)}%`)}</b> change</span>}
                  {insight.affected_customers !== null && <span><b className="mono">{insight.affected_customers.toLocaleString('id-ID')}</b> customers</span>}
                  <span><b className="mono">{pct(insight.confidence, 0)}</b> confidence</span>
                </div>
                {insight.recommended_play && <button className={styles.linkButton} onClick={() => openPlay(insight.recommended_play!)}>Open {PLAY_LABELS[insight.recommended_play] ?? titleCase(insight.recommended_play)} queue →</button>}
              </article>
            ))}
          </div>
        </section>
      )}

      {tab === 'performance' && (
        <section className={styles.stack}>
          <div className={styles.twoCol}>
            <article className={styles.panel}>
              <div className={styles.sectionHead}><div><h2>Growth quality is visible in new versus repeat revenue</h2><p>Partial months are hatched and excluded from the complete-month scorecard.</p></div></div>
              <div className={styles.revenueChart}>
                {data.monthly.map(row => (
                  <div className={styles.monthGroup} key={row.metric_month} title={`${month(row.metric_month)} · ${rp(row.revenue)}`}>
                    <div className={`${styles.revBar} ${!row.is_complete ? styles.partial : ''}`} style={{ height: `${Math.max(2, num(row.new_revenue) / maxRevenue * 100)}%` }} />
                    <div className={`${styles.repeatBar} ${!row.is_complete ? styles.partial : ''}`} style={{ height: `${Math.max(2, num(row.repeat_revenue) / maxRevenue * 100)}%` }} />
                    <span>{month(row.metric_month)}</span>
                  </div>
                ))}
              </div>
              <div className={styles.legend}><span><i className={styles.newSwatch} />New revenue</span><span><i className={styles.repeatSwatch} />Repeat revenue</span></div>
            </article>
            <article className={styles.panel}>
              <div className={styles.sectionHead}><div><h2>Targets expose where growth is not yet healthy</h2><p>Current complete-month performance against operating thresholds.</p></div></div>
              <div className={styles.goalList}>
                <Goal label="Monthly revenue" actual={num(data.scorecard?.revenue)} target={num(data.scorecard?.revenue_target)} value={compactRp(data.scorecard?.revenue)} />
                <Goal label="Repeat rate" actual={num(data.scorecard?.repeat_rate)} target={num(data.scorecard?.repeat_rate_target)} value={pct(data.scorecard?.repeat_rate)} />
                <Goal label="Owned order share" actual={num(data.scorecard?.owned_order_share)} target={0.55} value={pct(data.scorecard?.owned_order_share)} />
                <Goal label="Repeat revenue share" actual={num(data.scorecard?.repeat_revenue_share)} target={0.40} value={pct(data.scorecard?.repeat_revenue_share)} />
              </div>
            </article>
          </div>

          <article className={styles.panel}>
            <div className={styles.sectionHead}><div><h2>Cohorts reveal whether newly acquired customers are improving</h2><p>Recent cohorts are immature; their 45- and 90-day results should not be compared mechanically with older cohorts.</p></div></div>
            <div className={styles.tableWrap}><table><thead><tr><th>Cohort</th><th className="num">Customers</th><th className="num">Repeat 45d</th><th className="num">Repeat 90d</th><th className="num">90d revenue/customer</th><th>Status</th></tr></thead><tbody>
              {data.cohorts.map(row => {
                const ageDays = (new Date(data.summary?.asof ?? Date.now()).getTime() - new Date(row.cohort_month).getTime()) / 86400000;
                return <tr key={row.cohort_month}><td>{month(row.cohort_month)}</td><td className="mono num">{row.customers.toLocaleString('id-ID')}</td><td className="mono num">{pct(row.repeat_45_rate)}</td><td className="mono num">{pct(row.repeat_90_rate)}</td><td className="mono num">{rp(row.revenue_90_per_customer)}</td><td><span className={styles.badge}>{ageDays >= 120 ? 'Mature' : ageDays >= 75 ? '90d forming' : 'Early'}</span></td></tr>;
              })}
            </tbody></table></div>
          </article>

          <div className={styles.twoCol}>
            <TrendTable title="Channel history" rows={latestChannels.map(row => ({ label: titleCase(row.channel), value: row.orders, sub: `${pct(row.order_share)} of orders · ${compactRp(row.revenue)}` }))} />
            <TrendTable title="Product history" rows={latestProducts.map(row => ({ label: titleCase(row.product), value: row.orders, sub: `${row.customers.toLocaleString('id-ID')} customers · ${compactRp(row.revenue)}` }))} />
          </div>
        </section>
      )}

      {tab === 'diagnose' && (
        <section className={styles.stack}>
          <div className={styles.twoCol}>
            <DriverPanel title="Channel drivers explain the latest complete-month change" labelKey="channel" rows={data.channelDrivers} />
            <DriverPanel title="Product drivers show which portfolio shifts matter" labelKey="product" rows={data.productDrivers} />
          </div>
          <article className={styles.panel}>
            <div className={styles.sectionHead}><div><h2>Expected ranges distinguish signal from routine volatility</h2><p>Revenue bands use the prior six periods and exclude the current month from its own expectation.</p></div></div>
            <div className={styles.tableWrap}><table><thead><tr><th>Month</th><th className="num">Revenue</th><th className="num">Expected</th><th className="num">Low</th><th className="num">High</th><th>Status</th></tr></thead><tbody>
              {data.anomalies.slice(-8).map(row => <tr key={row.metric_month}><td>{month(row.metric_month)}</td><td className="mono num">{compactRp(row.revenue)}</td><td className="mono num">{row.expected_revenue === null ? '—' : compactRp(row.expected_revenue)}</td><td className="mono num">{row.expected_low === null ? '—' : compactRp(row.expected_low)}</td><td className="mono num">{row.expected_high === null ? '—' : compactRp(row.expected_high)}</td><td><span className={`${styles.badge} ${row.is_anomaly ? styles.badgeRed : ''}`}>{row.is_anomaly ? 'Outside range' : row.is_complete ? 'Within range' : 'Partial month'}</span></td></tr>)}
            </tbody></table></div>
          </article>
          <article className={styles.panel}>
            <div className={styles.sectionHead}><div><h2>Customer movement makes retention leakage explicit</h2><p>{latestMovementMonth ? month(latestMovementMonth) : 'Latest'} transitions, ranked by customer count.</p></div></div>
            <div className={styles.movementGrid}>
              {currentMovements.slice(0, 16).map((row, index) => <div className={styles.movement} key={`${row.from_value_tier}-${row.from_lifecycle}-${row.to_value_tier}-${row.to_lifecycle}-${index}`}><div><b>{row.from_value_tier} · {row.from_lifecycle}</b><span>→</span><b>{row.to_value_tier} · {row.to_lifecycle}</b></div><strong className="mono">{row.customers.toLocaleString('id-ID')}</strong><small>{compactRp(row.revenue)} historical value</small></div>)}
            </div>
          </article>
        </section>
      )}

      {tab === 'customers' && (
        <section className={styles.stack}>
          <article className={styles.panel}>
            <div className={styles.sectionHead}><div><h2>Value × Lifecycle separates scale from economic priority</h2><p>Click a cell to inspect its customer count, spend, AOV, and average recency.</p></div></div>
            <div className={styles.matrix}>
              <div />{['New', 'Active-repeat', 'At-risk', 'Dormant'].map(life => <b key={life}>{life}</b>)}
              {['Whale', 'Core', 'Entry'].flatMap(tier => [
                <b key={`${tier}-label`}>{tier}</b>,
                ...['New', 'Active-repeat', 'At-risk', 'Dormant'].map(life => {
                  const row = data.matrix.find(cell => cell.value_tier === tier && cell.lifecycle === life);
                  return <button key={`${tier}-${life}`} className={styles.matrixCell} onClick={() => setMatrixSelection(row ?? null)}><strong className="mono">{row?.customers.toLocaleString('id-ID') ?? '0'}</strong><span>{compactRp(row?.spend)}</span></button>;
                }),
              ])}
            </div>
            {matrixSelection && <div className={styles.detail}><b>{matrixSelection.value_tier} · {matrixSelection.lifecycle}</b><span className="mono">{matrixSelection.customers.toLocaleString('id-ID')} customers</span><span className="mono">{rp(matrixSelection.spend)} lifetime spend</span><span className="mono">{rp(matrixSelection.avg_aov)} AOV</span><span className="mono">{num(matrixSelection.avg_recency).toFixed(0)} average recency days</span></div>}
          </article>
          <div className={styles.twoCol}>
            <article className={styles.panel}><div className={styles.sectionHead}><div><h2>The second order is the core retention leak</h2><p>Progression from acquisition to established repeat behavior.</p></div></div><div className={styles.funnel}>{data.funnel && [
              ['Acquired', data.funnel.acquired], ['2+ orders', data.funnel.ordered_2plus], ['3+ orders', data.funnel.ordered_3plus], ['5+ orders', data.funnel.ordered_5plus],
            ].map(([label, value], index) => <div key={String(label)} style={{ width: `${100 - index * 18}%` }}><b>{label}</b><span className="mono">{Number(value).toLocaleString('id-ID')} · {pct(Number(value) / data.funnel!.acquired)}</span></div>)}</div></article>
            <article className={styles.panel}><div className={styles.sectionHead}><div><h2>The observed refill distribution guides timing</h2><p>Use the empirical window as a fallback until customer-level intervals are available.</p></div></div><div className={styles.histogram}>{data.refill.map(row => <div key={row.bin} style={{ height: `${Math.max(4, row.customers / maxRefill * 100)}%` }} title={`${row.bin}: ${row.customers}`}><span className="mono">{row.customers}</span><small>{row.bin}</small></div>)}</div></article>
          </div>
          <article className={styles.panel}><div className={styles.sectionHead}><div><h2>Segment history shows whether the customer base is getting healthier</h2><p>Latest monthly snapshot from the deterministic lifecycle model.</p></div></div><div className={styles.segmentCards}>{currentSegments.map(row => <div key={`${row.value_tier}-${row.lifecycle}`}><span>{row.value_tier} · {row.lifecycle}</span><strong className="mono">{row.customers.toLocaleString('id-ID')}</strong><small>{pct(row.customer_share)} of customers · {compactRp(row.revenue)}</small></div>)}</div></article>
        </section>
      )}

      {tab === 'actions' && (
        <section className={styles.stack}>
          <div className={styles.actionHeader}>
            <div className={styles.playTabs}>{plays.map(play => <button key={play} className={play === activePlay ? styles.playOn : ''} onClick={() => { setActivePlay(play); setSelectedKey(data.workspace.find(row => row.play_code === play)?.customer_key ?? ''); }}>{PLAY_LABELS[play] ?? titleCase(play)}</button>)}</div>
            <div className={styles.actionButtons}><button onClick={exportQueue}>Export CSV</button><button className={styles.primary} disabled={pending} onClick={() => run(() => materializeAssignments({ playCode: activePlay, limit: 20 }))}>Create top 20 tasks</button></div>
          </div>
          <div className={styles.workspace}>
            <aside className={styles.queueList}>{actionRows.map(row => <button key={row.customer_key} className={selected?.customer_key === row.customer_key ? styles.queueOn : ''} onClick={() => setSelectedKey(row.customer_key)}><span><b>{row.rank}. {row.customer_name}</b><small>{row.city || 'City not recorded'}</small></span><strong className="mono">{num(row.priority_score).toFixed(0)}</strong></button>)}</aside>
            <article className={styles.customerPanel}>
              {selected ? <CustomerWorkspace key={selected.customer_key} row={selected} pending={pending} run={run} showCustomerNames={showCustomerNames} /> : <div className={styles.empty}>No customer is available for this queue.</div>}
            </article>
          </div>
          <article className={styles.panel}>
            <div className={styles.sectionHead}><div><h2>Execution quality is measured by play, not only total revenue</h2><p>Outcome metrics remain zero until sales activities and conversions are recorded.</p></div></div>
            <div className={styles.tableWrap}><table><thead><tr><th>Play</th><th className="num">Assignments</th><th className="num">Contacts</th><th className="num">Responses</th><th className="num">Conversions</th><th className="num">Attributed revenue</th><th className="num">Contact → order</th></tr></thead><tbody>{data.effectiveness.map(row => <tr key={row.play_code}><td>{row.name}</td><td className="mono num">{row.assignments}</td><td className="mono num">{row.contacts}</td><td className="mono num">{row.responses}</td><td className="mono num">{row.conversions}</td><td className="mono num">{rp(row.attributed_revenue)}</td><td className="mono num">{row.contact_to_order_rate === null ? '—' : pct(row.contact_to_order_rate)}</td></tr>)}</tbody></table></div>
          </article>
        </section>
      )}

      {tab === 'experiments' && (
        <section className={styles.stack}>
          <div className={styles.twoCol}>
            <ExperimentForm plays={plays} pending={pending} run={run} />
            <article className={styles.panel}><div className={styles.sectionHead}><div><h2>Incrementality, not attribution, determines scale</h2><p>Deterministic hashing assigns treatment and holdout arms. Compare conversion rates before expanding a play.</p></div></div><ol className={styles.principles}><li>Targeting creates eligibility, not proof.</li><li>Only treatment customers receive assignments.</li><li>Holdouts estimate what would have happened anyway.</li><li>Scale on incremental gross profit, not attributed revenue alone.</li></ol></article>
          </div>
          <article className={styles.panel}>
            <div className={styles.sectionHead}><div><h2>Experiment readouts keep causal evidence visible</h2><p>Rows appear after an experiment is created; treatment and holdout arms remain separate.</p></div></div>
            <div className={styles.tableWrap}><table><thead><tr><th>Experiment</th><th>Play</th><th>Arm</th><th className="num">Members</th><th className="num">Conversions</th><th className="num">Conversion rate</th><th className="num">Revenue</th><th>Status</th></tr></thead><tbody>{data.experiments.map((row, index) => <tr key={`${row.experiment_id}-${row.arm}-${index}`}><td><b>{row.code}</b><small className={styles.block}>{row.hypothesis}</small></td><td>{PLAY_LABELS[row.play_code] ?? titleCase(row.play_code)}</td><td>{row.arm ?? 'Not seeded'}</td><td className="mono num">{row.members}</td><td className="mono num">{row.conversions}</td><td className="mono num">{row.conversion_rate === null ? '—' : pct(row.conversion_rate)}</td><td className="mono num">{rp(row.revenue)}</td><td><span className={styles.badge}>{row.status}</span></td></tr>)}</tbody></table>{data.experiments.length === 0 && <div className={styles.empty}>No experiments have been created yet.</div>}</div>
          </article>
        </section>
      )}
    </main>
  );
}

function Goal({ label, actual, target, value }: { label: string; actual: number; target: number; value: string }) {
  const progress = target > 0 ? Math.max(0, Math.min(1, actual / target)) : 0;
  return <div className={styles.goal}><div><b>{label}</b><span className="mono">{value}</span></div><div><i style={{ width: `${progress * 100}%` }} /></div><small className="mono">{(progress * 100).toFixed(0)}% of target</small></div>;
}

function TrendTable({ title, rows }: { title: string; rows: { label: string; value: number; sub: string }[] }) {
  const max = Math.max(1, ...rows.map(row => row.value));
  return <article className={styles.panel}><div className={styles.sectionHead}><div><h2>{title}</h2><p>Latest complete month.</p></div></div><div className={styles.rankList}>{rows.map(row => <div key={row.label}><span><b>{row.label}</b><small>{row.sub}</small></span><div><i style={{ width: `${row.value / max * 100}%` }} /></div><strong className="mono">{row.value.toLocaleString('id-ID')}</strong></div>)}</div></article>;
}

function DriverPanel({ title, labelKey, rows }: { title: string; labelKey: 'channel' | 'product'; rows: Array<ChannelDriver | ProductDriver> }) {
  const sorted = [...rows].sort((a, b) => num(b.revenue_change) - num(a.revenue_change));
  return <article className={styles.panel}><div className={styles.sectionHead}><div><h2>{title}</h2><p>Latest complete month versus the previous complete month.</p></div></div><div className={styles.driverList}>{sorted.map((row, index) => {
    const change = num(row.revenue_change);
    return <div key={`${labelKey === 'channel' && 'channel' in row ? row.channel : 'product' in row ? row.product : ''}-${index}`}><span><b>{titleCase(labelKey === 'channel' && 'channel' in row ? row.channel : 'product' in row ? row.product : '')}</b><small>{Number(row.order_change ?? 0) > 0 ? '+' : ''}{String(row.order_change)} orders</small></span><strong className={`mono ${change >= 0 ? styles.up : styles.down}`}>{signed(change, compactRp)}</strong></div>;
  })}</div></article>;
}

function CustomerWorkspace({ row, pending, run, showCustomerNames }: {
  row: CrmWorkspaceRow;
  pending: boolean;
  run: (task: () => Promise<ActionResult>) => void;
  showCustomerNames: boolean;
}) {
  const [outcome, setOutcome] = useState('responded');
  const [agent, setAgent] = useState(row.assigned_to ?? '');
  const [notes, setNotes] = useState('');
  const [followUp, setFollowUp] = useState('');
  const message = messageFor(row);

  return <>
    <div className={styles.customerHead}><div><div className={styles.customerName}>{row.customer_name}</div><div className={styles.badges}><span>{row.value_tier}</span><span>{row.lifecycle}</span><span>{PLAY_LABELS[row.play_code] ?? titleCase(row.play_code)}</span>{row.assignment_status && <span>{row.assignment_status}</span>}</div></div><div className={styles.priority}><span>Priority</span><b className="mono">{num(row.priority_score).toFixed(0)}</b></div></div>
    {!showCustomerNames && <div className={styles.privacy}>Names are masked. Set <code>BARAWELL_SHOW_CUSTOMER_NAMES=true</code> only behind internal access protection.</div>}
    <div className={styles.customerStats}><div><span>City</span><b>{row.city || '—'}</b></div><div><span>Recency</span><b className="mono">{row.recency_days}d</b></div><div><span>Orders</span><b className="mono">{row.order_count}</b></div><div><span>Lifetime value</span><b className="mono">{rp(row.lifetime_revenue)}</b></div><div><span>AOV</span><b className="mono">{rp(row.aov)}</b></div><div><span>Expected incremental GP</span><b className="mono">{rp(row.expected_incremental_value)}</b></div></div>
    <div className={styles.reason}><b>Why now</b><p>{row.reason}</p><div><span>Action probability <strong className="mono">{pct(row.action_propensity)}</strong></span><span>Reorder <strong className="mono">{pct(row.reorder_propensity)}</strong></span><span>Churn risk <strong className="mono">{pct(row.churn_risk)}</strong></span></div></div>
    <label className={styles.field}><span>Approved-template draft</span><textarea value={message} readOnly /></label>
    <div className={styles.formGrid}><label className={styles.field}><span>Agent</span><input value={agent} onChange={(event: ChangeEvent<HTMLInputElement>) => setAgent(event.target.value)} placeholder="Owner name" /></label><label className={styles.field}><span>Outcome</span><select value={outcome} onChange={(event: ChangeEvent<HTMLSelectElement>) => setOutcome(event.target.value)}>{OUTCOMES.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label className={styles.field}><span>Next follow-up</span><input type="datetime-local" value={followUp} onChange={(event: ChangeEvent<HTMLInputElement>) => setFollowUp(event.target.value)} /></label><label className={`${styles.field} ${styles.wide}`}><span>Notes</span><textarea value={notes} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setNotes(event.target.value)} placeholder="Record customer response or operating issue. Do not record unnecessary medical detail." /></label></div>
    <div className={styles.customerActions}><button onClick={() => void navigator.clipboard.writeText(message)}>Copy message</button><button className={styles.primary} disabled={pending} onClick={() => run(() => logCrmActivity({ assignmentId: row.assignment_id, customerKey: row.customer_key, agent, activityType: 'message', channel: 'whatsapp', outcome, notes, nextFollowUpAt: followUp ? new Date(followUp).toISOString() : undefined }))}>{pending ? 'Saving…' : 'Save outcome'}</button></div>
  </>;
}

function ExperimentForm({ plays, pending, run }: { plays: string[]; pending: boolean; run: (task: () => Promise<ActionResult>) => void }) {
  const [code, setCode] = useState('');
  const [play, setPlay] = useState(plays[0] ?? 'refill_due');
  const [hypothesis, setHypothesis] = useState('A targeted treatment will increase seven-day conversion relative to an untreated holdout.');
  const [share, setShare] = useState(0.9);
  const [sample, setSample] = useState(80);
  const [owner, setOwner] = useState('');
  return <article className={styles.panel}><div className={styles.sectionHead}><div><h2>Create a treatment-versus-holdout test</h2><p>Only treatment members become CRM assignments.</p></div></div><div className={styles.formGrid}><label className={styles.field}><span>Experiment code</span><input value={code} onChange={(event: ChangeEvent<HTMLInputElement>) => setCode(event.target.value)} placeholder="refill-jul-01" /></label><label className={styles.field}><span>Sales play</span><select value={play} onChange={(event: ChangeEvent<HTMLSelectElement>) => setPlay(event.target.value)}>{plays.map(item => <option key={item} value={item}>{PLAY_LABELS[item] ?? titleCase(item)}</option>)}</select></label><label className={`${styles.field} ${styles.wide}`}><span>Hypothesis</span><textarea value={hypothesis} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setHypothesis(event.target.value)} /></label><label className={styles.field}><span>Treatment share</span><input type="number" min="0.5" max="0.95" step="0.05" value={share} onChange={(event: ChangeEvent<HTMLInputElement>) => setShare(Number(event.target.value))} /></label><label className={styles.field}><span>Eligible sample</span><input type="number" min="10" max="80" value={sample} onChange={(event: ChangeEvent<HTMLInputElement>) => setSample(Number(event.target.value))} /></label><label className={styles.field}><span>Owner</span><input value={owner} onChange={(event: ChangeEvent<HTMLInputElement>) => setOwner(event.target.value)} placeholder="Rizki" /></label></div><button className={styles.primary} disabled={pending} onClick={() => run(() => createExperiment({ code, playCode: play, hypothesis, treatmentShare: share, sampleSize: sample, owner }))}>{pending ? 'Creating…' : 'Start experiment'}</button></article>;
}
