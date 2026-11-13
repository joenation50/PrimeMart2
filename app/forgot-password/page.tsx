'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createBrowserSupabase();
    
    // Send the reset email. The link will redirect them to our /reset-password page
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-[90vh] items-center justify-center px-4 py-12">
      <div className="glass-card w-full max-w-md rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-primary/10 blur-[50px] pointer-events-none" />

        <div className="relative z-10">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to login
          </Link>

          {success ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Check your email</h2>
              <p className="text-sm text-muted-foreground mb-8">
                We sent a password reset link to <span className="font-semibold text-foreground">{email}</span>. Click the link to set a new password.
              </p>
            </div>
          ) : (
            <>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2 text-center">Reset your password</h1>
              <p className="text-sm text-muted-foreground text-center mb-8">
                Enter the email associated with your account and we'll send you a link to reset your password.
              </p>

              {error && (
                <div className="mb-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Email address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="you@example.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send reset link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}