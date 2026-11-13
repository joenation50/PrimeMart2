'use server';

import { createServerSupabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function approvePayment(paymentId: string, sellerId: string) {
  const supabase = await createServerSupabase();
  
  // 1. Approve the payment
  await supabase.from('payments').update({ status: 'approved' }).eq('id', paymentId);
  
  // 2. Upgrade the user for 1 year
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  
  await supabase.from('users').update({
    role: 'seller',
    seller_status: 'active',
    seller_expires_at: expiresAt.toISOString()
  }).eq('id', sellerId);

  revalidatePath('/admin');
  return { ok: true };
}

export async function rejectPayment(paymentId: string, sellerId: string) {
  const supabase = await createServerSupabase();
  
  // 1. Reject the payment
  await supabase.from('payments').update({ status: 'rejected' }).eq('id', paymentId);
  
  // 2. Revert the user to unpaid
  await supabase.from('users').update({ 
    seller_status: 'unpaid'
  }).eq('id', sellerId);

  revalidatePath('/admin');
  return { ok: true };
}