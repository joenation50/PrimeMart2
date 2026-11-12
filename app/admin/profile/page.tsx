'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Store, Loader2, CheckCircle2 } from 'lucide-react';

export default function AdminProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState({
    business_name: 'PrimeMart Official',
    bio: 'The official store of PrimeMart.',
    based_city: 'Lagos',
    based_country: 'NG'
  });

  useEffect(() => {
    async function loadProfile() {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase.from('seller_profiles').select('*').eq('user_id', user.id).maybeSingle();
      
      if (data) {
        setProfile({
          business_name: data.business_name || '',
          bio: data.bio || '',
          based_city: data.based_city || '',
          based_country: data.based_country || 'NG'
        });
      }
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

    // Upsert means if they don't have a store yet, it creates one.
    await supabase.from('seller_profiles').upsert({
      user_id: user.id,
      business_name: profile.business_name,
      bio: profile.bio,
      based_city: profile.based_city,
      based_country: profile.based_country
    }, { onConflict: 'user_id' });

    // Make sure the admin user role is set to 'admin' and seller is 'active'
    await supabase.from('users').update({
      role: 'admin',
      seller_status: 'active'
    }).eq('id', user.id);

    setSaving(false);
    setSuccess(true);
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-xl"><Store className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Store Profile</h1>
          <p className="text-sm text-muted-foreground">This is how your official store appears on the marketplace.</p>
        </div>
      </div>

      {success && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-green-500/10 p-4 text-green-500">
          <CheckCircle2 className="h-5 w-5" /> Store profile saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="glass-card rounded-2xl p-6 md:p-8 space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium">Business / Store Name</label>
          <input type="text" required value={profile.business_name} onChange={e => setProfile({...profile, business_name: e.target.value})} className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm outline-none focus:border-primary" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Bio</label>
          <textarea rows={4} value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm outline-none focus:border-primary resize-none" placeholder="Tell buyers about your store..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium">City</label>
            <input type="text" value={profile.based_city} onChange={e => setProfile({...profile, based_city: e.target.value})} className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Country</label>
            <input type="text" value={profile.based_country} onChange={e => setProfile({...profile, based_country: e.target.value})} className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm outline-none focus:border-primary" />
          </div>
        </div>

        <button type="submit" disabled={saving} className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Store Profile'}
        </button>
      </form>
    </div>
  );
}