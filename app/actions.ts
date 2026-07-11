'use server';

import { supabaseAdmin } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const now = () => new Date().toISOString();

// State vocabulary for the change-log (mirrors the UI: Idea/Execute/Done).
const stateName = (stage: number) => (stage <= 2 ? 'Idea' : stage === 5 ? 'Done' : 'Execute');

type LogRow = { entity: string; entity_id: string | null; field: string; old_val?: unknown; new_val?: unknown };
const str = (v: unknown) => (v === null || v === undefined ? null : String(v));

// Append change-log rows. `who` stays null until Supabase Auth (D3).
async function log(sb: ReturnType<typeof supabaseAdmin>, rows: LogRow[]) {
  if (!rows.length) return;
  await sb.from('change_log').insert(
    rows.map(r => ({ entity: r.entity, entity_id: r.entity_id, field: r.field, old_val: str(r.old_val), new_val: str(r.new_val) }))
  );
}

export async function moveStage(id: string, dir: number) {
  const sb = supabaseAdmin();
  const { data } = await sb.from('initiatives').select('stage').eq('id', id).single();
  const prev = data?.stage ?? 1;
  const next = Math.max(1, Math.min(5, prev + dir));
  if (next === prev) return;
  await sb.from('initiatives').update({ stage: next, state_since: now(), updated_at: now() }).eq('id', id);
  await log(sb, [{ entity: 'initiative', entity_id: id, field: 'state', old_val: stateName(prev), new_val: stateName(next) }]);
  revalidatePath('/');
}

// Absolute stage set (drag-and-drop / state buttons). Resets age-in-state.
export async function setStage(id: string, stage: number) {
  const sb = supabaseAdmin();
  const next = Math.max(1, Math.min(5, Math.round(stage)));
  const { data } = await sb.from('initiatives').select('stage').eq('id', id).single();
  const prev = data?.stage ?? 1;
  if (next === prev) return;
  await sb.from('initiatives').update({ stage: next, state_since: now(), updated_at: now() }).eq('id', id);
  await log(sb, [{ entity: 'initiative', entity_id: id, field: 'state', old_val: stateName(prev), new_val: stateName(next) }]);
  revalidatePath('/');
}

// Setting a RAG is a manual override; clearing it (null) reverts to the
// milestone-derived auto-RAG computed in v_initiatives_scored.
export async function setRag(id: string, rag: 'Green' | 'Amber' | 'Red' | null) {
  const sb = supabaseAdmin();
  const { data } = await sb.from('initiatives').select('rag').eq('id', id).single();
  await sb.from('initiatives')
    .update({ rag, rag_override: rag !== null, updated_at: now() })
    .eq('id', id);
  await log(sb, [{ entity: 'initiative', entity_id: id, field: 'RAG', old_val: data?.rag ?? 'auto', new_val: rag ?? 'auto' }]);
  revalidatePath('/');
}

export async function toggleMilestone(mid: number, done: boolean) {
  const sb = supabaseAdmin();
  const { data } = await sb.from('milestones').update({ done }).eq('id', mid).select('initiative_id, title').single();
  if (data) await log(sb, [{ entity: 'milestone', entity_id: data.initiative_id, field: 'milestone', new_val: `${done ? '✓' : '○'} ${data.title}` }]);
  revalidatePath('/');
}

export async function addMilestone(initiativeId: string, title: string, dueDate: string | null) {
  const sb = supabaseAdmin();
  const t = title.trim();
  if (!t) return;
  const { data } = await sb.from('milestones').select('sort').eq('initiative_id', initiativeId).order('sort', { ascending: false }).limit(1);
  const sort = ((data?.[0]?.sort as number | undefined) ?? -1) + 1;
  await sb.from('milestones').insert({ initiative_id: initiativeId, title: t, due_date: dueDate || null, sort });
  await sb.from('initiatives').update({ updated_at: now() }).eq('id', initiativeId);
  await log(sb, [{ entity: 'milestone', entity_id: initiativeId, field: 'milestone', new_val: `+ ${t}${dueDate ? ' · due ' + dueDate : ''}` }]);
  revalidatePath('/');
}

export async function deleteMilestone(mid: number) {
  const sb = supabaseAdmin();
  const { data } = await sb.from('milestones').delete().eq('id', mid).select('initiative_id, title').single();
  if (data) await log(sb, [{ entity: 'milestone', entity_id: data.initiative_id, field: 'milestone', old_val: data.title, new_val: '(removed)' }]);
  revalidatePath('/');
}

export async function updateConfig(patch: Record<string, number>) {
  const sb = supabaseAdmin();
  await sb.from('config').update({ ...patch, updated_at: now() }).eq('id', 1);
  await log(sb, [{ entity: 'config', entity_id: null, field: 'assumptions', new_val: Object.keys(patch).join(', ') + ' updated' }]);
  revalidatePath('/');
}

// ---- card meta: status note, next action, KPI actual (frequent standup edits) ----
export async function saveCardMeta(id: string, patch: Record<string, unknown>) {
  const sb = supabaseAdmin();
  const { data: cur } = await sb.from('initiatives')
    .select('note, next_action, next_due, kpi_actual').eq('id', id).single();
  const fields = ['note', 'next_action', 'next_due', 'kpi_actual'] as const;
  const write: Record<string, unknown> = {};
  for (const k of fields) if (k in patch) write[k] = patch[k];
  if (!Object.keys(write).length) return;
  await sb.from('initiatives').update({ ...write, updated_at: now() }).eq('id', id);
  const logs: LogRow[] = [];
  for (const k of fields) {
    if (k in write && String((cur as Record<string, unknown> | null)?.[k] ?? '') !== String(write[k] ?? '')) {
      const label = k === 'note' ? 'status note' : k === 'next_action' ? 'next action' : k === 'next_due' ? 'next due' : 'KPI actual';
      logs.push({ entity: 'initiative', entity_id: id, field: label, new_val: write[k] });
    }
  }
  await log(sb, logs);
  revalidatePath('/');
}

// ---- register CRUD (inputs only — the view computes every score) ----

// Next free ID in a bucket, e.g. bucket 'A · …' with A1..A5 present → 'A6'.
// Rule 3: stable IDs, never renumber. New ideas get the next free number.
async function nextIdForBucket(bucket: string): Promise<string> {
  const sb = supabaseAdmin();
  const letter = bucket.trim().charAt(0).toUpperCase();
  const { data } = await sb.from('initiatives').select('id');
  const nums = (data ?? [])
    .map(r => r.id as string)
    .filter(id => id.charAt(0).toUpperCase() === letter)
    .map(id => parseInt(id.slice(1), 10))
    .filter(n => Number.isFinite(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${letter}${next}`;
}

// Only these columns are writable; scores are derived, never stored.
const INPUT_COLS = [
  'bucket', 'name', 'description', 'driver', 'base_type', 'direct_rp',
  'uplift', 'coverage', 'build_cost', 'monthly_cost', 'tti', 'conf', 'ease',
  'stage', 'pl_line', 'recurring', 'in_plan', 'owner_id',
  'kpi_label', 'kpi_target', 'kpi_unit', 'kpi_baseline', 'kpi_leading',
  'how_it_works', 'steps', 'done_when', 'depends_on',
] as const;

function pick(input: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const k of INPUT_COLS) if (k in input) out[k] = input[k];
  return out;
}

export async function createInitiative(input: Record<string, unknown>) {
  const sb = supabaseAdmin();
  const id = await nextIdForBucket(String(input.bucket ?? ''));
  await sb.from('initiatives').insert({ ...pick(input), id, status: 'Active', state_since: now(), updated_at: now() });
  await log(sb, [{ entity: 'initiative', entity_id: id, field: 'created', new_val: String(input.name ?? id) }]);
  revalidatePath('/');
  return id;
}

export async function updateInitiative(id: string, patch: Record<string, unknown>) {
  const sb = supabaseAdmin();
  await sb.from('initiatives').update({ ...pick(patch), updated_at: now() }).eq('id', id);
  await log(sb, [{ entity: 'initiative', entity_id: id, field: 'edited', new_val: 'inputs updated' }]);
  revalidatePath('/');
}

export async function setOwner(id: string, ownerId: string | null) {
  const sb = supabaseAdmin();
  const { data } = await sb.from('initiatives').update({ owner_id: ownerId, updated_at: now() }).eq('id', id).select('owner_id').single();
  void data;
  await log(sb, [{ entity: 'initiative', entity_id: id, field: 'owner', new_val: ownerId ?? '(unassigned)' }]);
  revalidatePath('/');
}

// Kill via status, never delete (rule 3). Killed drops out of coverage.
export async function setStatus(id: string, status: 'Active' | 'Killed') {
  const sb = supabaseAdmin();
  await sb.from('initiatives').update({ status, updated_at: now() }).eq('id', id);
  await log(sb, [{ entity: 'initiative', entity_id: id, field: 'status', new_val: status }]);
  revalidatePath('/');
}
