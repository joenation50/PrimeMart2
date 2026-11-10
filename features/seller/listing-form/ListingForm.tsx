'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, UploadCloud, X } from 'lucide-react';
import { createListing } from '@/actions/listings';
import type { Category } from '@/types';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import imageCompression from 'browser-image-compression';

export function ListingForm({ categories, initialData, isEdit = false, listingId }: { categories: Category[], initialData?: any, isEdit?: boolean, listingId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>(initialData?.images || []);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    category_id: initialData?.category_id || '',
    location: initialData?.location || '',
    price_negotiable: initialData?.price_negotiable || false,
  });

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (images.length >= 6) {
      setError('Maximum 6 images allowed');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1200 });
      
      const sigRes = await fetch('/api/cloudinary/sign', { method: 'POST' });
      const sigData = await sigRes.json();
      if (!sigRes.ok) throw new Error('Upload failed');

      const uploadData = new FormData();
      uploadData.append('file', compressed);
      uploadData.append('api_key', sigData.apiKey);
      uploadData.append('timestamp', sigData.timestamp.toString());
      uploadData.append('signature', sigData.signature);
      uploadData.append('folder', sigData.folder);

      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`, {
        method: 'POST',
        body: uploadData,
      });
      
      const cloudData = await cloudRes.json();
      if (!cloudRes.ok) throw new Error(cloudData.error?.message || 'Cloudinary error');
      
      setImages([...images, cloudData.public_id]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (images.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      title: formData.title,
      description: formData.description,
      price: Number(formData.price),
      currency: 'NGN',
      price_negotiable: formData.price_negotiable,
      category_id: formData.category_id,
      location: formData.location,
      images,
      tags: [],
    };

    const result = isEdit 
      ? await createListing(payload) 
      : await createListing(payload);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      <div>
        <label className="mb-2 block text-sm font-medium">Photos (Max 6)</label>
        <div className="flex flex-wrap gap-4">
          {images.map((img, i) => (
            <div key={i} className="relative h-24 w-24 rounded-lg border border-border bg-muted overflow-hidden">
              <img src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_200,h_200,c_fill/${img}`} alt="Upload" className="h-full w-full object-cover" />
              <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white hover:bg-black">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          
          {images.length < 6 && (
            <div className="relative flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border hover:bg-muted">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" disabled={loading} />
              {loading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : <UploadCloud className="h-5 w-5 text-muted-foreground" />}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Title</label>
        <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="e.g. iPhone 13 Pro Max 256GB" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Price (₦)</label>
          <input type="number" required min="100" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="50000" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Category</label>
          <select required value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm">
            <option value="">Select category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea required rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm resize-none" placeholder="Describe your item..." />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Location</label>
        <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="e.g. Ikeja, Lagos" />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="negotiable" checked={formData.price_negotiable} onChange={(e) => setFormData({...formData, price_negotiable: e.target.checked})} className="rounded border-border" />
        <label htmlFor="negotiable" className="text-sm font-medium">Price is negotiable</label>
      </div>

      <button type="submit" disabled={loading} className="flex w-full items-center justify-center rounded-lg bg-foreground py-3 text-sm font-medium text-background disabled:opacity-50">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? 'Save Changes' : 'Publish Listing'}
      </button>
    </form>
  );
}