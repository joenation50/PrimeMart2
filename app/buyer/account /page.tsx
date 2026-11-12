'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import { Loader2, LogOut, Copy, Check, Store } from 'lucide-react';
import Link from 'next/link';

export default function BuyerAccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      const { data } = await supabase.from('users').select('*').eq('id', user.id).single();
      setProfile(data);
      setLoading(false);
    }
    loadProfile();
  }, [router]);

  async function handleSignOut() {
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  function copyCode() {
    navigator.clipboard.writeText(profile.seller_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-16 pb-32">
      <h1 className="text-3xl font-bold text-foreground mb-8">My Account</h1>
      <div className="space-y-6">
        <div className="glass-card rounded-3xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">{profile?.name?.charAt(0).toUpperCase()}</div>
            <div><h2 className="text-xl font-semibold">{profile?.name}</h2><p className="text-muted-foreground">{profile?.email}</p></div>
          </div>
          <div className="rounded-xl bg-secondary/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Your Buyer Code</p>
            <div className="flex items-center justify-between">
              <code className="font-mono text-lg font-bold">{profile?.seller_code}</code>
              <button onClick={copyCode} className="text-muted-foreground hover:text-foreground">{copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}</button>
            </div>
          </div>
        </div>

        {profile?.role === 'buyer' && (
          <Link href="/buyer/upgrade" className="glass-card rounded-3xl p-8 flex items-center justify-between hover:border-primary/50 transition-all">
            <div><h3 className="font-semibold flex items-center gap-2"><Store className="h-5 w-5 text-primary" /> Become a Seller</h3><p className="text-sm text-muted-foreground mt-1">Pay ₦5,000/year to start listing products.</p></div>
          </Link>
        )}

        <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 rounded-2xl border border-red-500/20 py-4 text-red-500 font-medium hover:bg-red-500/10 transition-colors">
          <LogOut className="h-5 w-5" /> Sign Out
        </button>
      </div>
    </div>
  );
}