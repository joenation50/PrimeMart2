'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loginAction, signupAction } from '@/app/actions/auth';
import { Loader2 } from 'lucide-react';

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/dashboard';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = mode === 'login' 
      ? await loginAction(formData) 
      : await signupAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
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
        <div className="mb-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="space-y-5">
        <input type="hidden" name="next" value={next} />
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Email</label>
          <input
            type="email"
            name="email"
            required
            className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="you@example.com"
          />
        </div>
        
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Password</label>
          <input
            type="password"
            name="password"
            required
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