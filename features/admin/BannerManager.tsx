// features/admin/BannerManager.tsx
'use client';

import { useState } from 'react';
import { createBanner, toggleBanner, deleteBanner } from '@/actions/admin';

export function BannerManager({ initialBanners }: { initialBanners: any[] }) {
  const [banners, setBanners] = useState(initialBanners);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({ headline: '', subtext: '', cta_text: '', cta_url: '' });
  
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await createBanner({
      type: 'announcement',
      image_url: 'placeholder', // In a real app, upload to Cloudinary
      headline: form.headline,
      subtext: form.subtext,
      cta_text: form.cta_text,
      cta_url: form.cta_url,
    });
    setIsCreating(false);
    window.location.reload();
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Marketplace Banners</h2>
        <button onClick={() => setIsCreating(!isCreating)} className="rounded-lg bg-foreground px-4 py-2 text-sm text-background">
          {isCreating ? 'Cancel' : '+ New Banner'}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="rounded-xl border border-border bg-background p-6 space-y-4">
          <input type="text" placeholder="Headline (e.g. Black Friday Sale)" required value={form.headline} onChange={e => setForm({...form, headline: e.target.value})} className="w-full rounded border px-3 py-2 text-sm" />
          <input type="text" placeholder="Subtext" value={form.subtext} onChange={e => setForm({...form, subtext: e.target.value})} className="w-full rounded border px-3 py-2 text-sm" />
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="CTA Text (e.g. Shop now)" value={form.cta_text} onChange={e => setForm({...form, cta_text: e.target.value})} className="w-full rounded border px-3 py-2 text-sm" />
            <input type="text" placeholder="CTA Link (e.g. /?category=fashion)" value={form.cta_url} onChange={e => setForm({...form, cta_url: e.target.value})} className="w-full rounded border px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="rounded bg-foreground px-6 py-2 text-sm text-background">Save Banner</button>
        </form>
      )}

      <div className="rounded-xl border border-border bg-background divide-y divide-border">
        {banners.map(b => (
          <div key={b.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{b.headline}</p>
              <p className="text-xs text-muted-foreground">{b.subtext}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleBanner(b.id, !b.active)} className={`rounded px-3 py-1 text-xs font-medium ${b.active ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                {b.active ? 'Active' : 'Inactive'}
              </button>
              <button onClick={() => { deleteBanner(b.id); window.location.reload(); }} className="text-xs text-red-600 hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}