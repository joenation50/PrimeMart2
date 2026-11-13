'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Loader2, CheckCircle2 } from 'lucide-react';

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const intent = searchParams.get('intent') || 'browse';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    const supabase = createBrowserSupabase();
    
    if (mode === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      
      const { data: profile } = await supabase
        .from('users')
        .select('role, seller_status')
        .eq('id', data.user.id)
        .single();
      
      if (profile?.role === 'admin') {
        window.location.href = '/admin';
      } else if (profile?.role === 'seller') {
        if (profile.seller_status === 'unpaid' || profile.seller_status === 'pending') {
          window.location.href = '/seller/paywall';
        } else {
          window.location.href = '/seller';
        }
      } else {
        window.location.href = '/marketplace';
      }

    } else {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        const isSelling = intent === 'sell';
        
        await supabase.from('users').upsert({
          id: data.user.id,
          name: email.split('@')[0],
          email: email,
          role: isSelling ? 'seller' : 'buyer',
          seller_status: isSelling ? 'unpaid' : null,
          seller_code: `USR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          country: 'NG',
          country_locked: false,
          timezone: 'Africa/Lagos',
          auth_method: 'email',
          account_status: 'active',
          verification_level: 'none'
        }, { onConflict: 'id' });

        if (!data.session) {
          setSuccess(true);
          setTimeout(() => {
            router.push(`/signup/check-email?email=${encodeURIComponent(email)}`);
          }, 1500);
          return;
        }

        if (isSelling) {
          window.location.href = '/seller/paywall';
          return;
        }
      }
      
      window.location.href = '/marketplace';
    }
  }

  if (success) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in duration-300">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <h2 className="text-2xl font-bold text-foreground">Account Created!</h2>
        <p className="text-sm text-muted-foreground">Redirecting to email verification...</p>
        <Loader2 className="h-6 w-6 animate-spin text-primary mt-4" />
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl bg-transparent p-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          {mode === 'login' ? 'Welcome back' : 'Create an account'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === 'login' ? 'Sign in to your PrimeMart account' : 'Join PrimeMart today'}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="you@example.com"
          />
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-foreground">Password</label>
            {mode === 'login' && (
              <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                Forgot password?
              </Link>
            )}
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex w-full items-center justify-center rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        {mode === 'login' ? (
          <>Don&apos;t have an account? <Link href="/signup" className="font-semibold text-primary hover:underline">Sign up</Link></>
        ) : (
          <>Already have an account? <Link href="/login" className="font-semibold text-primary hover:underline">Sign in</Link></>
        )}
      </p>
    </div>
  );
}