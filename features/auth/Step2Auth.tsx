'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import type { SignupData } from './SignupFlow';

export function Step2Auth({
  data,
  updateData,
  onNext,
  onBack,
}: {
  data: SignupData;
  updateData: (d: Partial<SignupData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // We just move to the next step. The actual account creation happens in Step 4.
    onNext();
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Create your login</h2>
        <p className="text-sm text-muted-foreground">Use an email and password.</p>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      <form onSubmit={handleAuth} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={data.email}
            onChange={(e) => updateData({ email: e.target.value })}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-foreground"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input
            type="password"
            required
            value={data.password}
            onChange={(e) => updateData({ password: e.target.value })}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-foreground"
            placeholder="At least 8 characters"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-lg bg-foreground py-2.5 text-sm font-medium text-background disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Continue'}
        </button>
      </form>

      <button
        onClick={onBack}
        className="mt-4 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back
      </button>
    </div>
  );
}