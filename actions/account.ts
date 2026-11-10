'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';
import { sellerProfileSchema } from '@/lib/validation';

export async function updateProfile(data: { name ? : string;phone ? : string }) {
  const session = await requireAuth();
  const supabase = await createServerSupabase();
  
  const { error } = await supabase
    .from('users')
    .update(data)
    .eq('id', session.profile.id);
  
  if (error) return { error: error.message };
  revalidatePath('/account');
  return { ok: true };
}

export async function updateWhatsApp(whatsapp: string) {
  const session = await requireAuth();
  const supabase = await createServerSupabase();
  
  const { error } = await supabase
    .from('seller_profiles')
    .update({ delivery_notes: undefined })
    .eq('user_id', session.profile.id);
  
  // WhatsApp lives on users.phone
  const { error: userError } = await supabase
    .from('users')
    .update({ phone: whatsapp })
    .eq('id', session.profile.id);
  
  if (userError) return { error: userError.message };
  
  await supabase.from('audit_log').insert({
    admin_id: null,
    target_type: 'user',
    target_id: session.profile.id,
    field_changed: 'phone',
    new_value: whatsapp,
  });
  
  revalidatePath('/dashboard');
  return { ok: true };
}

export async function updateSellerProfile(data: unknown) {
  const session = await requireAuth();
  const parsed = sellerProfileSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  
  const supabase = await createServerSupabase();
  
  const { data: existing } = await supabase
    .from('seller_profiles')
    .select('id')
    .eq('user_id', session.profile.id)
    .maybeSingle();
  
  if (existing) {
    const { error } = await supabase
      .from('seller_profiles')
      .update({
        real_name: parsed.data.real_name,
        business_name: parsed.data.business_name,
        based_country: parsed.data.based_country,
        based_region: parsed.data.based_region ?? null,
        based_city: parsed.data.based_city ?? null,
        primary_categories: parsed.data.primary_categories,
      })
      .eq('user_id', session.profile.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from('seller_profiles').insert({
      user_id: session.profile.id,
      real_name: parsed.data.real_name,
      business_name: parsed.data.business_name,
      based_country: parsed.data.based_country,
      based_region: parsed.data.based_region ?? null,
      based_city: parsed.data.based_city ?? null,
      primary_categories: parsed.data.primary_categories,
    });
    if (error) return { error: error.message };
  }
  
  revalidatePath('/dashboard');
  return { ok: true };
}

export async function updateNotificationPreferences(prefs: {
  email: boolean;
  in_app: boolean;
}) {
  const session = await requireAuth();
  const supabase = await createServerSupabase();
  
  const { error } = await supabase
    .from('users')
    .update({ notification_preferences: prefs })
    .eq('id', session.profile.id);
  
  if (error) return { error: error.message };
  return { ok: true };
}

export async function deleteAccount() {
  const session = await requireAuth();
  const supabase = await createServerSupabase();
  
  const { error } = await supabase
    .from('users')
    .update({ account_status: 'deleted', deleted_at: new Date().toISOString() })
    .eq('id', session.profile.id);
  
  if (error) return { error: error.message };
  
  await supabase.auth.signOut();
  return { ok: true };
}