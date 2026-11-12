'use client';

import { useEffect, useMemo, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import {
  Loader2, LogOut, Copy, Check, Store, Mail, Phone, ShieldCheck,
  Calendar, Clock, BarChart3, Package, ExternalLink, AlertCircle,
  RefreshCw, Share2, Eye
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

type Profile = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  seller_code: string | null;
  store_slug: string | null;
  seller_status: string | null;
  seller_expires_at: string | null;
  verification_level: string | null;
  seller_profiles: {
    business_name: string | null;
    logo_url: string | null;
  } | null;
};

const STATUS_TONE: Record<string, string> = {
  active:    'text-green-500 bg-green-500/10 border-green-500/20',
  unpaid:    'text-amber-500 bg-amber-500/10 border-amber-500/20',
  pending:   'text-amber-500 bg-amber-500/10 border-amber-500/20',
  expired:   'text-red-500 bg-red-500/10 border-red-500/20',
  suspended: 'text-red-500 bg-red-500/10 border-red-500/20',
};

export default function SellerAccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
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
        .select(`
          id, name, email, phone, role, seller_code, store_slug, 
          seller_status, seller_expires_at, verification_level,
          seller_profiles(business_name, logo_url)
        `)
        .eq('id', user.id)
        .single();

      if (cancelled) return;
      if (error || !data) {
        setError(error?.message ?? 'Could not load your account.');
        setLoading(false);
        return;
      }
      if (data.role !== 'seller') {
        router.replace('/buyer/account');
        return;
      }
      setProfile(data as unknown as Profile);
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [router]);

  const daysRemaining = useMemo(() => {
    if (!profile?.seller_expires_at) return null;
    const ms = new Date(profile.seller_expires_at).getTime() - Date.now();
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
  }, [profile?.seller_expires_at]);

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

  async function shareStore() {
    const identifier = profile?.store_slug || profile?.seller_code;
    if (!identifier) return;

    const url = `${window.location.origin}/store/${identifier}`;
    const data = {
      title: `${profile?.seller_profiles?.business_name ?? profile?.name ?? 'My'} store on PrimeMart`,
      text: 'Check out my store on PrimeMart',
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      /* silent */
    }
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

  const displayName = profile.seller_profiles?.business_name || profile.name || 'Unnamed seller';
  const logoUrl = profile.seller_profiles?.logo_url;
  const initial = displayName.charAt(0).toUpperCase();
  const isVerified = profile.verification_level === 'verified';
  const status = profile.seller_status ?? 'unknown';
  const needsRenewal =
    status === 'unpaid' ||
    status === 'expired' ||
    (status === 'active' && daysRemaining !== null && daysRemaining <= 30);

  const storeIdentifier = profile.store_slug || profile.seller_code;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-16 pb-32">
      
      {/* HEADER WITH PREVIEW BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Account</h1>
        
        {storeIdentifier && (
          <Link 
            href={`/store/${storeIdentifier}`} 
            target="_blank"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary/80 transition-colors border border-border"
          >
            <Eye className="h-4 w-4" /> Preview Store
          </Link>
        )}
      </div>

      <div className="space-y-6">
        {/* Identity */}
        <div className="glass-card rounded-3xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground overflow-hidden">
              {logoUrl ? (
                <Image src={logoUrl} alt={displayName} fill className="object-cover" />
              ) : (
                initial
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-semibold truncate">{displayName}</h2>
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

        {/* Seller code */}
        <div className="glass-card rounded-2xl p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Your Seller Code
          </p>
          {profile.seller_code ? (
            <>
              <div className="flex items-center justify-between gap-4 rounded-xl bg-secondary/50 p-4">
                <code className="font-mono text-lg font-bold truncate">{profile.seller_code}</code>
                <button
                  onClick={copyCode}
                  aria-label="Copy seller code"
                  className="shrink-0 rounded-full p-2 text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
                >
                  {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>
              <button
                onClick={shareStore}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-secondary transition-colors"
              >
                {shared ? <Check className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
                {shared ? 'Link copied' : 'Share store link'}
              </button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Your code will appear here once your account is active.
            </p>
          )}
        </div>

        {/* Subscription */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" /> Subscription
            </h3>
            <span className={cn(
              'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold capitalize',
              STATUS_TONE[status] ?? 'text-muted-foreground bg-secondary border-border',
            )}>
              {status}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Expires</p>
                <p className="text-sm font-medium">
                  {profile.seller_expires_at ? formatDate(profile.seller_expires_at) : '—'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Days remaining</p>
                <p className={cn(
                  'text-sm font-medium',
                  daysRemaining !== null && daysRemaining <= 0 && 'text-red-500',
                  daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 30 && 'text-amber-500',
                )}>
                  {daysRemaining === null ? '—' : daysRemaining > 0 ? `${daysRemaining} days` : 'Expired'}
                </p>
              </div>
            </div>
          </div>

          {needsRenewal && (
            <Link
              href="/seller/paywall"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <RefreshCw className="h-4 w-4" />
              {status === 'expired'
                ? 'Renew subscription'
                : status === 'unpaid'
                ? 'Complete payment'
                : 'Renew early'}
            </Link>
          )}
        </div>

        {/* Quick links */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/seller/listings" className="glass-card rounded-2xl p-5 hover:bg-secondary/50 transition-colors">
            <Package className="h-6 w-6 text-primary mb-3" />
            <p className="font-semibold text-foreground text-sm">My Listings</p>
          </Link>
          <Link href="/seller/analytics" className="glass-card rounded-2xl p-5 hover:bg-secondary/50 transition-colors">
            <BarChart3 className="h-6 w-6 text-primary mb-3" />
            <p className="font-semibold text-foreground text-sm">Analytics</p>
          </Link>
          
          {storeIdentifier ? (
            <Link href={`/store/${storeIdentifier}`} target="_blank" className="glass-card rounded-2xl p-5 hover:bg-secondary/50 transition-colors">
              <ExternalLink className="h-6 w-6 text-primary mb-3" />
              <p className="font-semibold text-foreground text-sm">Preview Store</p>
            </Link>
          ) : (
            <div className="glass-card rounded-2xl p-5 opacity-60">
              <ExternalLink className="h-6 w-6 text-muted-foreground mb-3" />
              <p className="font-semibold text-foreground text-sm">Preview Store</p>
            </div>
          )}
        </div>

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