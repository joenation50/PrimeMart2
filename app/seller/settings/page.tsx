'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Settings, Loader2, CheckCircle2, ArrowLeft, Upload, Store, AlertCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

// Fallback categories so the UI never breaks
const FALLBACK_CATEGORIES = [
  'Fashion', 'Electronics', 'Gadgets', 'Home', 'Services', 
  'Vehicles', 'Transport', 'Food', 'Beauty', 'Health', 'Tutorials', 'Others'
];

export default function SellerSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [dbCategories, setDbCategories] = useState<string[]>(FALLBACK_CATEGORIES);

  const [profile, setProfile] = useState({ 
    business_name: '', 
    whatsapp: '',
    logo_url: '',
    store_slug: '',
    bio: '',
    based_city: '',
    categories: [] as string[]
  });

  useEffect(() => {
    async function loadProfile() {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch categories
      const { data: cats } = await supabase.from('categories').select('name').eq('active', true);
      if (cats && cats.length > 0) {
        setDbCategories(cats.map(c => c.name));
      }

      // Fetch profile
      const { data: seller } = await supabase.from('seller_profiles').select('*').eq('user_id', user.id).maybeSingle();
      const { data: userData } = await supabase.from('users').select('phone, store_slug').eq('id', user.id).single();

      setProfile({ 
        business_name: seller?.business_name || '', 
        whatsapp: userData?.phone || '',
        logo_url: seller?.logo_url || '',
        store_slug: userData?.store_slug || '',
        bio: seller?.bio || '',
        based_city: seller?.based_city || '',
        categories: seller?.categories || []
      });
      setLoading(false);
    }
    loadProfile();
  }, []);

  function toggleCategory(catName: string) {
    setProfile(prev => {
      const isSelected = prev.categories.includes(catName);
      if (isSelected) return { ...prev, categories: prev.categories.filter(c => c !== catName) };
      if (prev.categories.length >= 5) return prev; // max 5
      return { ...prev, categories: [...prev.categories, catName] };
    });
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'primemart_preset'); 

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/za4q8nqh/image/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.secure_url) setProfile(prev => ({ ...prev, logo_url: data.secure_url }));
    } catch (err) {
      setErrorMsg('Failed to upload image.');
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

    const baseSlug = profile.business_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const { data: existing } = await supabase.from('users').select('id').eq('store_slug', baseSlug).neq('id', user.id).maybeSingle();
    const finalSlug = existing ? `${baseSlug}-${Math.floor(Math.random() * 1000)}` : baseSlug;

    const { error: profileError } = await supabase.from('seller_profiles').upsert({ 
      user_id: user.id,
      business_name: profile.business_name,
      logo_url: profile.logo_url,
      bio: profile.bio,
      based_city: profile.based_city,
      based_country: 'NG',
      categories: profile.categories
    }, { onConflict: 'user_id' });

    if (profileError) return setErrorMsg(profileError.message), setSaving(false);

    const { error: userError } = await supabase.from('users').update({ phone: profile.whatsapp, store_slug: finalSlug }).eq('id', user.id);
    if (userError) return setErrorMsg(userError.message), setSaving(false);

    setProfile(prev => ({ ...prev, store_slug: finalSlug }));
    setSaving(false);
    setSuccess(true);
    router.refresh(); 
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 pb-32">
      <Link href="/seller" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"><ArrowLeft className="h-4 w-4" /> Back to Dashboard</Link>
      <h1 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3"><Settings className="h-8 w-8 text-primary" /> Store Settings</h1>
      
      {success && <div className="mb-6 flex items-center gap-2 rounded-xl bg-green-500/10 p-4 text-green-500"><CheckCircle2 className="h-5 w-5" /> Settings saved!</div>}
      {errorMsg && <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-500/10 p-4 text-red-500"><AlertCircle className="h-5 w-5" /> {errorMsg}</div>}

      <form onSubmit={handleSave} className="glass-card rounded-3xl p-8 space-y-6">
        
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="relative h-28 w-28 rounded-full border-4 border-background shadow-xl flex items-center justify-center overflow-hidden bg-secondary">
            {profile.logo_url ? <Image src={profile.logo_url} alt="Logo" fill className="object-cover" /> : <Store className="h-10 w-10 text-muted-foreground" />}
            {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="h-6 w-6 text-white animate-spin" /></div>}
          </div>
          <label className="cursor-pointer text-sm font-medium text-primary hover:underline flex items-center gap-2">
            <Upload className="h-4 w-4" /> Change Logo
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-foreground">Business Name</label>
            <input required value={profile.business_name} onChange={e => setProfile({...profile, business_name: e.target.value})} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-foreground">WhatsApp</label>
            <input required value={profile.whatsapp} onChange={e => setProfile({...profile, whatsapp: e.target.value})} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-foreground">Location</label>
          <input required value={profile.based_city} onChange={e => setProfile({...profile, based_city: e.target.value})} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" placeholder="e.g. Alpha Hostel" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-foreground">Bio / Description</label>
          <textarea required rows={3} value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary resize-none" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-foreground">Categories (Max 5)</label>
          <div className="flex flex-wrap gap-2">
            {dbCategories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors border",
                  profile.categories.includes(cat) ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:bg-secondary"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving || uploading} className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-50 flex justify-center items-center gap-2">
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}