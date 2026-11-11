'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PlusCircle, AlertCircle, Lock, Eye, MessageCircle } from 'lucide-react';
import type { User, Listing } from '@/types';
import { ListingRow } from './ListingRow';

export function DashboardView({ user, initialListings }: { user: User; initialListings: Listing[] }) {
  const [listings] = useState(initialListings);

  const totalViews = listings.reduce((sum, l) => sum + (l.view_count || 0), 0);
  const totalClicks = listings.reduce((sum, l) => sum + (l.click_count || 0), 0);
  
  const isUnpaid = user.seller_status === 'unpaid' || user.seller_status === 'pending';
  const isLapsed = user.seller_status === 'lapsed';
  const isLocked = isUnpaid || isLapsed;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient background glows for the glass effect */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

      <div className="container relative z-10 mx-auto max-w-6xl px-4 py-8 animate-fade-in">
        
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.name}</p>
          </div>
          
          <Link
            href={isLocked ? '/paywall' : '/listings/new'}
            className={`flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all ${
              isLocked 
                ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                : 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105'
            }`}
          >
            {isLocked ? <Lock className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
            {isLocked ? 'Pay to Publish' : 'Add New Listing'}
          </Link>
        </div>

        {/* Alert Banners */}
        {isLocked && (
          <div className="mb-8 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-6 text-blue-500 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <AlertCircle className="h-6 w-6" />
              Account Inactive
            </div>
            <p className="mt-2 text-sm opacity-90">
              You need an active subscription to publish listings. You can browse the marketplace, but you cannot sell until your payment is confirmed.
            </p>
            <Link 
              href="/paywall" 
              className="mt-4 inline-flex items-center justify-center rounded-full bg-blue-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-600"
            >
              Pay Subscription
            </Link>
          </div>
        )}

        {/* Glass Stats Cards */}
        <div className={`grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8 ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="glass-card rounded-2xl p-6">
            <p className="text-sm font-medium text-muted-foreground">Active Listings</p>
            <p className="mt-2 text-4xl font-bold text-foreground">{listings.filter(l => l.status === 'active').length}</p>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <p className="text-sm font-medium text-muted-foreground">Total Views</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-4xl font-bold text-foreground">{totalViews}</p>
              <Eye className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <p className="text-sm font-medium text-muted-foreground">WhatsApp Clicks</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-4xl font-bold text-primary">{totalClicks}</p>
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

        {/* Listings List wrapped in glass */}
        <div className={`glass-card rounded-2xl overflow-hidden ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="border-b border-border px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Your Listings</h2>
            {isLocked && <span className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Lock className="h-3 w-3" /> Locked</span>}
          </div>
          
          {listings.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg font-medium text-foreground">No listings yet</p>
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
    </div>
  );
}