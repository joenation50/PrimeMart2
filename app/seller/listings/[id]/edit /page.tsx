'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Loader2, Upload, X, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function SellerEditListingPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [categories, setCategories] = useState<any[]>([]);

  const [form, setForm] = useState({
    title: '',
    price: '',
    category: '',
    description: '',
    price_negotiable: false,
  });

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: catData } = await supabase.from('categories').select('*').eq('active', true).order('sort_order');
      setCategories(catData || []);

      const { data: listingData } = await supabase.from('listings').select('*').eq('id', params.id).eq('seller_id', user.id).single();

      if (!listingData) { 
        router.push('/seller/listings'); 
        return; 
      }

      setForm({
        title: listingData.title || '',
        price: listingData.price?.toString() || '',
        category: listingData.category || '',
        description: listingData.description || '',
        price_negotiable: listingData.price_negotiable || false,
      });
      
      setExistingImages(listingData.images || []);
      setLoading(false);
    }
    loadData();
  }, [params.id, router]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    const totalCurrent = existingImages.length + newFiles.length;
    const allowedToAdd = 6 - totalCurrent;
    const filesToAdd = selectedFiles.slice(0, allowedToAdd);
    
    setNewFiles(prev => [...prev, ...filesToAdd]);
    setNewPreviews(prev => [...prev, ...filesToAdd.map(file => URL.createObjectURL(file))]);
  }

  function removeImage(index: number) {
    if (index < existingImages.length) {
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      const newIndex = index - existingImages.length;
      setNewFiles(prev => prev.filter((_, i) => i !== newIndex));
      setNewPreviews(prev => prev.filter((_, i) => i !== newIndex));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const totalImages = existingImages.length + newFiles.length;
    if (totalImages === 0) {
      setErrorMsg('Please upload at least one photo.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    const supabase = createBrowserSupabase();

    try {
      const uploadedUrls: string[] = [];
      for (const file of newFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'primemart_preset');

        // UPDATED CLOUD NAME HERE
        const res = await fetch(`https://api.cloudinary.com/v1_1/za4q8nqh/image/upload`, {
          method: 'POST',
          body: formData,
        });
        
        const data = await res.json();
        if (data.secure_url) {
          uploadedUrls.push(data.secure_url);
        }
      }

      const finalImages = [...existingImages, ...uploadedUrls];

      const { error } = await supabase.from('listings').update({
        title: form.title,
        price: Number(form.price),
        category: form.category,
        description: form.description,
        price_negotiable: form.price_negotiable,
        images: finalImages,
      }).eq('id', params.id);

      if (error) throw error;
      router.push('/seller/listings');

    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
      setSaving(false);
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const allImages = [...existingImages, ...newPreviews];

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12 pb-32">
      <Link href="/seller/listings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to Listings
      </Link>
      <h1 className="mb-8 text-3xl font-bold text-foreground">Edit Listing</h1>

      {errorMsg && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-500/10 p-4 text-red-500">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-8 space-y-6">
        
        <div>
          <label className="block text-sm font-medium mb-3">Photos (Max 6)</label>
          <div className="grid grid-cols-3 gap-3 mb-3">
            {allImages.map((preview, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-secondary border border-border">
                <Image src={preview} alt="Preview" fill className="object-cover" />
                <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            {allImages.length < 6 && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/50 transition-colors">
                <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                <span className="text-xs text-muted-foreground text-center px-1">Add Photo</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            )}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Title</label>
          <input 
            type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} 
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Price (₦)</label>
            <input 
              type="number" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} 
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" 
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Category</label>
            <select 
              required value={form.category} onChange={e => setForm({...form, category: e.target.value})} 
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            >
              <option value="" disabled>Select category</option>
              {categories.map(c => (
                <option key={c.id} value={c.name || c.slug || c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input 
            type="checkbox" id="negotiable" checked={form.price_negotiable} onChange={e => setForm({...form, price_negotiable: e.target.checked})} 
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          <label htmlFor="negotiable" className="text-sm font-medium cursor-pointer">Price is negotiable</label>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Description</label>
          <textarea 
            required rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} 
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary resize-none" 
          />
        </div>

        <button 
          type="submit" disabled={saving} 
          className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving Changes...</> : 'Update Listing'}
        </button>
      </form>
    </div>
  );
}