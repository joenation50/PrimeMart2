'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';
import { paymentSchema } from '@/lib/validation';
import { writeAuditLog } from '@/lib/audit';

export async function submitPaymentProof(formData: unknown) {
  const session = await requireAuth();
  const parsed = paymentSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  
  const supabase = await createServerSupabase();
  
  // One pending at a time
  const { data: existing } = await supabase
    .from('payments')
    .select('id')
    .eq('seller_id', session.profile.id)
    .eq('status', 'pending_review')
    .maybeSingle();
  
  if (existing) {
    return { error: 'You already have a payment under review' };
  }
  
  const { error } = await supabase.from('payments').insert({
    seller_id: session.profile.id,
    reference: `${session.profile.seller_code}-Y1`,
    amount: parsed.data.amount,
    currency: parsed.data.currency,
    screenshot_url: parsed.data.screenshot_url,
    claimed_ref: parsed.data.claimed_ref ?? null,
    payment_type: 'subscription',
    status: 'pending_review',
  });
  
  if (error) return { error: error.message };
  
  // Flip seller status to pending
  await supabase
    .from('users')
    .update({ seller_status: 'pending' })
    .eq('id', session.profile.id);
  
  await writeAuditLog({
    adminId: null,
    targetType: 'payment',
    targetId: session.profile.id,
    fieldChanged: 'status',
    newValue: 'pending_review',
  });
  
  revalidatePath('/dashboard');
  return { ok: true };
}