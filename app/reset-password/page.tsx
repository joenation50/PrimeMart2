'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const supabase = createBrowserSupabase();
    
    // Update the user's password
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-[90vh] items-center justify-center px-4 py-12">
      <div className="glass-card w-full max-w-md rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-primary/10 blur-[50px] pointer-events-none" />

        <div className="relative z-10">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Password Updated!</h2>
              <p className="text-sm text-muted-foreground mb-8">
                Your password has been successfully changed. Redirecting you to login...
              </p>
              <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
            </div>
          ) : (
            <>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2 text-center">Set new password</h1>
              <p className="text-sm text-muted-foreground text-center mb-8">
                Please enter your new password below.
              </p>

              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">New Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full items-center justify-center rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Update Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}