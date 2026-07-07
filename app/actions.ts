'use server';

import { supabaseAdmin } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const now = () => new Date().toISOString();

export async function moveStage(id: string, dir: number) {
  const sb = supabaseAdmin();
  const { data } = await sb.from('initiatives').select('stage').eq('id', id).single();
  const next = Math.max(1, Math.min(5, (data?.stage ?? 1) + dir));
  await sb.from('initiatives').update({ stage: next, updated_at: now() }).eq('id', id);
  revalidatePath('/');
}

// Absolute stage set (drag-and-drop drops a card on a target column/lane).
export async function setStage(id: string, stage: number) {
  const sb = supabaseAdmin();
  const next = Math.max(1, Math.min(5, Math.round(stage)));
  await sb.from('initiatives').update({ stage: next, updated_at: now() }).eq('id', id);
  revalidatePath('/');
}

// Setting a RAG is a manual override; clearing it (null) reverts to the
// milestone-derived auto-RAG computed in v_initiatives_scored.
export async function setRag(id: string, rag: 'Green' | 'Amber' | 'Red' | null) {
  const sb = supabaseAdmin();
  await sb.from('initiatives')
    .update({ rag, rag_override: rag !== null, updated_at: now() })
    .eq('id', id);
  revalidatePath('/');
}

export async function toggleMilestone(mid: number, done: boolean) {
  const sb = supabaseAdmin();
  await sb.from('milestones').update({ done }).eq('id', mid);
  revalidatePath('/');
}

export async function updateConfig(patch: Record<string, number>) {
  const sb = supabaseAdmin();
  await sb.from('config').update({ ...patch, updated_at: now() }).eq('id', 1);
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
] as const;

function pick(input: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const k of INPUT_COLS) if (k in input) out[k] = input[k];
  return out;
}

export async function createInitiative(input: Record<string, unknown>) {
  const sb = supabaseAdmin();
  const id = await nextIdForBucket(String(input.bucket ?? ''));
  await sb.from('initiatives').insert({ ...pick(input), id, status: 'Active', updated_at: now() });
  revalidatePath('/');
  return id;
}

export async function updateInitiative(id: string, patch: Record<string, unknown>) {
  const sb = supabaseAdmin();
  await sb.from('initiatives').update({ ...pick(patch), updated_at: now() }).eq('id', id);
  revalidatePath('/');
}

export async function setOwner(id: string, ownerId: string | null) {
  const sb = supabaseAdmin();
  await sb.from('initiatives').update({ owner_id: ownerId, updated_at: now() }).eq('id', id);
  revalidatePath('/');
}

// Kill via status, never delete (rule 3). Killed drops out of coverage.
export async function setStatus(id: string, status: 'Active' | 'Killed') {
  const sb = supabaseAdmin();
  await sb.from('initiatives').update({ status, updated_at: now() }).eq('id', id);
  revalidatePath('/');
}
