'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { 
  Bell, ChevronRight, Loader2, ShoppingBag, 
  ShieldCheck, CheckCheck, Package 
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function BuyerNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNotifications() {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/login?redirect=/buyer/notifications');
        return;
      }
      setUserId(user.id);

      // Fetch notifications for this specific buyer
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setNotifications(data || []);
      setLoading(false);
    }
    fetchNotifications();
  }, [router]);

  async function markAsRead(id: string, link: string | null) {
    const supabase = createBrowserSupabase();
    
    // Optimistic UI update (feels instant to the user)
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );

    // Update DB
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);

    // If the notification has a link (e.g., to a product), navigate there
    if (link) {
      router.push(link);
    }
  }

  async function markAllAsRead() {
    if (!userId) return;
    const supabase = createBrowserSupabase();
    
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-background pb-32">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-background/90 px-4 py-4 backdrop-blur-md border-b border-border/50">
        <h1 className="text-xl font-black text-foreground flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" /> Notifications
        </h1>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
          >
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        )}
      </header>

      <div className="max-w-2xl mx-auto px-4 mt-6">
        {notifications.length === 0 ? (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center rounded-[2rem] border border-border bg-card py-24 px-6 text-center shadow-sm mt-10">
            <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-secondary border border-border">
              <Bell className="h-10 w-10 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-xl font-black text-foreground mb-2">You're all caught up!</h3>
            <p className="text-sm text-muted-foreground max-w-[280px]">
              When you get messages, order updates, or alerts, they will appear here.
            </p>
            <Link href="/marketplace" className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm">
              Start Shopping
            </Link>
          </div>
        ) : (
          /* NOTIFICATIONS LIST */
          <div className="space-y-3">
            {notifications.map((notif) => (
              <button
                key={notif.id}
                onClick={() => markAsRead(notif.id, notif.link)}
                className={cn(
                  "w-full flex items-start gap-4 p-4 rounded-2xl border transition-all text-left group",
                  notif.is_read 
                    ? "bg-card border-border hover:bg-secondary/50" 
                    : "bg-primary/5 border-primary/20 hover:bg-primary/10 shadow-sm"
                )}
              >
                {/* ICON */}
                <div className={cn(
                  "shrink-0 flex h-12 w-12 items-center justify-center rounded-full",
                  notif.is_read ? "bg-secondary text-muted-foreground" : "bg-primary/20 text-primary"
                )}>
                  {notif.title.toLowerCase().includes('order') ? <ShoppingBag className="h-5 w-5" /> :
                   notif.title.toLowerCase().includes('verify') ? <ShieldCheck className="h-5 w-5" /> :
                   notif.title.toLowerCase().includes('item') ? <Package className="h-5 w-5" /> :
                   <Bell className="h-5 w-5" />}
                </div>

                {/* CONTENT */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className={cn(
                      "text-sm font-bold truncate",
                      notif.is_read ? "text-foreground" : "text-primary"
                    )}>
                      {notif.title}
                    </h3>
                    <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
                      {formatDate(notif.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                </div>

                {/* ARROW / UNREAD DOT */}
                <div className="shrink-0 flex flex-col items-center justify-center h-full pt-2">
                  {!notif.is_read ? (
                    <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}