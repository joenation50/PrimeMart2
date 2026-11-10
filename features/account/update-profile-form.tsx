// features/account/update-profile-form.tsx
'use client';

import { useState } from 'react';
import { updateProfile } from '@/actions/account';
import type { User } from '@/types';
import { Loader2 } from 'lucide-react';

export function UpdateProfileForm({ user }: { user: User }) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '');
  const [message, setMessage] = useState < { type: 'success' | 'error';text: string } | null > (null);
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    const result = await updateProfile({ name, phone });
    
    if (result.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    }
    setLoading(false);
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div className={`rounded-lg p-3 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <input
          type="email"
          disabled
          value={user.email || ''}
          className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground"
        />
      </div>
      
      <div>
        <label className="mb-1 block text-sm font-medium">Full Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-foreground"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Phone Number</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-foreground"
          placeholder="Optional"
        />
      </div>

      <button
        type="submit"
        disabled={loading || (name === user.name && phone === (user.phone || ''))}
        className="flex items-center justify-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save changes'}
      </button>
    </form>
  );
}