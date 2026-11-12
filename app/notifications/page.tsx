'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Bell, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/format';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setNotifications(data || []);
      setLoading(false);
    }
    loadNotifications();
  }, []);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16 pb-32 min-h-screen">
      <h1 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
        <Bell className="h-8 w-8 text-primary" /> Notifications
      </h1>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : notifications.length === 0 ? (
        <div className="rounded-3xl border border-border glass-card py-24 text-center text-muted-foreground">
          You don't have any notifications yet.
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((n) => (
            <div key={n.id} className="glass-card rounded-2xl p-6">
              <h3 className="font-semibold text-foreground">{n.title}</h3>
              <p className="text-muted-foreground text-sm mt-1">{n.body}</p>
              <p className="text-xs text-muted-foreground mt-3">{formatDate(n.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}