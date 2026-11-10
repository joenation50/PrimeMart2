'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

export async function toggleFavorite(listingId: string) {
  const session = await getSession();
  if (!session) return { error: 'Not logged in' };
  
  const supabase = await createServerSupabase();
  
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', session.profile.id)
    .eq('listing_id', listingId)
    .maybeSingle();
  
  if (existing) {
    await supabase.from('favorites').delete().eq('id', existing.id);
    revalidatePath('/favorites');
    return { ok: true, favorited: false };
  }
  
  await supabase.from('favorites').insert({
    user_id: session.profile.id,
    listing_id: listingId,
  });
  
  revalidatePath('/favorites');
  return { ok: true, favorited: true };
}

export async function trackView(listingId: string) {
  const session = await getSession();
  const supabase = await createServerSupabase();
  
  await supabase.from('listing_events').insert({
    listing_id: listingId,
    user_id: session?.profile.id ?? null,
    event_type: 'view',
  });
  
  return { ok: true };
}

export async function trackWhatsAppClick(listingId: string) {
  const session = await getSession();
  if (!session) return { error: 'Not logged in' };
  
  const supabase = await createServerSupabase();
  
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: existing } = await supabase
    .from('listing_events')
    .select('id')
    .eq('listing_id', listingId)
    .eq('user_id', session.profile.id)
    .eq('event_type', 'whatsapp_click')
    .gte('created_at', since)
    .maybeSingle();
  
  if (existing) return { ok: true, skipped: true };
  
  await supabase.from('listing_events').insert({
    listing_id: listingId,
    user_id: session.profile.id,
    event_type: 'whatsapp_click',
  });
  
  return { ok: true };
}

export async function submitReport(data: {
  target_type: 'listing' | 'seller' | 'buyer' | 'review';
  target_id: string;
  reason: string;
  details ? : string;
}) {
  const session = await getSession();
  if (!session) return { error: 'Not logged in' };
  
  const supabase = await createServerSupabase();
  
  const reporterRole = session.profile.role === 'seller' ? 'seller' : 'buyer';
  
  const { error } = await supabase.from('reports').insert({
    reporter_id: session.profile.id,
    reporter_role: reporterRole,
    target_type: data.target_type,
    target_id: data.target_id,
    reason: data.reason,
    details: data.details ?? null,
  });
  
  if (error) return { error: error.message };
  return { ok: true };
}

export async function markNotificationRead(notificationId: string) {
  const session = await getSession();
  if (!session) return { error: 'Not logged in' };
  
  const supabase = await createServerSupabase();
  await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', session.profile.id);
  
  revalidatePath('/notifications');
  return { ok: true };
}

export async function markAllNotificationsRead() {
  const session = await getSession();
  if (!session) return { error: 'Not logged in' };
  
  const supabase = await createServerSupabase();
  await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', session.profile.id)
    .is('read_at', null);
  
  revalidatePath('/notifications');
  return { ok: true };
}