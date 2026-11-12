'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Settings, Loader2, CheckCircle2, ArrowLeft, AlertCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { updateSellerSettings } from './actions';

export default function SellerSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Added store_slug to track the generated link
  const [profile, setProfile] = useState({ 
    business_name: '', 
    whatsapp: '',
    store_slug: ''
  });

  useEffect(() => {
    async function loadProfile() {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: seller } = await supabase.from('seller_profiles').select('business_name').eq('user_id', user.id).single();
      const { data: userData } = await supabase.from('users').select('phone, store_slug').eq('id', user.id).single();

      setProfile({ 
        business_name: seller?.business_name || '', 
        whatsapp: userData?.phone || '',
        store_slug: userData?.store_slug || ''
      });
      setLoading(false);
    }
    loadProfile();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setErrorMsg('');

    // Use the Server Action to save both tables and generate the slug
    const result = await updateSellerSettings({
      businessName: profile.business_name,
      phone: profile.whatsapp,
    });

    if (result.error) {
      setErrorMsg(result.error);
    } else {
      setSuccess(true);
      if (result.slug) {
        setProfile(prev => ({ ...prev, store_slug: result.slug! }));
      }
      // This tells Next.js to purge the client-side cache for the account page!
      router.refresh(); 
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    }
    
    setSaving(false);
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16 pb-32">
      <Link href="/seller" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>
      <h1 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary" /> Store Settings
      </h1>
      
      {success && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-green-500/10 p-4 text-green-500">
          <CheckCircle2 className="h-5 w-5" /> Settings saved successfully!
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-500/10 p-4 text-red-500">
          <AlertCircle className="h-5 w-5" /> {errorMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="glass-card rounded-3xl p-8 space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium">Business Name</label>
          <input 
            type="text" 
            required 
            value={profile.business_name} 
            onChange={e => setProfile({...profile, business_name: e.target.value})} 
            className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm outline-none focus:border-primary" 
          />
          {/* Show the live generated link if they have one */}
          {profile.store_slug && (
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 p-3 rounded-lg">
              <ExternalLink className="h-4 w-4 shrink-0" />
              <span>Your store link:</span>
              <Link href={`/store/${profile.store_slug}`} target="_blank" className="text-primary hover:underline font-mono truncate">
                /store/{profile.store_slug}
              </Link>
            </div>
          )}
        </div>
        
        <div>
          <label className="mb-2 block text-sm font-medium">WhatsApp Number</label>
          <input 
            type="text" 
            required 
            value={profile.whatsapp} 
            onChange={e => setProfile({...profile, whatsapp: e.target.value})} 
            className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm outline-none focus:border-primary" 
            placeholder="+234 801 234 5678" 
          />
        </div>

        <button 
          type="submit" 
          disabled={saving} 
          className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}