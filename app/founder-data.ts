export type Initiative = {
  id: string;
  name: string;
  action: 'Scale' | 'Unblock' | 'Delegate' | 'Park' | 'Protect';
  stage: 'L1 Idea' | 'L2 Business case' | 'L3 Planned' | 'L4 In-flight' | 'L5 Realized';
  rag: 'Green' | 'Amber' | 'Red';
  owner: string;
  grossValue: number;
  riskAdjustedValue: number;
  posture: 'Quick Win' | 'Big Bet' | 'Enabler';
  checkpoint: string;
  due: string;
  blocker: string;
  decision: string;
  rationale: string;
  progress: number;
  daysStalled?: number;
};

export const initiatives: Initiative[] = [
  {
    id: 'BW-01', name: 'Lifecycle flows', action: 'Scale', stage: 'L4 In-flight', rag: 'Green', owner: 'Growth',
    grossValue: 82, riskAdjustedValue: 74, posture: 'Big Bet', checkpoint: 'Campaign QA + cohort sign-off', due: '16 Jul', progress: 78,
    blocker: 'No critical blocker. Creative throughput is the limiting constraint.',
    decision: 'Approve two additional lifecycle journeys and protect CRM capacity for the next 14 days.',
    rationale: 'Highest risk-adjusted value in the portfolio with clean measurement and a repeatable operating motion.',
  },
  {
    id: 'BW-02', name: 'Reorder reminders', action: 'Unblock', stage: 'L3 Planned', rag: 'Amber', owner: 'Product',
    grossValue: 54, riskAdjustedValue: 38, posture: 'Quick Win', checkpoint: 'Pilot go / no-go', due: '18 Jul', progress: 56, daysStalled: 4,
    blocker: 'Inventory-sync API reliability has not been validated against out-of-stock edge cases.',
    decision: 'Assign one engineering owner and force a 48-hour API validation sprint.',
    rationale: 'Small implementation surface, strong repeat-purchase logic, and measurable value inside one sprint.',
  },
  {
    id: 'BW-03', name: 'Tokopedia root-cause fix', action: 'Protect', stage: 'L4 In-flight', rag: 'Amber', owner: 'Marketplace',
    grossValue: 40, riskAdjustedValue: 34, posture: 'Quick Win', checkpoint: 'Root-cause readout', due: '17 Jul', progress: 68, daysStalled: 2,
    blocker: 'Category-level traffic-loss data is still incomplete.',
    decision: 'Keep this in the top three and prevent capacity from being diverted until the revenue leak is closed.',
    rationale: 'Existing revenue is leaking; protecting the base is more valuable than another speculative growth test.',
  },
  {
    id: 'BW-04', name: 'Attribution stack', action: 'Delegate', stage: 'L2 Business case', rag: 'Red', owner: 'Data',
    grossValue: 36, riskAdjustedValue: 16, posture: 'Enabler', checkpoint: 'Instrumentation spec locked', due: '20 Jul', progress: 34, daysStalled: 12,
    blocker: 'Event naming and source-of-truth ownership remain unresolved across Growth and Product.',
    decision: 'Delegate decision rights to the Data lead and require one canonical event dictionary by Monday.',
    rationale: 'Founder involvement is no longer the bottleneck; accountability and a hard decision boundary are.',
  },
  {
    id: 'BW-05', name: 'COGS / margin model', action: 'Unblock', stage: 'L2 Business case', rag: 'Red', owner: 'Finance',
    grossValue: 28, riskAdjustedValue: 13, posture: 'Enabler', checkpoint: 'Margin model v1', due: '22 Jul', progress: 29, daysStalled: 8,
    blocker: 'Landed-cost ownership and promo-cost treatment are not agreed.',
    decision: 'Resolve the accounting treatment in one working session and freeze the model definition for four weeks.',
    rationale: 'The model is required to stop scaling low-quality revenue and make SKU-level investment decisions.',
  },
  {
    id: 'BW-06', name: 'SKU mapping', action: 'Delegate', stage: 'L3 Planned', rag: 'Green', owner: 'Operations',
    grossValue: 34, riskAdjustedValue: 24, posture: 'Enabler', checkpoint: 'Mapping coverage >95%', due: '24 Jul', progress: 63,
    blocker: 'No executive blocker. Team needs a fixed exception-handling rule.',
    decision: 'Delegate execution and review only the exception list in the weekly operating cadence.',
    rationale: 'Clear operating task with low founder leverage once rules and ownership are explicit.',
  },
  {
    id: 'BW-07', name: 'QC SOP', action: 'Park', stage: 'L1 Idea', rag: 'Amber', owner: 'Supply',
    grossValue: 18, riskAdjustedValue: 5, posture: 'Quick Win', checkpoint: 'Scope + failure-cost baseline', due: '28 Jul', progress: 12, daysStalled: 6,
    blocker: 'Failure-cost baseline is too weak to size the opportunity confidently.',
    decision: 'Park implementation, but keep a two-hour discovery task to establish the failure-cost baseline.',
    rationale: 'Potentially useful, but evidence is insufficient versus higher-confidence work already in flight.',
  },
];

export const stageOrder = ['L1 Idea', 'L2 Business case', 'L3 Planned', 'L4 In-flight', 'L5 Realized'];
export const formatRp = (value: number) => `Rp ${Math.round(value)}M`;
export const ragClass = (rag: Initiative['rag']) => rag.toLowerCase();
export const actionClass = (action: Initiative['action']) => action.toLowerCase();
