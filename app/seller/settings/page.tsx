'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Settings, Loader2, CheckCircle2, ArrowLeft, Upload, Store, AlertCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function SellerSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [profile, setProfile] = useState({ 
    business_name: '', 
    whatsapp: '',
    logo_url: '',
    store_slug: ''
  });

  useEffect(() => {
    async function loadProfile() {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: seller } = await supabase.from('seller_profiles').select('*').eq('user_id', user.id).single();
      const { data: userData } = await supabase.from('users').select('phone, store_slug').eq('id', user.id).single();

      setProfile({ 
        business_name: seller?.business_name || '', 
        whatsapp: userData?.phone || '',
        logo_url: seller?.logo_url || '',
        store_slug: userData?.store_slug || ''
      });
      setLoading(false);
    }
    loadProfile();
  }, []);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg('');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'primemart_preset'); 

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/e8631318e76538546a9852f30ec2f9/image/upload`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      if (data.secure_url) {
        setProfile(prev => ({ ...prev, logo_url: data.secure_url }));
      } else {
        setErrorMsg(data.error?.message || 'Upload failed');
      }
    } catch (err) {
      setErrorMsg('Failed to upload image. Check your connection.');
    }
    setUploading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setErrorMsg('');
    
    const supabase = createBrowserSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Generate slug from business name
    const baseSlug = profile.business_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check if slug exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('store_slug', baseSlug)
      .neq('id', user.id)
      .maybeSingle();

    const finalSlug = existing ? `${baseSlug}-${Math.floor(Math.random() * 1000)}` : baseSlug;

    // Update Seller Profile
    const { error: profileError } = await supabase.from('seller_profiles').update({ 
      business_name: profile.business_name,
      logo_url: profile.logo_url
    }).eq('user_id', user.id);

    if (profileError) {
      setErrorMsg(profileError.message);
      setSaving(false);
      return;
    }

    // Update User (Phone & Slug)
    const { error: userError } = await supabase.from('users').update({ 
      phone: profile.whatsapp,
      store_slug: finalSlug
    }).eq('id', user.id);

    if (userError) {
      setErrorMsg(userError.message);
      setSaving(false);
      return;
    }

    setProfile(prev => ({ ...prev, store_slug: finalSlug }));
    setSaving(false);
    setSuccess(true);
    router.refresh(); 
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16 pb-32">
      <Link href="/seller" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"><ArrowLeft className="h-4 w-4" /> Back to Dashboard</Link>
      <h1 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3"><Settings className="h-8 w-8 text-primary" /> Store Settings</h1>
      
      {success && <div className="mb-6 flex items-center gap-2 rounded-xl bg-green-500/10 p-4 text-green-500"><CheckCircle2 className="h-5 w-5" /> Settings saved successfully!</div>}
      {errorMsg && <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-500/10 p-4 text-red-500"><AlertCircle className="h-5 w-5" /> {errorMsg}</div>}

      <form onSubmit={handleSave} className="glass-card rounded-3xl p-8 space-y-6">
        
        {/* LOGO UPLOAD */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="relative h-28 w-28 rounded-full border-4 border-background shadow-xl flex items-center justify-center overflow-hidden bg-secondary">
            {profile.logo_url ? (
              <Image src={profile.logo_url} alt="Logo" fill className="object-cover" />
            ) : (
              <Store className="h-10 w-10 text-muted-foreground" />
            )}
            {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="h-6 w-6 text-white animate-spin" /></div>}
          </div>
          <label className="cursor-pointer text-sm font-medium text-primary hover:underline flex items-center gap-2">
            <Upload className="h-4 w-4" /> Upload Store Logo
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
          </label>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Business Name</label>
          <input type="text" required value={profile.business_name} onChange={e => setProfile({...profile, business_name: e.target.value})} className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm outline-none focus:border-primary" />
          
          {profile.store_slug && (
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 p-3 rounded-lg">
              <ExternalLink className="h-4 w-4 shrink-0" />
              <span>Store link:</span>
              <Link href={`/store/${profile.store_slug}`} target="_blank" className="text-primary hover:underline font-mono truncate">
                /store/{profile.store_slug}
              </Link>
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">WhatsApp Number</label>
          <input type="text" required value={profile.whatsapp} onChange={e => setProfile({...profile, whatsapp: e.target.value})} className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm outline-none focus:border-primary" placeholder="+234 801 234 5678" />
        </div>

        <button type="submit" disabled={saving || uploading} className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-50 flex justify-center items-center gap-2">
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}