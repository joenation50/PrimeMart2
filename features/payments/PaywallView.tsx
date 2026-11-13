'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Loader2, UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export function PaywallView({ user, existingPayment }: { user: any, existingPayment: any }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [reference, setReference] = useState('');
  
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  // If they already submitted a payment, show them a pending state
  if (existingPayment || success) {
    return (
      <div className="container mx-auto max-w-lg px-4 text-center">
        <div className="glass-card rounded-3xl p-12">
          <CheckCircle2 className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Payment Under Review</h1>
          <p className="text-muted-foreground mb-8">
            Your payment is currently being reviewed by our team. This usually takes less than 24 hours.
          </p>
          <button onClick={() => router.push('/seller')} className="rounded-full bg-secondary px-8 py-3 font-semibold text-foreground hover:bg-secondary/80">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
      // 1. Upload directly to Cloudinary (Fixes the JSON error)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'primemart_preset');

      const res = await fetch(`https://api.cloudinary.com/v1_1/za4q8nqh/image/upload`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (!data.secure_url) {
        throw new Error('Failed to upload to Cloudinary. Check your connection.');
      }

      // 2. Save payment record to Supabase
      const { error: paymentError } = await supabase.from('payments').insert({
        seller_id: user.id,
        amount: 5000,
        status: 'pending_review',
        reference: reference || 'No reference',
        proof_url: data.secure_url,
      });

      if (paymentError) {
        // If 'payments' table doesn't exist, this will catch it
        throw new Error(`Database Error: ${paymentError.message}`);
      }

      // 3. Update user status to pending
      const { error: userError } = await supabase.from('users')
        .update({ seller_status: 'pending' })
        .eq('id', user.id);

      if (userError) {
        throw new Error(`User Update Error: ${userError.message}`);
      }

      setSuccess(true);
      
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-lg px-4">
      <div className="glass-card rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Activate Your Store</h1>
          <span className="text-xs font-mono bg-secondary px-3 py-1 rounded-full text-muted-foreground">
            {user?.seller_code || 'PAYMENT'}
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground mb-6">
          Complete your payment to unlock selling features on PrimeMart.
        </p>

        {/* Bank Details Box */}
        <div className="bg-secondary/50 rounded-2xl p-4 mb-6 space-y-2 text-sm">
          <p className="flex justify-between"><span className="text-muted-foreground">Bank:</span> <span className="font-semibold">Opay</span></p>
          <p className="flex justify-between"><span className="text-muted-foreground">Account Name:</span> <span className="font-semibold">PrimeMart</span></p>
          <p className="flex justify-between"><span className="text-muted-foreground">Account Number:</span> <span className="font-semibold font-mono text-lg text-primary">8012345678</span></p>
          <p className="flex justify-between"><span className="text-muted-foreground">Amount:</span> <span className="font-semibold">₦5,000</span></p>
        </div>

        {errorMsg && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-500/10 p-4 text-red-500">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload Area */}
          <div>
            <label className="block text-sm font-medium mb-2">2. Upload proof of payment</label>
            <p className="text-xs text-muted-foreground mb-3">All payments are final. No refunds.</p>
            
            <div className="relative border-2 border-dashed border-border rounded-2xl overflow-hidden hover:bg-secondary/20 transition-colors">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={uploading}
              />
              {preview ? (
                <div className="relative aspect-video w-full">
                  <Image src={preview} alt="Payment proof" fill className="object-contain" />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <UploadCloud className="h-8 w-8 mb-2" />
                  <p className="text-sm font-medium">Click to upload screenshot</p>
                </div>
              )}
            </div>
          </div>

          {/* Reference Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Transfer Reference (optional)</label>
            <input 
              type="text" 
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. GTB-123456"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              disabled={uploading}
            />
          </div>

          <button 
            type="submit" 
            disabled={uploading || !file}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-bold text-primary-foreground disabled:opacity-50"
          >
            {uploading ? <><Loader2 className="h-5 w-5 animate-spin" /> Uploading...</> : 'Submit for approval'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button onClick={() => router.push('/seller')} className="text-sm text-muted-foreground hover:text-foreground">
            Skip for now. I'll pay later.
          </button>
        </div>
      </div>
    </div>
  );
}