'use client';

import { useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Loader2, ImageIcon, Trash2, Plus, Upload, X } from 'lucide-react';
import Image from 'next/image';

export function BannerManager({ initialBanners }: { initialBanners: any[] }) {
  const [banners, setBanners] = useState(initialBanners);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    headline: '',
    subtext: '',
    cta_text: '',
    cta_url: '',
    image_url: ''
  });

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
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
        setForm(prev => ({ ...prev, image_url: data.secure_url }));
      }
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleSaveBanner(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createBrowserSupabase();
    
    const { data, error } = await supabase.from('banners').insert({
      headline: form.headline,
      subtext: form.subtext,
      cta_text: form.cta_text,
      cta_url: form.cta_url,
      image_url: form.image_url,
      active: true
    }).select().single();

    if (!error && data) {
      setBanners([data, ...banners]);
      setForm({ headline: '', subtext: '', cta_text: '', cta_url: '', image_url: '' });
      setShowForm(false);
    } else {
      alert(error?.message || 'Failed to save banner');
    }
    setSaving(false);
  }

  async function toggleBanner(id: string, currentStatus: boolean) {
    const supabase = createBrowserSupabase();
    await supabase.from('banners').update({ active: !currentStatus }).eq('id', id);
    setBanners(prev => prev.map(b => b.id === id ? { ...b, active: !currentStatus } : b));
  }

  async function deleteBanner(id: string) {
    if (!confirm('Delete this banner?')) return;
    const supabase = createBrowserSupabase();
    await supabase.from('banners').delete().eq('id', id);
    setBanners(prev => prev.filter(b => b.id !== id));
  }

  return (
    <div className="space-y-8 pb-20">
      
      {/* HEADER & ADD BUTTON */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Manage app banners and platform configuration.</p>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> {showForm ? 'Cancel' : 'Add Banner'}
        </button>
      </div>

      {/* ADD BANNER FORM */}
      {showForm && (
        <form onSubmit={handleSaveBanner} className="glass-card rounded-2xl p-6 space-y-4 animate-in slide-in-from-top-4">
          <h2 className="font-bold text-lg border-b border-border pb-2 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" /> Create New Banner
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Headline (Required)</label>
              <input required value={form.headline} onChange={e => setForm({...form, headline: e.target.value})} className="w-full rounded-xl border border-border bg-background px-4 py-2" placeholder="e.g. Black Friday Sale" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subtext</label>
              <input value={form.subtext} onChange={e => setForm({...form, subtext: e.target.value})} className="w-full rounded-xl border border-border bg-background px-4 py-2" placeholder="e.g. Up to 50% off" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Button Text</label>
              <input value={form.cta_text} onChange={e => setForm({...form, cta_text: e.target.value})} className="w-full rounded-xl border border-border bg-background px-4 py-2" placeholder="e.g. Shop Now" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Button Link</label>
              <input value={form.cta_url} onChange={e => setForm({...form, cta_url: e.target.value})} className="w-full rounded-xl border border-border bg-background px-4 py-2" placeholder="e.g. /marketplace" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Banner Image (Required)</label>
            <div className="flex items-center gap-4">
              {form.image_url && (
                <div className="relative h-16 w-32 rounded-lg overflow-hidden bg-secondary border border-border">
                  <Image src={form.image_url} alt="Preview" fill className="object-cover" />
                  <button type="button" onClick={() => setForm({...form, image_url: ''})} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full"><X className="h-3 w-3" /></button>
                </div>
              )}
              <label className="cursor-pointer rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-secondary flex items-center gap-2">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? 'Uploading...' : 'Upload Image'}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
          </div>

          <button type="submit" disabled={saving || uploading || !form.image_url} className="rounded-xl bg-primary px-6 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Banner'}
          </button>
        </form>
      )}

      {/* BANNER LIST */}
      <div>
        <h2 className="text-lg font-bold mb-4">Active Banners</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {banners.length === 0 ? (
            <div className="col-span-2 glass-card rounded-2xl p-12 text-center text-muted-foreground">
              No banners created yet. Click "Add Banner" to create one.
            </div>
          ) : (
            banners.map((banner) => (
              <div key={banner.id} className="glass-card rounded-2xl p-4 flex gap-4">
                <div className="relative h-24 w-32 shrink-0 rounded-lg overflow-hidden bg-secondary">
                  {banner.image_url ? (
                    <Image src={banner.image_url} alt={banner.headline} fill className="object-cover" />
                  ) : (
                    <ImageIcon className="h-6 w-6 m-auto text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground">{banner.headline}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">{banner.subtext}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={() => toggleBanner(banner.id, banner.active)} className={`px-3 py-1 text-xs font-bold rounded-full ${banner.active ? 'bg-green-500/10 text-green-500' : 'bg-secondary text-muted-foreground'}`}>
                      {banner.active ? 'Active' : 'Inactive'}
                    </button>
                    <button onClick={() => deleteBanner(banner.id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}