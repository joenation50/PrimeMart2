'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Loader2, Upload, X, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const FALLBACK_CATEGORIES = [
  { id: '1', name: 'Fashion' },
  { id: '2', name: 'Electronics' },
  { id: '3', name: 'Home' },
  { id: '4', name: 'Services' },
  { id: '5', name: 'Vehicles' },
];

export default function AdminNewListingPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>(FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    title: '',
    price: '',
    category: '',
    description: '',
    price_negotiable: false,
  });

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      const supabase = createBrowserSupabase();
      const { data, error } = await supabase.from('categories').select('*').eq('active', true).order('sort_order');
      if (!error && data && data.length > 0) {
        setCategories(data);
      }
      setLoading(false);
    }
    fetchCategories();
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    const newFiles = [...files, ...selectedFiles].slice(0, 6);
    setFiles(newFiles);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  }

  function removeImage(index: number) {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (files.length === 0) {
      setErrorMsg('Please upload at least one photo.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    const supabase = createBrowserSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      // --- NEW: ENSURE SELLER PROFILE EXISTS ---
      // If the admin/seller doesn't have a profile yet, create one so the foreign key doesn't fail
      const { data: existingProfile } = await supabase
        .from('seller_profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existingProfile) {
        await supabase.from('seller_profiles').insert({
          user_id: user.id,
          business_name: 'My Store',
          real_name: 'Admin',
          based_country: 'NG',
          based_city: 'Lagos'
        });
      }
      // ------------------------------------------

      const uploadedUrls: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'primemart_preset');

        const res = await fetch(`https://api.cloudinary.com/v1_1/za4q8nqh/image/upload`, {
          method: 'POST',
          body: formData,
        });
        
        const data = await res.json();
        if (data.secure_url) {
          uploadedUrls.push(data.secure_url);
        }
      }

      if (uploadedUrls.length === 0) {
        throw new Error('Cloudinary image upload failed. Please try again.');
      }

      const { error } = await supabase.from('listings').insert({
        seller_id: user.id,
        title: form.title,
        price: Number(form.price),
        category: form.category,
        description: form.description,
        price_negotiable: form.price_negotiable,
        images: uploadedUrls,
        status: 'active'
      });

      if (error) {
        throw new Error(`Database Error: ${error.message}`);
      }
      
      router.push('/admin/store/listings');

    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-2xl pb-32">
      <Link href="/admin/store/listings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to Admin Listings
      </Link>
      <h1 className="mb-8 text-2xl font-bold text-foreground">Create Admin Listing</h1>

      {errorMsg && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-500/10 p-4 text-red-500">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 md:p-8 space-y-6">
        
        <div>
          <label className="block text-sm font-medium mb-3">Photos (Max 6)</label>
          <div className="grid grid-cols-3 gap-3 mb-3">
            {previews.map((preview, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-secondary">
                <Image src={preview} alt="Preview" fill className="object-cover" />
                <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            {files.length < 6 && (
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
          <input type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" placeholder="e.g. iPhone 13 Pro Max 256GB" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Price (₦)</label>
            <input type="number" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" placeholder="50000" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Category</label>
            <select required value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary">
              <option value="" disabled>Select category</option>
              {categories.map(c => (
                <option key={c.id} value={c.name || c.slug || c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="negotiable" checked={form.price_negotiable} onChange={e => setForm({...form, price_negotiable: e.target.checked})} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
          <label htmlFor="negotiable" className="text-sm font-medium cursor-pointer">Price is negotiable</label>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Description</label>
          <textarea required rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary resize-none" placeholder="Describe your item..." />
        </div>

        <button type="submit" disabled={saving} className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-50 flex justify-center items-center gap-2">
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading & Saving...</> : 'Post Admin Listing'}
        </button>
      </form>
    </div>
  );
}