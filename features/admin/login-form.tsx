'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { adminLogin } from '@/actions/admin';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await adminLogin(email, password);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-8 shadow-sm">
      <div className="mb-6 flex flex-col items-center">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-foreground">
          <Lock className="h-6 w-6 text-background" />
        </div>
        <h1 className="text-xl font-bold">Admin Access</h1>
        <p className="text-sm text-muted-foreground">PrimeMart Control Center</p>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Admin Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-foreground" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-foreground" />
        </div>
        <button type="submit" disabled={loading} className="w-full rounded-lg bg-foreground py-2.5 text-sm font-medium text-background disabled:opacity-50">
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}