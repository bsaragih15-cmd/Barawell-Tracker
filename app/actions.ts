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

export async function setRag(id: string, rag: 'Green' | 'Amber' | 'Red' | null) {
  const sb = supabaseAdmin();
  await sb.from('initiatives').update({ rag, updated_at: now() }).eq('id', id);
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
