export async function markNotificationRead(notificationId: string) {
  const session = await getSession();
  if (!session) return { error: 'Not logged in' };
  
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', session.profile.id);
  
  if (error) return { error: error.message };

  revalidatePath('/buyer/notifications');
  revalidatePath('/seller/notifications');
  return { ok: true };
}

export async function markAllNotificationsRead() {
  const session = await getSession();
  if (!session) return { error: 'Not logged in' };
  
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', session.profile.id)
    .is('read_at', null);
  
  if (error) return { error: error.message };

  revalidatePath('/buyer/notifications');
  revalidatePath('/seller/notifications');
  return { ok: true };
}