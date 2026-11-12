'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import Link from 'next/link';
import { Heart, Store, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

export default function BuyerPage() {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');

  useEffect(() => {
    async function getUser() {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) { window.location.href = '/login'; return; }

      const { data: profile } = await supabase.from('users').select('name, role').eq('id', user.id).single();
      
      if (profile?.role === 'admin') {
        window.location.href = '/admin';
      } else if (profile?.role === 'seller') {
        window.location.href = '/seller';
      } else {
        setName(profile?.name || 'Buyer');
        setLoading(false);
      }
    }
    getUser();
  }, []);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16 min-h-[80vh] pb-32">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-foreground">Welcome, {name}</h1>
        <p className="text-muted-foreground">This is your buyer dashboard.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/buyer/favorites" className="glass-card group rounded-3xl p-8 transition-all hover:-translate-y-1 hover:border-primary/50">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-background border border-border shadow-sm">
            <Heart className="h-6 w-6 text-primary" />
          </div>
          <h2 className="mb-2 text-2xl font-medium text-foreground">Saved Items</h2>
          <p className="text-muted-foreground mb-6">View the products you've saved for later.</p>
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            View Favorites <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        <Link href="/buyer/upgrade" className="glass-card group rounded-3xl p-8 transition-all hover:-translate-y-1 hover:border-primary/50 bg-primary/5">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Store className="h-6 w-6" />
          </div>
          <h2 className="mb-2 text-2xl font-medium text-foreground">Start Selling</h2>
          <p className="text-muted-foreground mb-6">Join verified sellers and reach thousands of buyers.</p>
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            Become a Seller <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>

      <div className="mt-10 glass-card rounded-2xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-green-500" />
          <div>
            <p className="font-medium text-foreground">Account Status</p>
            <p className="text-sm text-muted-foreground">Verified Buyer</p>
          </div>
        </div>
      </div>
    </div>
  );
}