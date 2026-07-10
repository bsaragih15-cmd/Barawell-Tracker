'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/server';

export type SubmitCaseInput = {
  category: string;
  routed_tier?: string | null;
  med_pref?: string | null;
  answers: Record<string, unknown>;
  flagged?: boolean;
  full_name: string;
  wa_number: string;
  city?: string;
  consent_tele: boolean;
  consent_privacy: boolean;
};

export async function submitCase(input: SubmitCaseInput) {
  if (!input.full_name?.trim() || !input.wa_number?.trim()) throw new Error('Nama dan nomor WhatsApp wajib diisi');
  if (!input.consent_tele || !input.consent_privacy) throw new Error('Persetujuan wajib dicentang');
  const db = supabaseAdmin();
  const { data, error } = await db
    .from('dara_cases')
    .insert({
      category: input.category,
      routed_tier: input.routed_tier ?? null,
      med_pref: input.med_pref ?? null,
      answers: input.answers,
      flagged: !!input.flagged,
      full_name: input.full_name.trim(),
      wa_number: input.wa_number.trim(),
      city: input.city?.trim() || null,
      consent_tele: true,
      consent_privacy: true,
    })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  redirect(`/dara/kasus/${data.id}`);
}

/* Checkout stub: marks the case paid. Swap for Midtrans/Xendit later —
   the state machine and UI already treat payment as an external event. */
export async function payCase(caseId: string, term: number) {
  const db = supabaseAdmin();
  const { data: c } = await db.from('dara_cases').select('id,status').eq('id', caseId).single();
  if (!c || c.status !== 'approved') throw new Error('Kasus belum disetujui dokter');
  const { error } = await db
    .from('dara_cases')
    .update({ status: 'paid', term_months: term, paid_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', caseId);
  if (error) throw new Error(error.message);
  revalidatePath(`/dara/kasus/${caseId}`);
}

/* ── Ops console actions (guarded by the admin key) ── */
function checkKey(key: string) {
  const expected = process.env.DARA_ADMIN_KEY || 'dara-ops';
  if (key !== expected) throw new Error('Kunci admin salah');
}

export async function adminDecide(formData: FormData) {
  const key = String(formData.get('key') || '');
  checkKey(key);
  const caseId = String(formData.get('case_id'));
  const decision = String(formData.get('decision')); // approved | needs_info | rejected
  const planId = String(formData.get('plan_id') || '');
  const note = String(formData.get('note') || '');
  if (!['approved', 'needs_info', 'rejected'].includes(decision)) throw new Error('Keputusan tidak dikenal');
  if (decision === 'approved' && !planId) throw new Error('Pilih plan untuk kasus yang disetujui');
  const db = supabaseAdmin();
  const { error } = await db
    .from('dara_cases')
    .update({
      status: decision,
      plan_id: decision === 'approved' ? planId : null,
      doctor_note: note || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', caseId);
  if (error) throw new Error(error.message);
  revalidatePath('/dara/admin');
  revalidatePath(`/dara/kasus/${caseId}`);
}
