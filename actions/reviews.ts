'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';
import { reviewSchema, reviewReplySchema } from '@/lib/validation';
import { createNotification } from '@/lib/notifications';

export async function createReview(sellerId: string, formData: unknown) {
  const session = await requireAuth();
  const parsed = reviewSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  
  const supabase = await createServerSupabase();
  
  // Verify eligibility: must have clicked WhatsApp on this seller's listing
  const { data: clickEvent } = await supabase
    .from('listing_events')
    .select('id')
    .eq('user_id', session.profile.id)
    .eq('event_type', 'whatsapp_click')
    .in(
      'listing_id',
      supabase.from('listings').select('id').eq('seller_id', sellerId) as any
    )
    .limit(1)
    .maybeSingle();
  
  if (!clickEvent) {
    return { error: 'You must contact this seller before reviewing' };
  }
  
  const { error } = await supabase.from('reviews').insert({
    seller_id: sellerId,
    buyer_id: session.profile.id,
    rating: parsed.data.rating,
    text: parsed.data.text ?? null,
  });
  
  if (error) {
    if (error.code === '23505') return { error: 'You have already reviewed this seller' };
    return { error: error.message };
  }
  
  await createNotification({
    userId: sellerId,
    type: 'review_received',
    title: 'New review',
    body: `${session.profile.name} left you a ${parsed.data.rating}-star review.`,
    link: '/dashboard',
  });
  
  revalidatePath(`/seller/${sellerId}`);
  return { ok: true };
}

export async function editReview(reviewId: string, formData: unknown) {
  const session = await requireAuth();
  const parsed = reviewSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from('reviews')
    .update({ rating: parsed.data.rating, text: parsed.data.text ?? null })
    .eq('id', reviewId)
    .eq('buyer_id', session.profile.id);
  
  if (error) return { error: error.message };
  revalidatePath('/account');
  return { ok: true };
}

export async function replyToReview(reviewId: string, formData: unknown) {
  const session = await requireAuth();
  const parsed = reviewReplySchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  
  const supabase = await createServerSupabase();
  const { data: review } = await supabase
    .from('reviews')
    .select('seller_id, buyer_id, seller_reply')
    .eq('id', reviewId)
    .single();
  
  if (!review || review.seller_id !== session.profile.id) {
    return { error: 'Not allowed' };
  }
  if (review.seller_reply) {
    return { error: 'You can only reply once' };
  }
  
  const { error } = await supabase
    .from('reviews')
    .update({ seller_reply: parsed.data.reply, seller_replied_at: new Date().toISOString() })
    .eq('id', reviewId);
  
  if (error) return { error: error.message };
  
  await createNotification({
    userId: review.buyer_id,
    type: 'review_reply',
    title: 'Seller replied to your review',
    body: parsed.data.reply.slice(0, 100),
    link: '/account',
  });
  
  revalidatePath('/dashboard');
  return { ok: true };
}

export async function reportReview(reviewId: string, reason: string, details ? : string) {
  const session = await requireAuth();
  const supabase = await createServerSupabase();
  
  const { data: review } = await supabase
    .from('reviews')
    .select('seller_id')
    .eq('id', reviewId)
    .single();
  
  if (!review) return { error: 'Review not found' };
  
  const reporterRole = review.seller_id === session.profile.id ? 'seller' : 'buyer';
  
  const { error } = await supabase.from('reports').insert({
    reporter_id: session.profile.id,
    reporter_role: reporterRole,
    target_type: 'review',
    target_id: reviewId,
    reason,
    details: details ?? null,
  });
  
  if (error) return { error: error.message };
  return { ok: true };
}