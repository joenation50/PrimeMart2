// app/notifications/page.tsx
import { requireAuth } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase';
import { NotificationsList } from '@/features/notifications/notifications-list';
import type { Notification } from '@/types';

export const metadata = {
  title: 'Notifications · PrimeMart',
};

export default async function NotificationsPage() {
  const session = await requireAuth();
  const supabase = await createServerSupabase();
  
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', session.profile.id)
    .order('created_at', { ascending: false })
    .limit(50);
  
  const notifications = (data ?? []) as Notification[];
  
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Notifications</h1>
      <NotificationsList initialNotifications={notifications} />
    </div>
  );
}