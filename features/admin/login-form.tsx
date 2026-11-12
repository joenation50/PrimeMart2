'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { createBrowserSupabase } from '@/lib/supabase-browser';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createBrowserSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error || !data.user) {
      setError('Invalid credentials');
      setLoading(false);
      return;
    }

    // Force database to make them admin
    await supabase.from('users').upsert({
      id: data.user.id,
      email: email,
      name: 'Admin',
      role: 'admin',
      seller_code: 'USR-ADMIN1',
      country: 'NG',
      country_locked: true,
      timezone: 'Africa/Lagos',
      auth_method: 'email',
      account_status: 'active',
      verification_level: 'verified'
    }, { onConflict: 'id' });

    window.location.href = '/admin';
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Admin Email</label>
          <input 
            type="email" 
            required 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary" 
            placeholder="admin@primemart.com"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Password</label>
          <input 
            type="password" 
            required 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary" 
            placeholder="••••••••"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading} 
          className="mt-2 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50 shadow-lg shadow-primary/20"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}