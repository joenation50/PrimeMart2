'use client';

import { useState, useTransition } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import { adminLogin } from '@/actions/admin';

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    startTransition(async () => {
      const result = await adminLogin(email, password);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="w-full text-foreground">
      <div className="mb-8 flex flex-col items-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
          <Lock className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold">Admin Access</h1>
        <p className="text-sm text-muted-foreground">PrimeMart Control Center</p>
      </div>

      {error && <div className="mb-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">{error}</div>}

      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Admin Email</label>
          <input 
            type="email" 
            name="email"
            required 
            className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary" 
            placeholder="admin@primemart.com"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Password</label>
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
          disabled={isPending} 
          className="mt-2 flex w-full items-center justify-center rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50 shadow-lg shadow-primary/20"
        >
          {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign In'}
        </button>
      </form>
    </div>
  );
}