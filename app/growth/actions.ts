'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/server';

const PLAY_CODES = new Set([
  'refill_due',
  'new_customer_conversion',
  'winback_value',
  'cross_sell',
  'aov_expand',
  'channel_migrate',
  'service_recovery',
]);

const OUTCOMES = new Set([
  'not_contacted', 'no_response', 'responded', 'interested',
  'needs_consultation', 'follow_up_scheduled', 'ordered', 'not_interested',
  'wrong_timing', 'price_concern', 'product_concern', 'delivery_concern',
  'do_not_contact', 'other',
]);

export type ActionResult = { ok: boolean; message: string };

const requireServiceRole = (): ActionResult | null =>
  process.env.SUPABASE_SERVICE_ROLE_KEY
    ? null
    : {
        ok: false,
        message: 'This deployment is a read-only preview. Add SUPABASE_SERVICE_ROLE_KEY to the protected internal Vercel environment to enable CRM writes.',
      };

export async function refreshGrowthInsights(): Promise<ActionResult> {
  const blocked = requireServiceRole();
  if (blocked) return blocked;

  const sb = supabaseAdmin();
  const { data: summary, error: summaryError } = await sb
    .from('v_segment_summary')
    .select('asof')
    .maybeSingle();

  if (summaryError) return { ok: false, message: summaryError.message };

  const { error } = await sb.rpc('refresh_growth_insights', {
    p_as_of: summary?.asof ?? new Date().toISOString().slice(0, 10),
  });
  if (error) return { ok: false, message: error.message };
  revalidatePath('/growth');
  return { ok: true, message: 'Automatic insights refreshed.' };
}

export async function materializeAssignments(input: {
  playCode: string;
  limit: number;
  assignedTo?: string;
}): Promise<ActionResult> {
  const blocked = requireServiceRole();
  if (blocked) return blocked;
  if (!PLAY_CODES.has(input.playCode)) return { ok: false, message: 'Unknown sales play.' };
  const limit = Math.max(1, Math.min(80, Math.round(input.limit || 20)));
  const assignedTo = input.assignedTo?.trim().slice(0, 120) || null;

  const sb = supabaseAdmin();
  const { data, error } = await sb.rpc('create_crm_assignments', {
    p_play_code: input.playCode,
    p_limit: limit,
    p_assigned_to: assignedTo,
    p_experiment_id: null,
  });
  if (error) return { ok: false, message: error.message };
  revalidatePath('/growth');
  return { ok: true, message: `${Number(data ?? 0)} assignments created.` };
}

export async function logCrmActivity(input: {
  assignmentId: number | null;
  customerKey: string;
  agent?: string;
  activityType: 'message' | 'call' | 'consultation' | 'follow_up' | 'note';
  channel?: string;
  outcome: string;
  notes?: string;
  nextFollowUpAt?: string;
}): Promise<ActionResult> {
  const blocked = requireServiceRole();
  if (blocked) return blocked;
  if (!input.customerKey.trim()) return { ok: false, message: 'Customer is required.' };
  if (!OUTCOMES.has(input.outcome)) return { ok: false, message: 'Unknown outcome.' };

  const sb = supabaseAdmin();
  const { error } = await sb.from('crm_activities').insert({
    assignment_id: input.assignmentId,
    customer_key: input.customerKey,
    agent: input.agent?.trim().slice(0, 120) || null,
    activity_type: input.activityType,
    channel: input.channel?.trim().slice(0, 80) || null,
    outcome: input.outcome,
    notes: input.notes?.trim().slice(0, 2000) || null,
    next_follow_up_at: input.nextFollowUpAt || null,
  });
  if (error) return { ok: false, message: error.message };

  if (input.assignmentId) {
    const status = input.outcome === 'ordered'
      ? 'converted'
      : input.outcome === 'follow_up_scheduled'
        ? 'snoozed'
        : ['not_interested', 'do_not_contact'].includes(input.outcome)
          ? 'closed'
          : 'in_progress';
    await sb.from('crm_assignments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', input.assignmentId);
  }

  revalidatePath('/growth');
  return { ok: true, message: 'Customer outcome recorded.' };
}

export async function createExperiment(input: {
  code: string;
  playCode: string;
  hypothesis: string;
  treatmentShare: number;
  sampleSize: number;
  owner?: string;
}): Promise<ActionResult> {
  const blocked = requireServiceRole();
  if (blocked) return blocked;

  const code = input.code.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-').slice(0, 80);
  if (!code) return { ok: false, message: 'Experiment code is required.' };
  if (!PLAY_CODES.has(input.playCode)) return { ok: false, message: 'Unknown sales play.' };
  if (input.hypothesis.trim().length < 12) return { ok: false, message: 'Add a clear hypothesis.' };

  const treatmentShare = Math.max(0.5, Math.min(0.95, Number(input.treatmentShare) || 0.9));
  const sampleSize = Math.max(10, Math.min(80, Math.round(input.sampleSize || 80)));
  const sb = supabaseAdmin();

  const { data: experiment, error: insertError } = await sb
    .from('crm_experiments')
    .insert({
      code,
      play_code: input.playCode,
      hypothesis: input.hypothesis.trim().slice(0, 1000),
      treatment_share: treatmentShare,
      start_date: new Date().toISOString().slice(0, 10),
      owner: input.owner?.trim().slice(0, 120) || null,
      status: 'running',
    })
    .select('id')
    .single();

  if (insertError || !experiment) return { ok: false, message: insertError?.message ?? 'Experiment was not created.' };

  const { error: seedError } = await sb.rpc('seed_crm_experiment', {
    p_experiment_id: experiment.id,
    p_limit: sampleSize,
  });
  if (seedError) return { ok: false, message: seedError.message };

  const { data: treatmentMembers, error: memberError } = await sb
    .from('crm_experiment_members')
    .select('customer_key')
    .eq('experiment_id', experiment.id)
    .eq('arm', 'treatment');
  if (memberError) return { ok: false, message: memberError.message };

  const keys = ((treatmentMembers ?? []) as { customer_key: string }[]).map(row => row.customer_key);
  if (keys.length) {
    const { data: queueRows, error: queueError } = await sb
      .from('v_crm_action_queue')
      .select('customer_key,customer_name,city,play_code,priority_score,expected_incremental_value,reason')
      .eq('play_code', input.playCode)
      .in('customer_key', keys);
    if (queueError) return { ok: false, message: queueError.message };

    const { data: play } = await sb.from('crm_plays')
      .select('default_due_days')
      .eq('code', input.playCode)
      .maybeSingle();
    const due = new Date();
    due.setDate(due.getDate() + Number(play?.default_due_days ?? 1));

    const { data: openAssignments } = await sb.from('crm_assignments')
      .select('customer_key')
      .eq('play_code', input.playCode)
      .in('status', ['open', 'in_progress', 'snoozed'])
      .in('customer_key', keys);
    const existing = new Set(((openAssignments ?? []) as { customer_key: string }[]).map(row => row.customer_key));

    type QueueRow = {
      customer_key: string;
      customer_name: string;
      city: string | null;
      play_code: string;
      priority_score: number | string;
      expected_incremental_value: number | string;
      reason: string;
    };
    const assignments = ((queueRows ?? []) as QueueRow[])
      .filter((row: QueueRow) => !existing.has(row.customer_key))
      .map((row: QueueRow) => ({
        customer_key: row.customer_key,
        customer_name: row.customer_name,
        city: row.city,
        play_code: row.play_code,
        assigned_to: input.owner?.trim().slice(0, 120) || null,
        priority_score: row.priority_score,
        expected_incremental_value: row.expected_incremental_value,
        reason: row.reason,
        model_version: 'heuristic-v1',
        experiment_id: experiment.id,
        due_at: due.toISOString(),
      }));
    if (assignments.length) {
      const { error: assignmentError } = await sb.from('crm_assignments').insert(assignments);
      if (assignmentError) return { ok: false, message: assignmentError.message };
    }
  }

  revalidatePath('/growth');
  return { ok: true, message: `Experiment started with ${sampleSize} eligible customers and a ${(treatmentShare * 100).toFixed(0)}% treatment arm.` };
}
