'use server';

import { createServerSupabase } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function sendNotification(data: {
  target: 'all' | 'specific';
  userId?: string; // Changed from email to userId
  title: string;
  body: string;
}) {
  const session = await getSession();
  if (!session || session.profile.role !== 'admin') {
    return { error: 'Unauthorized' };
  }

  const supabase = await createServerSupabase();

  // 1. Send to a specific user
  if (data.target === 'specific') {
    if (!data.userId) return { error: 'Please select a user' };

    const { error } = await supabase.from('notifications').insert({
      user_id: data.userId,
      title: data.title,
      body: data.body,
    });

    if (error) return { error: error.message };
  }

  // 2. Send to everyone (Broadcast via Row Duplication)
  if (data.target === 'all') {
    const { data: users, error: usersError } = await supabase.from('users').select('id');
    if (usersError || !users) return { error: 'Failed to fetch users' };

    const notifications = users.map(u => ({
      user_id: u.id,
      title: data.title,
      body: data.body,
    }));

    const { error } = await supabase.from('notifications').insert(notifications);
    if (error) return { error: error.message };
  }

  revalidatePath('/admin/notifications');
  revalidatePath('/buyer/notifications');
  revalidatePath('/seller/notifications');
  
  return { ok: true };
}