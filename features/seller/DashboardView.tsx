// features/seller/DashboardView.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PlusCircle, AlertCircle, Lock } from 'lucide-react';
import type { User, Listing } from '@/types';
import { ListingRow } from './ListingRow';

export function DashboardView({ user, initialListings }: { user: User;initialListings: Listing[] }) {
  const [listings] = useState(initialListings);
  
  const totalViews = listings.reduce((sum, l) => sum + l.view_count, 0);
  const totalClicks = listings.reduce((sum, l) => sum + l.click_count, 0);
  
  const isUnpaid = user.seller_status === 'unpaid' || user.seller_status === 'pending';
  const isLapsed = user.seller_status === 'lapsed';
  const isLocked = isUnpaid || isLapsed;
  
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.name}</p>
        </div>
        
        <Link
          href={isLocked ? '/paywall' : '/listings/new'}
          className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
            isLocked 
              ? 'bg-muted text-muted-foreground cursor-not-allowed' 
              : 'bg-foreground text-background'
          }`}
        >
          {isLocked ? <Lock className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
          {isLocked ? 'Pay to Publish' : 'Add New Listing'}
        </Link>
      </div>

      {isLocked && (
        <div className="mb-8 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50 p-6 text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <AlertCircle className="h-6 w-6" />
            Account Inactive
          </div>
          <p className="mt-2 text-sm opacity-90">
            You need an active subscription to publish listings. You can browse the marketplace, but you cannot sell until your payment is confirmed.
          </p>
          <Link 
            href="/paywall" 
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Pay Subscription
          </Link>
        </div>
      )}

      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8 ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="rounded-xl border border-border p-6">
          <p className="text-sm font-medium text-muted-foreground">Active Listings</p>
          <p className="mt-2 text-3xl font-bold">{listings.filter(l => l.status === 'active').length}</p>
        </div>
        <div className="rounded-xl border border-border p-6">
          <p className="text-sm font-medium text-muted-foreground">Total Views</p>
          <p className="mt-2 text-3xl font-bold">{totalViews}</p>
        </div>
        <div className="rounded-xl border border-border p-6">
          <p className="text-sm font-medium text-muted-foreground">WhatsApp Clicks</p>
          <p className="mt-2 text-3xl font-bold">{totalClicks}</p>
        </div>
      </div>

      <div className={`rounded-xl border border-border bg-background ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your Listings</h2>
          {isLocked && <span className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Lock className="h-3 w-3" /> Locked</span>}
        </div>
        
        {listings.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-lg font-medium">No listings yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {isLocked ? 'Pay your subscription to unlock publishing.' : 'Add your first item to start selling.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {listings.map((listing) => (
              <ListingRow key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}