// app/signup/page.tsx
import { SignupFlow } from '@/features/auth/SignupFlow';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export const metadata = {
  title: 'Create account · PrimeMart',
};

export default async function SignupPage() {
  const session = await getSession();
  if (session) redirect('/');
  
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="h-96 w-full max-w-md animate-pulse rounded-2xl bg-muted" />}>
        <SignupFlow />
      </Suspense>
    </div>
  );
}