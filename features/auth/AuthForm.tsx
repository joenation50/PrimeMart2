'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Loader2 } from 'lucide-react';

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserSupabase();

  async function handlePasswordAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (mode === 'signup') {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setMagicLinkSent(true);
        return;
      }
    }

    router.push(next);
    router.refresh();
  }

  async function handleMagicLink() {
    if (!email) {
      setError('Please enter your email first');
      return;
    }
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${next}` },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setMagicLinkSent(true);
      setLoading(false);
    }
  }

  if (magicLinkSent) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-border bg-background p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold">Check your inbox</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a secure login link to <strong>{email}</strong>. Click the link to continue.
        </p>
        <button
          onClick={() => setMagicLinkSent(false)}
          className="mt-6 text-sm font-medium underline underline-offset-4"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-background p-8 shadow-sm">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">
          {mode === 'login' ? 'Welcome back' : 'Create an account'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === 'login' ? 'Sign in to your PrimeMart account' : 'Join PrimeMart today'}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handlePasswordAuth} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-foreground"
            placeholder="you@example.com"
          />
        </div>
        
        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-foreground"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-lg bg-foreground py-2.5 text-sm font-medium text-background disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        onClick={handleMagicLink}
        disabled={loading || !email}
        className="w-full rounded-lg border border-border py-2.5 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
      >
        Email me a login link
      </button>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {mode === 'login' ? (
          <>Don&apos;t have an account? <Link href="/signup" className="font-medium text-foreground hover:underline">Sign up</Link></>
        ) : (
          <>Already have an account? <Link href="/login" className="font-medium text-foreground hover:underline">Sign in</Link></>
        )}
      </p>
    </div>
  );
}