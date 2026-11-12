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
      if (profile?.role === 'admin') window.location.href = '/admin';
      else if (profile?.role === 'seller') window.location.href = '/dashboard';
      else { setName(profile?.name || 'Buyer'); setLoading(false); }
    }
    getUser();
  }, []);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold">Welcome, {name}</h1>
      <p className="text-muted-foreground mb-8">This is your buyer dashboard.</p>
      {/* Add your buyer dashboard UI here */}
    </div>
  );
}