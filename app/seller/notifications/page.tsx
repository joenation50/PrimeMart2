'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Bell, Loader2, CheckCheck, ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/format';
import { markNotificationRead, markAllNotificationsRead } from '@/actions/social';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function SellerNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    async function loadNotifications() {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // THE FIX: Fetch user's own OR general broadcasts (user_id is null)
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .order('created_at', { ascending: false });

      if (data) setNotifications(data);
      setLoading(false);
    }
    loadNotifications();
  }, []);

  async function handleMarkAll() {
    setMarkingAll(true);
    await markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
    setMarkingAll(false);
  }

  async function handleMarkOne(id: string) {
    await markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const hasUnread = notifications.some(n => !n.read_at);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16 pb-32 min-h-screen">
      <div className="mb-8">
        <Link href="/seller" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary" /> Notifications
          </h1>
          {hasUnread && (
            <button
              onClick={handleMarkAll}
              disabled={markingAll}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-50"
            >
              {markingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
              Mark all read
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-3xl border border-border glass-card py-24 text-center text-muted-foreground">
          You don't have any notifications yet.
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((n) => (
            <div 
              key={n.id} 
              onClick={() => !n.read_at && handleMarkOne(n.id)}
              className={cn(
                "glass-card rounded-2xl p-6 transition-colors",
                !n.read_at ? "border-primary/30 bg-primary/5 cursor-pointer hover:bg-primary/10" : ""
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  !n.read_at ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                )}>
                  <Bell className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={cn("font-semibold", !n.read_at ? "text-foreground" : "text-muted-foreground")}>
                      {n.title}
                    </h3>
                    {!n.read_at && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                  </div>
                  <p className="text-muted-foreground text-sm mt-1">{n.body}</p>
                  <p className="text-xs text-muted-foreground mt-3">{formatDate(n.created_at)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}