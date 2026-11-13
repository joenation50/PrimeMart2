'use server';

import { createServerSupabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function approvePayment(paymentId: string, sellerId: string) {
  const supabase = await createServerSupabase();
  
  // 1. Fetch the payment to get the application data
  const { data: payment } = await supabase.from('payments').select('*').eq('id', paymentId).single();
  
  if (!payment) return { error: 'Payment not found' };

  // 2. Approve the payment
  await supabase.from('payments').update({ status: 'approved' }).eq('id', paymentId);
  
  // 3. Upgrade the user
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  
  await supabase.from('users').update({
    role: 'seller',
    seller_status: 'active',
    seller_expires_at: expiresAt.toISOString(),
    phone: payment.application_data?.whatsapp || null // Update their phone
  }).eq('id', sellerId);

  // 4. Create their Seller Profile from the application data
  if (payment.application_data) {
    await supabase.from('seller_profiles').upsert({
      user_id: sellerId,
      business_name: payment.application_data.business_name,
      based_city: payment.application_data.location,
      based_country: 'NG',
      bio: payment.application_data.description,
      categories: payment.application_data.categories,
      logo_url: payment.application_data.logo_url
    }, { onConflict: 'user_id' });
  }

  revalidatePath('/admin');
  return { ok: true };
}

export async function rejectPayment(paymentId: string, sellerId: string) {
  const supabase = await createServerSupabase();
  await supabase.from('payments').update({ status: 'rejected' }).eq('id', paymentId);
  await supabase.from('users').update({ seller_status: 'unpaid' }).eq('id', sellerId);
  revalidatePath('/admin');
  return { ok: true };
}