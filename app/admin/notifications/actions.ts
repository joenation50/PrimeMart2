'use server';

import { createServerSupabase } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function sendNotification(data: {
  target: 'all' | 'specific';
  email?: string;
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
    if (!data.email) return { error: 'Email is required' };
    
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', data.email)
      .single();

    if (!user) return { error: 'User not found with that email' };

    const { error } = await supabase.from('notifications').insert({
      user_id: user.id,
      title: data.title,
      body: data.body,
    });

    if (error) return { error: error.message };
  }

  // 2. Send to everyone (Broadcast)
  if (data.target === 'all') {
    // Get all user IDs
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id');

    if (usersError || !users) return { error: 'Failed to fetch users' };

    // Create an array of notifications (one for each user)
    const notifications = users.map(u => ({
      user_id: u.id,
      title: data.title,
      body: data.body,
    }));

    // Insert them all at once
    const { error } = await supabase.from('notifications').insert(notifications);
    
    if (error) return { error: error.message };
  }

  revalidatePath('/admin/notifications');
  revalidatePath('/buyer/notifications');
  revalidatePath('/seller/notifications');
  
  return { ok: true };
}