'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Store, Loader2, CheckCircle2, UploadCloud, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export default function AdminStoreSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [profile, setProfile] = useState({
    real_name: 'PrimeMart Official',
    business_name: 'PrimeMart Official',
    bio: 'The official store of PrimeMart.',
    based_city: 'Lagos',
    based_country: 'NG',
    avatar_url: ''
  });

  useEffect(() => {
    async function loadProfile() {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: seller } = await supabase.from('seller_profiles').select('*').eq('user_id', user.id).maybeSingle();
      const { data: userData } = await supabase.from('users').select('name').eq('id', user.id).maybeSingle();
      
      if (seller) {
        setProfile({
          real_name: seller.real_name || userData?.name || 'PrimeMart Official',
          business_name: seller.business_name || 'PrimeMart Official',
          bio: seller.bio || '',
          based_city: seller.based_city || 'Lagos',
          based_country: seller.based_country || 'NG',
          avatar_url: seller.avatar_url || ''
        });
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg('');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'primemart_preset');

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/za4q8nqh/image/upload`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      if (data.secure_url) {
        setProfile(prev => ({ ...prev, avatar_url: data.secure_url }));
      } else {
        setErrorMsg('Cloudinary Error: ' + (data.error?.message || 'Upload failed'));
      }
    } catch (err) {
      setErrorMsg('Image upload failed. Check your connection.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setErrorMsg('');
    
    const supabase = createBrowserSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // HARDCODED based_country and based_city to prevent NULL errors
    const { error } = await supabase.from('seller_profiles').upsert({
      user_id: user.id,
      real_name: profile.real_name || 'PrimeMart Official',
      business_name: profile.business_name,
      bio: profile.bio,
      based_city: 'Lagos',
      based_country: 'NG',
      avatar_url: profile.avatar_url
    }, { onConflict: 'user_id' });

    if (error) {
      setErrorMsg("Database Error: " + error.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setSuccess(true);
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-xl"><Store className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Store Settings</h1>
          <p className="text-sm text-muted-foreground">This is how your official store appears to buyers.</p>
        </div>
      </div>

      {success && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-green-500/10 p-4 text-green-500">
          <CheckCircle2 className="h-5 w-5" /> Store profile saved successfully!
        </div>
      )}
      {errorMsg && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-500/10 p-4 text-red-500">
          <AlertCircle className="h-5 w-5" /> {errorMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="glass-card rounded-2xl p-6 md:p-8 space-y-6">
        
        <div className="flex items-center gap-6">
          <div className="relative h-24 w-24 overflow-hidden rounded-full bg-secondary flex items-center justify-center border border-border">
            {profile.avatar_url ? (
              <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" />
            ) : (
              <Store className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div>
            <label className="cursor-pointer rounded-xl bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80 flex items-center gap-2">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
              {uploading ? 'Uploading...' : 'Upload Logo'}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </label>
            <p className="text-xs text-muted-foreground mt-2">JPG, PNG max 5MB.</p>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Business Name</label>
          <input type="text" required value={profile.business_name} onChange={e => setProfile({...profile, business_name: e.target.value})} className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm outline-none focus:border-primary" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Bio</label>
          <textarea rows={4} value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm outline-none focus:border-primary resize-none" />
        </div>

        <button type="submit" disabled={saving || uploading} className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Store Settings'}
        </button>
      </form>
    </div>
  );
}