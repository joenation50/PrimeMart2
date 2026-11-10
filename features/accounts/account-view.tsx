// features/account/account-view.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Copy, Check, Store, ShieldAlert, LogOut } from 'lucide-react';
import type { User } from '@/types';
import { createBrowserSupabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { UpdateProfileForm } from './update-profile-form';
import { NotificationPrefs } from './notification-prefs';

export function AccountView({ user }: { user: User }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  
  async function copyCode() {
    navigator.clipboard.writeText(user.seller_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  
  async function handleSignOut() {
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }
  
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Sidebar */}
        <div className="space-y-6 md:col-span-1">
          {/* Identity Card */}
          <div className="rounded-xl border border-border p-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted text-2xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="mt-4 font-medium">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            
            {user.role === 'admin' && (
              <span className="mt-2 inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                Admin
              </span>
            )}
            {user.role === 'seller' && (
              <span className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                Seller
              </span>
            )}
          </div>

          {/* Permanent Code */}
          <div className="rounded-xl border border-border p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Your Payment Reference
            </p>
            <div className="flex items-center justify-between rounded-lg bg-muted p-3">
              <code className="font-mono text-sm font-semibold">{user.seller_code}</code>
              <button onClick={copyCode} className="text-muted-foreground hover:text-foreground">
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Use this code in the transfer description when paying for your subscription.
            </p>
          </div>

          {/* Upgrade Card (Only for Buyers) */}
          {user.role === 'buyer' && (
            <div className="rounded-xl border border-border bg-gradient-to-br from-muted/50 to-background p-6">
              <h3 className="flex items-center gap-2 font-semibold">
                <Store className="h-5 w-5" /> Sell on PrimeMart
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                ₦5,000/year · Unlimited listings
              </p>
              <Link
                href="/paywall"
                className="mt-4 block w-full rounded-lg bg-foreground py-2 text-center text-sm font-medium text-background"
              >
                Become a Seller
              </Link>
            </div>
          )}

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-8 md:col-span-2">
          <div className="rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
            <UpdateProfileForm user={user} />
          </div>

          <div className="rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Notifications</h2>
            <NotificationPrefs currentPrefs={user.notification_preferences} />
          </div>
          
          <div className="rounded-xl border border-border p-6">
             <h2 className="text-lg font-semibold mb-4 text-red-600">Danger Zone</h2>
             <p className="text-sm text-muted-foreground mb-4">Once you delete your account, there is no going back. Please be certain.</p>
             <button className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                Delete Account
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}