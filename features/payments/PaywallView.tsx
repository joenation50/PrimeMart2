// features/payments/PaywallView.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Loader2, UploadCloud, X } from 'lucide-react';
import { submitPaymentProof } from '@/actions/payments';
import { createBrowserSupabase } from '@/lib/supabase';
import type { User, Payment } from '@/types';

export function PaywallView({ user, existingPayment }: { user: User;existingPayment: Payment | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState < string | null > (null);
  const [screenshot, setScreenshot] = useState < string | null > (null);
  const [claimedRef, setClaimedRef] = useState('');
  
  const isNigeria = user.country === 'NG';
  const amount = isNigeria ? 5000 : 10;
  const currency = isNigeria ? 'NGN' : 'USD';
  const formattedAmount = isNigeria ? `₦${amount.toLocaleString()}` : `$${amount}`;
  
  if (existingPayment) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-16 text-center">
        <div className="rounded-2xl border border-border p-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold">Payment under review</h1>
          <p className="mt-2 text-muted-foreground">
            We received your proof of payment. Our team is verifying it. You'll get a notification once approved.
          </p>
          <Link href="/dashboard" className="mt-6 inline-block rounded-lg border border-border px-6 py-2 text-sm font-medium hover:bg-muted">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  async function handleUpload(e: React.ChangeEvent < HTMLInputElement > ) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    
    try {
      const sigRes = await fetch('/api/cloudinary/sign', { method: 'POST' });
      const sigData = await sigRes.json();
      if (!sigRes.ok) throw new Error('Upload failed');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sigData.apiKey);
      formData.append('timestamp', sigData.timestamp.toString());
      formData.append('signature', sigData.signature);
      formData.append('folder', sigData.folder);
      
      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      
      const cloudData = await cloudRes.json();
      if (!cloudRes.ok) throw new Error(cloudData.error?.message || 'Cloudinary error');
      setScreenshot(cloudData.public_id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!screenshot) return;
    setLoading(true);
    setError(null);
    
    const result = await submitPaymentProof({
      reference: `${user.seller_code}-Y1`,
      amount,
      currency,
      screenshot_url: screenshot,
      claimed_ref: claimedRef,
    });
    
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.refresh();
    }
  }
  
  return (
    <div className="container mx-auto max-w-lg px-4 py-12 relative">
      <Link 
        href="/dashboard" 
        className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Skip for now"
      >
        <X className="h-6 w-6" />
      </Link>

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Sell on PrimeMart</h1>
        <p className="mt-2 text-muted-foreground">Activate your account to start listing.</p>
      </div>

      <div className="rounded-2xl border border-border bg-background p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between border-b border-border pb-6">
          <div>
            <p className="font-medium">Seller Subscription</p>
            <p className="text-sm text-muted-foreground">1 year · Unlimited listings</p>
          </div>
          <p className="text-2xl font-bold">{formattedAmount}</p>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">1. Make a transfer</h3>
            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="flex justify-between py-1">
                <span className="text-muted-foreground">Bank</span>
                <span className="font-medium">{isNigeria ? 'GTBank' : 'Chase Bank'}</span>
              </p>
              <p className="flex justify-between py-1">
                <span className="text-muted-foreground">Account Number</span>
                <span className="font-medium">{isNigeria ? '0123456789' : '1234567890'}</span>
              </p>
              <p className="flex justify-between py-1">
                <span className="text-muted-foreground">Account Name</span>
                <span className="font-medium">PrimeMart Ltd</span>
              </p>
              <p className="flex justify-between py-1 border-t border-border/50 mt-2 pt-2">
                <span className="font-medium text-foreground">Transfer Reference</span>
                <span className="font-mono font-bold">{user.seller_code}-Y1</span>
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">2. Upload proof of payment</h3>
            <p className="text-sm text-muted-foreground mb-3">All payments are final. No refunds.</p>

            {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border p-6 transition hover:bg-muted/50">
                <input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 cursor-pointer opacity-0" disabled={loading || !!screenshot} />
                {screenshot ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Screenshot uploaded</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="mb-2 h-6 w-6 text-muted-foreground" />
                    <span className="text-sm font-medium">Click to upload screenshot</span>
                  </>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Transfer Reference (optional)</label>
                <input type="text" value={claimedRef} onChange={(e) => setClaimedRef(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="e.g. GTB-123456" />
              </div>

              <button type="submit" disabled={!screenshot || loading} className="flex w-full items-center justify-center rounded-lg bg-foreground py-3 text-sm font-medium text-background disabled:opacity-50">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit for approval'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/dashboard" className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground">
          Skip for now. I'll pay later.
        </Link>
      </div>
    </div>
  );
}