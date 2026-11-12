import { SignupFlow } from '@/features/auth/SignupFlow';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export const metadata = { title: 'Create account · PrimeMart' };

export default async function SignupPage() {
  const session = await getSession();
  // CHANGED: If already logged in, send to marketplace
  if (session) redirect('/marketplace');

  return (
    <div className="flex min-h-[90vh] flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-primary/20 blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-blue-500/20 blur-[100px]" />
      
      <div className="glass-card relative w-full max-w-md rounded-3xl p-2 z-10">
        <Suspense fallback={<div className="h-96 w-full animate-pulse rounded-2xl bg-muted" />}>
          <SignupFlow />
        </Suspense>
      </div>

      {/* The Glowing Sign In Button */}
      <div className="mt-8 z-10">
        <Link 
          href="/login" 
          className="group relative flex items-center justify-center gap-2 rounded-full border border-primary/50 bg-background/50 px-8 py-3 text-sm font-semibold text-foreground transition-all hover:scale-105 hover:border-primary"
        >
          <div className="absolute inset-0 -z-10 rounded-full bg-primary/40 blur-md animate-pulse" />
          <Sparkles className="h-4 w-4 text-primary" />
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  );
}