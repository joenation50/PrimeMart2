'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Settings, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SellerSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState({ business_name: '', whatsapp: '' });

  useEffect(() => {
    async function loadProfile() {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: seller } = await supabase.from('seller_profiles').select('*').eq('user_id', user.id).single();
      const { data: userData } = await supabase.from('users').select('phone').eq('id', user.id).single();

      setProfile({ business_name: seller?.business_name || '', whatsapp: userData?.phone || '' });
      setLoading(false);
    }
    loadProfile();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    const supabase = createBrowserSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('seller_profiles').update({ business_name: profile.business_name }).eq('user_id', user.id);
    await supabase.from('users').update({ phone: profile.whatsapp }).eq('id', user.id);

    setSaving(false);
    setSuccess(true);
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16 pb-32">
      <Link href="/seller" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"><ArrowLeft className="h-4 w-4" /> Back to Dashboard</Link>
      <h1 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3"><Settings className="h-8 w-8 text-primary" /> Store Settings</h1>
      
      {success && <div className="mb-6 flex items-center gap-2 rounded-xl bg-green-500/10 p-4 text-green-500"><CheckCircle2 className="h-5 w-5" /> Settings saved successfully!</div>}

      <form onSubmit={handleSave} className="glass-card rounded-3xl p-8 space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium">Business Name</label>
          <input type="text" required value={profile.business_name} onChange={e => setProfile({...profile, business_name: e.target.value})} className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm outline-none focus:border-primary" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">WhatsApp Number</label>
          <input type="text" required value={profile.whatsapp} onChange={e => setProfile({...profile, whatsapp: e.target.value})} className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm outline-none focus:border-primary" placeholder="+234 801 234 5678" />
        </div>
        <button type="submit" disabled={saving} className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}