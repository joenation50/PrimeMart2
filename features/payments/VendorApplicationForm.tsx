'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Loader2, UploadCloud, CheckCircle2, AlertCircle, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// Updated fallback to include all 12 categories
const FALLBACK_CATEGORIES = [
  'Fashion', 'Electronics', 'Gadgets', 'Home', 'Services', 
  'Vehicles', 'Transport', 'Food', 'Beauty', 'Health', 'Tutorials', 'Others'
];

export function VendorApplicationForm({ user, existingPayment }: { user: any, existingPayment: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [dbCategories, setDbCategories] = useState<string[]>(FALLBACK_CATEGORIES);

  const [form, setForm] = useState({
    businessName: '',
    whatsapp: '',
    location: '',
    description: '',
    categories: [] as string[],
    reference: ''
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      const supabase = createBrowserSupabase();
      const { data } = await supabase.from('categories').select('name').eq('active', true);
      if (data && data.length > 0) {
        setDbCategories(data.map(c => c.name));
      }
    }
    fetchCategories();
  }, []);

  function toggleCategory(catName: string) {
    setForm(prev => {
      const isSelected = prev.categories.includes(catName);
      if (isSelected) {
        return { ...prev, categories: prev.categories.filter(c => c !== catName) };
      }
      if (prev.categories.length >= 5) {
        alert("You can only select up to 5 categories.");
        return prev;
      }
      return { ...prev, categories: [...prev.categories, catName] };
    });
  }

  async function uploadToCloudinary(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'primemart_preset');
    const res = await fetch(`https://api.cloudinary.com/v1_1/za4q8nqh/image/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    return data.secure_url;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!logoFile) return setErrorMsg('Please upload a business logo.');
    if (!proofFile) return setErrorMsg('Please upload proof of payment.');
    if (form.categories.length === 0) return setErrorMsg('Please select at least one category.');

    setLoading(true);
    setErrorMsg('');
    const supabase = createBrowserSupabase();

    try {
      const logoUrl = await uploadToCloudinary(logoFile);
      const proofUrl = await uploadToCloudinary(proofFile);

      if (!logoUrl || !proofUrl) throw new Error('Image upload failed.');

      const { error: paymentError } = await supabase.from('payments').insert({
        seller_id: user.id,
        amount: 5000,
        status: 'pending_review',
        reference: form.reference || 'No reference',
        proof_url: proofUrl,
        application_data: {
          business_name: form.businessName,
          whatsapp: form.whatsapp,
          location: form.location,
          description: form.description,
          categories: form.categories,
          logo_url: logoUrl
        }
      });

      if (paymentError) throw new Error(paymentError.message);

      await supabase.from('users').update({ seller_status: 'pending' }).eq('id', user.id);

      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  if (existingPayment || success) {
    return (
      <div className="container mx-auto max-w-lg px-4 text-center py-20">
        <div className="glass-card rounded-3xl p-12">
          <CheckCircle2 className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Application Under Review</h1>
          <p className="text-muted-foreground mb-8">Your vendor application and payment are being reviewed. This takes less than 24 hours.</p>
          <Link href="/seller" className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-8 pb-32">
      <Link href="/seller" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Vendor Application</h1>
        <p className="text-sm text-muted-foreground">Fill out your store details and upload proof of payment to activate your account.</p>
      </div>

      <div className="bg-secondary/50 rounded-2xl p-4 mb-8 space-y-2 text-sm border border-border">
        <p className="flex justify-between"><span className="text-muted-foreground">Bank:</span> <span className="font-semibold">Moniepoint</span></p>
        <p className="flex justify-between"><span className="text-muted-foreground">Account Name:</span> <span className="font-semibold">Nwankwo Uzo Joseph</span></p>
        <p className="flex justify-between"><span className="text-muted-foreground">Account Number:</span> <span className="font-semibold font-mono text-lg text-primary">08075771583</span></p>
        <p className="flex justify-between"><span className="text-muted-foreground">Amount:</span> <span className="font-semibold">₦5,000</span></p>
      </div>

      {errorMsg && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-500/10 p-4 text-red-500">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-foreground">Business Name</label>
          <input required value={form.businessName} onChange={e => setForm({...form, businessName: e.target.value})} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" placeholder="e.g. Sarah's Pastries" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-foreground">Business WhatsApp Number</label>
          <input required type="tel" value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" placeholder="e.g. 08012345678" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-foreground">Location (Hostel or Off-Campus)</label>
          <input required value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" placeholder="e.g. Alpha Hostel" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-foreground">Short Description</label>
          <textarea required rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary resize-none" placeholder="Tell buyers what you sell..." />
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
                  "rounded-full px-5 py-2 text-sm font-semibold transition-colors border",
                  form.categories.includes(cat) 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-background text-muted-foreground border-border hover:bg-secondary"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-foreground">Branding & Identity (Logo)</label>
          <div className="relative border-2 border-dashed border-border rounded-2xl overflow-hidden hover:bg-secondary/20 transition-colors">
            <input type="file" accept="image/*" onChange={(e) => {
              const f = e.target.files?.[0]; if(f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); }
            }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            {logoPreview ? (
              <div className="relative aspect-video w-full"><Image src={logoPreview} alt="Logo" fill className="object-contain" /></div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <ImageIcon className="h-8 w-8 mb-2" />
                <p className="text-sm font-medium">Tap to upload logo</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-foreground">Proof of Payment (₦5,000)</label>
          <div className="relative border-2 border-dashed border-border rounded-2xl overflow-hidden hover:bg-secondary/20 transition-colors">
            <input type="file" accept="image/*" onChange={(e) => {
              const f = e.target.files?.[0]; if(f) { setProofFile(f); setProofPreview(URL.createObjectURL(f)); }
            }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            {proofPreview ? (
              <div className="relative aspect-video w-full"><Image src={proofPreview} alt="Payment" fill className="object-contain" /></div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <UploadCloud className="h-8 w-8 mb-2" />
                <p className="text-sm font-medium">Tap to upload screenshot</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-foreground">Transfer Reference (Optional)</label>
          <input value={form.reference} onChange={e => setForm({...form, reference: e.target.value})} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" placeholder="e.g. GTB-123456" />
        </div>

        <button type="submit" disabled={loading} className="w-full rounded-xl bg-primary py-4 font-bold text-primary-foreground disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg">
          {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Submitting Application...</> : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}