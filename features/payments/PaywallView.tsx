'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Loader2, UploadCloud, CheckCircle2, AlertCircle, Clock, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function PaywallView({ user, existingPayment: initialPayment }: { user: any, existingPayment: any }) {
  const router = useRouter();
  const [existingPayment, setExistingPayment] = useState(initialPayment);
  const [showForm, setShowForm] = useState(false);
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [reference, setReference] = useState('');
  
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setErrorMsg('');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please upload a screenshot of your payment.');
      return;
    }

    setUploading(true);
    setErrorMsg('');
    
    const supabase = createBrowserSupabase();

    try {
      // 1. Upload directly to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'primemart_preset');

      const res = await fetch(`https://api.cloudinary.com/v1_1/za4q8nqh/image/upload`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      if (!data.secure_url) throw new Error('Failed to upload to Cloudinary.');

      // 2. Save to Supabase
      const { error: paymentError } = await supabase.from('payments').insert({
        seller_id: user.id, 
        amount: 5000,
        status: 'pending_review', 
        reference: reference || 'No reference',
        proof_url: data.secure_url,
      });

      if (paymentError) throw new Error(`Database Error: ${paymentError.message}`);

      // 3. Update user status
      await supabase.from('users').update({ seller_status: 'pending' }).eq('id', user.id);

      setExistingPayment({ status: 'pending_review' });
      setSuccess(true);
      setShowForm(false);
      
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  // 1. SHOW PENDING STATE IF PAYMENT EXISTS
  if ((existingPayment || success) && !showForm) {
    return (
      <div className="container mx-auto max-w-lg px-4 text-center">
        <div className="glass-card rounded-3xl p-12">
          <Clock className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Payment Under Review</h1>
          <p className="text-muted-foreground mb-8">
            Your payment request is currently being processed by our admin team. This usually takes less than 24 hours.
          </p>
          
          <Link href="/seller" className="flex w-full items-center justify-center rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground mb-4">
            Go to Dashboard
          </Link>
          
          <button 
            onClick={() => setShowForm(true)} 
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Made a mistake? Submit a new payment request
          </button>
        </div>
      </div>
    );
  }

  // 2. SHOW THE UPLOAD FORM
  return (
    <div className="container mx-auto max-w-lg px-4">
      <Link href="/seller" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>
      
      <div className="glass-card rounded-3xl p-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Activate Your Store</h1>
        <p className="text-muted-foreground mb-6">Complete your payment to unlock selling features on PrimeMart.</p>

        <div className="bg-secondary/50 rounded-2xl p-4 mb-8 space-y-2 text-sm">
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
            <label className="block text-sm font-medium mb-2">Upload Proof of Payment</label>
            <div className="relative border-2 border-dashed border-border rounded-2xl overflow-hidden hover:bg-secondary/20 transition-colors">
              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={uploading} />
              {preview ? (
                <div className="relative aspect-video w-full"><Image src={preview} alt="Payment proof" fill className="object-contain" /></div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <UploadCloud className="h-8 w-8 mb-2" />
                  <p className="text-sm font-medium">Click to upload screenshot</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Transfer Reference (Optional)</label>
            <input type="text" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. GTB-123456" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" disabled={uploading} />
          </div>

          <button type="submit" disabled={uploading || !file} className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-bold text-primary-foreground disabled:opacity-50">
            {uploading ? <><Loader2 className="h-5 w-5 animate-spin" /> Uploading...</> : 'Submit for approval'}
          </button>
        </form>

        {existingPayment && (
           <div className="mt-6 text-center">
             <button onClick={() => setShowForm(false)} className="text-sm text-muted-foreground hover:text-foreground">
               Cancel and go back
             </button>
           </div>
        )}
      </div>
    </div>
  );
}