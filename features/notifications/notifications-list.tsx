// features/notifications/notifications-list.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { markAllNotificationsRead, markNotificationRead } from '@/actions/social';
import { formatDistanceToNow } from 'date-fns';
import { Bell, ShieldCheck, CreditCard } from 'lucide-react';
import type { Notification } from '@/types';
import { cn } from '@/lib/utils';

export function NotificationsList({ initialNotifications }: { initialNotifications: Notification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const hasUnread = notifications.some((n) => !n.read_at);
  
  async function markAllRead() {
    setNotifications(notifications.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
    await markAllNotificationsRead();
  }
  
  async function markRead(id: string) {
    setNotifications(notifications.map((n) => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    await markNotificationRead(id);
  }
  
  const getIcon = (type: string) => {
    if (type.includes('payment')) return <CreditCard className="h-5 w-5 text-green-500" />;
    if (type.includes('review')) return <ShieldCheck className="h-5 w-5 text-blue-500" />;
    return <Bell className="h-5 w-5 text-muted-foreground" />;
  };
  
  return (
    <div className="space-y-4">
      {hasUnread && (
        <div className="flex justify-end">
          <button onClick={markAllRead} className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Mark all as read
          </button>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-border py-16 text-center text-muted-foreground">
          You don't have any notifications yet.
        </div>
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border bg-background">
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={n.link || '#'}
              onClick={() => !n.read_at && markRead(n.id)}
              className={cn(
                'flex gap-4 p-4 transition hover:bg-muted/50',
                !n.read_at && 'bg-muted/20'
              )}
            >
              <div className="mt-1 shrink-0">{getIcon(n.type)}</div>
              <div className="flex-1">
                <p className={cn('text-sm', !n.read_at && 'font-semibold')}>{n.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </p>
              </div>
              {!n.read_at && <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}