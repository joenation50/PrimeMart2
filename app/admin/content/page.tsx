'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Loader2, ImageIcon, Trash2, Plus, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

export default function AdminContentPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      const supabase = createBrowserSupabase();
      
      const [bannerRes, catRes] = await Promise.all([
        supabase.from('banners').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('sort_order', { ascending: true })
      ]);

      if (bannerRes.data) setBanners(bannerRes.data);
      if (catRes.data) setCategories(catRes.data);
      setLoading(false);
    }
    fetchContent();
  }, []);

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

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-primary" /> Manage Content
          </h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {banners.length === 0 ? (
            <div className="col-span-2 glass-card rounded-2xl p-12 text-center text-muted-foreground">
              No banners created yet. Run the SQL to create the banners table.
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

      <div>
        <h1 className="text-2xl font-bold text-foreground mb-6">Active Categories</h1>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2">
              <CheckCircle2 className={`h-4 w-4 ${cat.active ? 'text-green-500' : 'text-muted-foreground'}`} />
              <span className="font-medium text-sm">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}