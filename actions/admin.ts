'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase';
import { requireAdmin, verifyAdminCredentials } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';
import { createAdminMessage, createNotification } from '@/lib/notifications';

// ============================================================
// ADMIN LOGIN
// ============================================================
export async function adminLogin(email: string, password: string) {
  const result = await verifyAdminCredentials(email, password);
  if (!result.ok) return { error: result.error };

  const supabase = await createServerSupabase();
  const session = await supabase.auth.getUser();
  
  if (session.data.user) {
    await writeAuditLog({
      adminId: session.data.user.id,
      targetType: 'admin_login',
      targetId: session.data.user.id,
    });
  }

  redirect('/admin');
}

export async function adminLogout() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

// ============================================================
// PAYMENT APPROVAL
// ============================================================
export async function approvePayment(paymentId: string) {
  const session = await requireAdmin();
  const supabase = createAdminSupabase();

  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .single();

  if (!payment || payment.status !== 'pending_review') {
    return { error: 'Payment not found or already processed' };
  }

  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  await supabase
    .from('payments')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      reviewed_by: session.profile.id,
    })
    .eq('id', paymentId);

  await supabase
    .from('users')
    .update({
      role: 'seller',
      seller_status: 'active',
      seller_expires_at: expiresAt.toISOString(),
      verification_level: 'phone',
    })
    .eq('id', payment.seller_id);

  await supabase
    .from('listings')
    .update({ status: 'active' })
    .eq('seller_id', payment.seller_id)
    .eq('status', 'hidden');

  await createNotification({
    userId: payment.seller_id,
    type: 'payment_approved',
    title: 'Subscription active',
    body: 'Your PrimeMart seller subscription is now active. Start listing!',
    link: '/dashboard',
  });

  await writeAuditLog({
    adminId: session.profile.id,
    targetType: 'payment',
    targetId: paymentId,
    fieldChanged: 'status',
    oldValue: 'pending_review',
    newValue: 'approved',
  });

  revalidatePath('/admin');
  return { ok: true };
}

export async function rejectPayment(paymentId: string, reason: string) {
  const session = await requireAdmin();
  const supabase = createAdminSupabase();

  const { data: payment } = await supabase
    .from('payments')
    .select('seller_id, status')
    .eq('id', paymentId)
    .single();

  if (!payment || payment.status !== 'pending_review') {
    return { error: 'Payment not found or already processed' };
  }

  await supabase
    .from('payments')
    .update({
      status: 'rejected',
      reject_reason: reason,
      reviewed_by: session.profile.id,
    })
    .eq('id', paymentId);

  await supabase
    .from('users')
    .update({ seller_status: 'unpaid' })
    .eq('id', payment.seller_id);

  await createNotification({
    userId: payment.seller_id,
    type: 'payment_rejected',
    title: 'Payment rejected',
    body: reason,
    link: '/paywall',
  });

  await writeAuditLog({
    adminId: session.profile.id,
    targetType: 'payment',
    targetId: paymentId,
    fieldChanged: 'status',
    oldValue: 'pending_review',
    newValue: 'rejected',
    reason,
  });

  revalidatePath('/admin');
  return { ok: true };
}

// ============================================================
// USER MANAGEMENT
// ============================================================
export async function updateUserField(
  userId: string,
  field: string,
  newValue: string | null
) {
  const session = await requireAdmin();

  const protectedFields = ['seller_code', 'rating_avg', 'rating_count'];
  if (protectedFields.includes(field)) {
    return { error: 'This field is protected' };
  }

  const supabase = createAdminSupabase();

  const { data: before } = await supabase
    .from('users')
    .select(field)
    .eq('id', userId)
    .single();

  const { error } = await supabase
    .from('users')
    .update({ [field]: newValue })
    .eq('id', userId);

  if (error) return { error: error.message };

  // Cast before to any to fix the TypeScript index error
  const oldValue = before ? String((before as any)[field] ?? '') : '';

  await writeAuditLog({
    adminId: session.profile.id,
    targetType: 'user',
    targetId: userId,
    fieldChanged: field,
    oldValue: oldValue,
    newValue: String(newValue ?? ''),
  });

  revalidatePath(`/admin/users/${userId}`);
  return { ok: true };
}

export async function changeUserCountry(userId: string, newCountry: string) {
  const session = await requireAdmin();
  const supabase = createAdminSupabase();

  const { data: before } = await supabase
    .from('users')
    .select('country')
    .eq('id', userId)
    .single();

  await supabase
    .from('users')
    .update({ country: newCountry })
    .eq('id', userId);

  await writeAuditLog({
    adminId: session.profile.id,
    targetType: 'user',
    targetId: userId,
    fieldChanged: 'country',
    oldValue: before?.country ?? '',
    newValue: newCountry,
  });

  revalidatePath(`/admin/users/${userId}`);
  return { ok: true };
}

export async function extendSubscription(userId: string, days: number, reason: string) {
  const session = await requireAdmin();
  const supabase = createAdminSupabase();

  const { data: user } = await supabase
    .from('users')
    .select('seller_expires_at')
    .eq('id', userId)
    .single();

  const base = user?.seller_expires_at
    ? new Date(user.seller_expires_at)
    : new Date();
  base.setDate(base.getDate() + days);

  await supabase
    .from('users')
    .update({
      seller_status: 'active',
      seller_expires_at: base.toISOString(),
    })
    .eq('id', userId);

  await writeAuditLog({
    adminId: session.profile.id,
    targetType: 'user',
    targetId: userId,
    fieldChanged: 'seller_expires_at',
    newValue: base.toISOString(),
    reason,
  });

  revalidatePath(`/admin/users/${userId}`);
  return { ok: true };
}

export async function banUser(userId: string, reason: string) {
  const session = await requireAdmin();
  const supabase = createAdminSupabase();

  await supabase
    .from('users')
    .update({ account_status: 'banned' })
    .eq('id', userId);

  await supabase
    .from('listings')
    .update({ status: 'hidden' })
    .eq('seller_id', userId)
    .eq('status', 'active');

  await writeAuditLog({
    adminId: session.profile.id,
    targetType: 'user',
    targetId: userId,
    fieldChanged: 'account_status',
    newValue: 'banned',
    reason,
  });

  revalidatePath('/admin/users');
  return { ok: true };
}

export async function unbanUser(userId: string) {
  const session = await requireAdmin();
  const supabase = createAdminSupabase();

  await supabase
    .from('users')
    .update({ account_status: 'active' })
    .eq('id', userId);

  await writeAuditLog({
    adminId: session.profile.id,
    targetType: 'user',
    targetId: userId,
    fieldChanged: 'account_status',
    newValue: 'active',
  });

  revalidatePath('/admin/users');
  return { ok: true };
}

// ============================================================
// MESSAGING
// ============================================================
export async function sendAdminMessage(userId: string, subject: string, message: string) {
  const session = await requireAdmin();

  await createAdminMessage({
    userId,
    subject,
    message,
    adminId: session.profile.id,
  });

  return { ok: true };
}

// ============================================================
// REVIEWS
// ============================================================
export async function hideReview(reviewId: string, reason: string) {
  const session = await requireAdmin();
  const supabase = createAdminSupabase();

  const { data: review } = await supabase
    .from('reviews')
    .select('buyer_id, seller_id')
    .eq('id', reviewId)
    .single();

  await supabase
    .from('reviews')
    .update({
      status: 'hidden',
      hidden_reason: reason,
      hidden_by: session.profile.id,
      hidden_at: new Date().toISOString(),
    })
    .eq('id', reviewId);

  await supabase.from('review_moderation').insert({
    review_id: reviewId,
    admin_id: session.profile.id,
    action: 'hidden',
    reason,
  });

  if (review?.buyer_id) {
    await createNotification({
      userId: review.buyer_id,
      type: 'review_hidden',
      title: 'Review hidden',
      body: reason,
      link: '/account',
    });
  }

  await writeAuditLog({
    adminId: session.profile.id,
    targetType: 'review',
    targetId: reviewId,
    fieldChanged: 'status',
    newValue: 'hidden',
    reason,
  });

  revalidatePath('/admin/moderation');
  return { ok: true };
}

export async function restoreReview(reviewId: string) {
  const session = await requireAdmin();
  const supabase = createAdminSupabase();

  await supabase
    .from('reviews')
    .update({
      status: 'visible',
      hidden_reason: null,
      hidden_by: null,
      hidden_at: null,
    })
    .eq('id', reviewId);

  await supabase.from('review_moderation').insert({
    review_id: reviewId,
    admin_id: session.profile.id,
    action: 'restored',
  });

  revalidatePath('/admin/moderation');
  return { ok: true };
}

// ============================================================
// REPORTS
// ============================================================
export async function resolveReport(
  reportId: string,
  status: 'resolved' | 'dismissed' | 'reviewing',
  notes?: string
) {
  const session = await requireAdmin();
  const supabase = createAdminSupabase();

  await supabase
    .from('reports')
    .update({
      status,
      admin_notes: notes ?? null,
      resolved_by: session.profile.id,
      resolved_at: status === 'reviewing' ? null : new Date().toISOString(),
    })
    .eq('id', reportId);

  await writeAuditLog({
    adminId: session.profile.id,
    targetType: 'report',
    targetId: reportId,
    fieldChanged: 'status',
    newValue: status,
    reason: notes ?? null,
  });

  revalidatePath('/admin/moderation');
  return { ok: true };
}

// ============================================================
// BANNERS
// ============================================================
export async function createBanner(data: {
  type: string;
  image_url: string;
  headline: string;
  subtext?: string;
  cta_text?: string;
  cta_url?: string;
  priority?: number;
  dismissible?: boolean;
  starts_at?: string;
  ends_at?: string;
}) {
  const session = await requireAdmin();
  const supabase = createAdminSupabase();

  const { error } = await supabase.from('banners').insert({
    type: data.type,
    image_url: data.image_url,
    headline: data.headline,
    subtext: data.subtext ?? null,
    cta_text: data.cta_text ?? null,
    cta_url: data.cta_url ?? null,
    priority: data.priority ?? 0,
    dismissible: data.dismissible ?? true,
    starts_at: data.starts_at ?? new Date().toISOString(),
    ends_at: data.ends_at ?? null,
    created_by: session.profile.id,
  });

  if (error) return { error: error.message };
  revalidatePath('/admin/system');
  return { ok: true };
}

export async function toggleBanner(bannerId: string, active: boolean) {
  await requireAdmin();
  const supabase = createAdminSupabase();
  await supabase.from('banners').update({ active }).eq('id', bannerId);
  revalidatePath('/admin/system');
  return { ok: true };
}

export async function deleteBanner(bannerId: string) {
  await requireAdmin();
  const supabase = createAdminSupabase();
  await supabase.from('banners').delete().eq('id', bannerId);
  revalidatePath('/admin/system');
  return { ok: true };
}

// ============================================================
// CATEGORIES
// ============================================================
export async function createCategory(name: string, slug: string) {
  await requireAdmin();
  const supabase = createAdminSupabase();
  const { error } = await supabase.from('categories').insert({ name, slug });
  if (error) return { error: error.message };
  revalidatePath('/admin/content');
  return { ok: true };
}

export async function toggleCategory(categoryId: string, active: boolean) {
  await requireAdmin();
  const supabase = createAdminSupabase();
  await supabase.from('categories').update({ active }).eq('id', categoryId);
  revalidatePath('/admin/content');
  return { ok: true };
}