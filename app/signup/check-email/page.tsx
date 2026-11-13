'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Mail, Loader2, ArrowLeft, CheckCircle2, RefreshCw } from 'lucide-react';
import Link from 'next/link';

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || 'your email';

  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleResend() {
    setResending(true);
    setResent(false);
    const supabase = createBrowserSupabase();

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (!error) {
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    }
    setResending(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="glass-card w-full max-w-md rounded-3xl p-8 text-center relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-primary/10 blur-[50px] pointer-events-none" />

        <div className="relative z-10">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-10 w-10 text-primary" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">Check your email</h1>
          <p className="text-sm text-muted-foreground mb-6">
            We sent a verification link to <br />
            <span className="font-semibold text-foreground">{email}</span>
          </p>

          <div className="rounded-2xl bg-secondary/50 p-4 text-sm text-left mb-8 border border-border">
            <p className="font-semibold text-foreground mb-2">Next steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Open your email inbox</li>
              <li>Click the verification link we sent you</li>
              <li>You will be redirected to PrimeMart to finish setting up your account</li>
            </ol>
          </div>

          {resent && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-green-500/10 p-3 text-sm text-green-500">
              <CheckCircle2 className="h-4 w-4 shrink-0" /> Email resent successfully!
            </div>
          )}

          <button
            onClick={handleResend}
            disabled={resending}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-border py-3.5 text-sm font-semibold hover:bg-secondary transition-colors disabled:opacity-50 mb-4"
          >
            {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {resending ? 'Resending...' : "Didn't get the email? Resend"}
          </button>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <CheckEmailContent />
    </Suspense>
  );
}