'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase';
import { requireSeller } from '@/lib/auth';
import { listingSchema } from '@/lib/validation';
import { writeAuditLog } from '@/lib/audit';

export async function createListing(formData: unknown) {
  const session = await requireSeller();
  const parsed = listingSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('listings')
    .insert({
      seller_id: session.profile.id,
      ...parsed.data,
      image_moderation_status: 'approved',
      status: 'active',
    })
    .select('id')
    .single();
  
  if (error) return { error: error.message };
  revalidatePath('/dashboard');
  revalidatePath('/');
  return { ok: true, id: data.id };
}

export async function editListing(id: string, formData: unknown) {
  const session = await requireSeller();
  const parsed = listingSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  
  const supabase = await createServerSupabase();
  
  const { data: existing } = await supabase
    .from('listings')
    .select('price, currency')
    .eq('id', id)
    .eq('seller_id', session.profile.id)
    .single();
  
  if (!existing) return { error: 'Listing not found' };
  
  // Log price change
  if (existing.price !== parsed.data.price) {
    await supabase.from('listing_price_history').insert({
      listing_id: id,
      old_price: existing.price,
      new_price: parsed.data.price,
      currency: parsed.data.currency,
      changed_by: session.profile.id,
    });
  }
  
  const { error } = await supabase
    .from('listings')
    .update({
      ...parsed.data,
      last_confirmed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('seller_id', session.profile.id);
  
  if (error) return { error: error.message };
  revalidatePath('/dashboard');
  revalidatePath(`/listing/${id}`);
  return { ok: true };
}

export async function deleteListing(id: string) {
  const session = await requireSeller();
  const supabase = await createServerSupabase();
  
  const { error } = await supabase
    .from('listings')
    .update({ status: 'deleted', deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('seller_id', session.profile.id);
  
  if (error) return { error: error.message };
  revalidatePath('/dashboard');
  revalidatePath('/');
  return { ok: true };
}

export async function markListingSold(id: string) {
  const session = await requireSeller();
  const supabase = await createServerSupabase();
  
  const { error } = await supabase
    .from('listings')
    .update({ status: 'sold' })
    .eq('id', id)
    .eq('seller_id', session.profile.id);
  
  if (error) return { error: error.message };
  revalidatePath('/dashboard');
  revalidatePath('/');
  return { ok: true };
}

export async function hideListing(id: string) {
  const session = await requireSeller();
  const supabase = await createServerSupabase();
  
  const { error } = await supabase
    .from('listings')
    .update({ status: 'hidden' })
    .eq('id', id)
    .eq('seller_id', session.profile.id);
  
  if (error) return { error: error.message };
  revalidatePath('/dashboard');
  revalidatePath('/');
  return { ok: true };
}

export async function confirmListingAvailable(id: string) {
  const session = await requireSeller();
  const supabase = await createServerSupabase();
  
  await supabase
    .from('listings')
    .update({ last_confirmed_at: new Date().toISOString(), status: 'active' })
    .eq('id', id)
    .eq('seller_id', session.profile.id);
  
  revalidatePath('/dashboard');
  return { ok: true };
}

export async function bulkDeleteListings(ids: string[]) {
  const session = await requireSeller();
  const supabase = await createServerSupabase();
  
  const { error } = await supabase
    .from('listings')
    .update({ status: 'deleted', deleted_at: new Date().toISOString() })
    .in('id', ids)
    .eq('seller_id', session.profile.id);
  
  if (error) return { error: error.message };
  revalidatePath('/dashboard');
  revalidatePath('/');
  return { ok: true, count: ids.length };
}