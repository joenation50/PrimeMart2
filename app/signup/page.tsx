import { SignupFlow } from '@/features/auth/SignupFlow';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export const metadata = { title: 'Create account · PrimeMart' };

export default async function SignupPage() {
  const session = await getSession();
  if (session) redirect('/');

  return (
    <div className="flex min-h-[90vh] items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-primary/20 blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-blue-500/20 blur-[100px]" />
      
      <div className="glass-card relative w-full max-w-md rounded-3xl p-2">
        <Suspense fallback={<div className="h-96 w-full animate-pulse rounded-2xl bg-muted" />}>
          <SignupFlow />
        </Suspense>
      </div>
    </div>
  );
}