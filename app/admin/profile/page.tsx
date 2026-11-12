'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Store, Loader2, CheckCircle2, UploadCloud } from 'lucide-react';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';

export default function AdminProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [profile, setProfile] = useState({
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

      const { data } = await supabase.from('seller_profiles').select('*').eq('user_id', user.id).maybeSingle();
      
      if (data) {
        setProfile({
          business_name: data.business_name || '',
          bio: data.bio || '',
          based_city: data.based_city || '',
          based_country: data.based_country || 'NG',
          avatar_url: data.avatar_url || ''
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
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 800 });
      
      const sigRes = await fetch('/api/cloudinary/sign', { method: 'POST' });
      const sigData = await sigRes.json();

      const uploadData = new FormData();
      uploadData.append('file', compressed);
      uploadData.append('api_key', sigData.apiKey);
      uploadData.append('timestamp', sigData.timestamp.toString());
      uploadData.append('signature', sigData.signature);
      uploadData.append('folder', 'primemart/avatars');

      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`, {
        method: 'POST',
        body: uploadData,
      });
      
      const cloudData = await cloudRes.json();
      if (cloudRes.ok) {
        setProfile({ ...profile, avatar_url: cloudData.public_id });
      }
    } catch (err) {
      alert('Image upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    const supabase = createBrowserSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('seller_profiles').upsert({
      user_id: user.id,
      business_name: profile.business_name,
      bio: profile.bio,
      based_city: profile.based_city,
      based_country: profile.based_country,
      avatar_url: profile.avatar_url
    }, { onConflict: 'user_id' });

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
        
        {/* Avatar Upload */}
        <div className="flex items-center gap-6">
          <div className="relative h-24 w-24 overflow-hidden rounded-full bg-secondary flex items-center justify-center border border-border">
            {profile.avatar_url ? (
              <Image 
                src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_200,h_200,c_fill,r_max,q_auto,f_auto/${profile.avatar_url}`} 
                alt="Avatar" fill className="object-cover" 
              />
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
            <p className="text-xs text-muted-foreground mt-2">JPG, PNG max 1MB.</p>
          </div>
        </div>

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

        <button type="submit" disabled={saving || uploading} className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Store Profile'}
        </button>
      </form>
    </div>
  );
}