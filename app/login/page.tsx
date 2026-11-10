// app/login/page.tsx
import { AuthForm } from '@/features/auth/AuthForm';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export const metadata = {
  title: 'Sign in · PrimeMart',
};

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect('/');
  
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="h-96 w-full max-w-md animate-pulse rounded-2xl bg-muted" />}>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}