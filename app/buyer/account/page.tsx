'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import {
  Loader2, LogOut, Copy, Check, Mail, Phone, ShieldCheck,
  AlertCircle, RefreshCw, ArrowRight, Store,
} from 'lucide-react';
import Link from 'next/link';

type Profile = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  seller_code: string | null;
  verification_level: string | null;
};

export default function BuyerAccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) { router.replace('/login'); return; }

      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, phone, role, seller_code, verification_level')
        .eq('id', user.id)
        .single();

      if (cancelled) return;
      if (error || !data) {
        setError(error?.message ?? 'Could not load your account.');
        setLoading(false);
        return;
      }
      if (data.role === 'seller') {
        router.replace('/seller/account');
        return;
      }
      setProfile(data as Profile);
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [router]);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  async function copyCode() {
    if (!profile?.seller_code) return;
    try {
      await navigator.clipboard.writeText(profile.seller_code);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = profile.seller_code;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16">
        <div className="glass-card rounded-3xl p-12 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
          <p className="text-muted-foreground mb-6">{error ?? 'Account not found.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            <RefreshCw className="h-4 w-4" /> Try again
          </button>
        </div>
      </div>
    );
  }

  const initial = (profile.name ?? profile.email ?? '?').charAt(0).toUpperCase();
  const isVerified = profile.verification_level === 'verified';

  return (
    <div className="container mx-auto max-w-3xl px-4 py-16 pb-32">
      <h1 className="text-3xl font-bold text-foreground mb-8">My Account</h1>

      <div className="space-y-6">
        {/* Identity */}
        <div className="glass-card rounded-3xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-semibold truncate">{profile.name ?? 'Unnamed user'}</h2>
                {isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    <ShieldCheck className="h-3 w-3" /> Verified
                  </span>
                )}
              </div>
              <p className="text-muted-foreground truncate">{profile.email ?? '—'}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl bg-secondary/50 p-3">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium truncate">{profile.email ?? '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-secondary/50 p-3">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium truncate">{profile.phone ?? 'Not set'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Your code */}
        <div className="glass-card rounded-2xl p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Your Buyer Code
          </p>
          {profile.seller_code ? (
            <>
              <div className="flex items-center justify-between gap-4 rounded-xl bg-secondary/50 p-4">
                <code className="font-mono text-lg font-bold truncate">{profile.seller_code}</code>
                <button
                  onClick={copyCode}
                  aria-label="Copy your code"
                  className="shrink-0 rounded-full p-2 text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
                >
                  {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Your unique identifier on PrimeMart. Use it when contacting support.
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Your code will appear here once it's been assigned.
            </p>
          )}
        </div>

        {/* Upgrade CTA */}
        <Link
          href="/buyer/upgrade"
          className="glass-card rounded-2xl p-6 flex items-center justify-between gap-4 hover:bg-secondary/50 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Become a Seller</p>
              <p className="text-sm text-muted-foreground">Start selling on PrimeMart today</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
        </Link>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full flex items-center justify-center gap-2 rounded-2xl border border-red-500/20 py-4 text-red-500 font-medium hover:bg-red-500/10 transition-colors disabled:opacity-50"
        >
          {signingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5" />}
          {signingOut ? 'Signing out…' : 'Sign Out'}
        </button>
      </div>
    </div>
  );
}