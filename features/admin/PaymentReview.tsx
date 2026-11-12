'use client';

import { useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Check, X, Loader2, ExternalLink } from 'lucide-react';
import { formatPrice } from '@/lib/format';

export function PaymentReview({ payment, onProcessed }: { payment: any; onProcessed: () => void }) {
  const [loading, setLoading] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  async function handleApprove() {
    setLoading(true);
    const supabase = createBrowserSupabase();

    // 1. Update Payment to Approved
    await supabase.from('payments').update({
      status: 'approved',
      approved_at: new Date().toISOString(),
    }).eq('id', payment.id);

    // 2. Calculate 1 year expiry
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // 3. Upgrade the User to Seller
    await supabase.from('users').update({
      role: 'seller',
      seller_status: 'active',
      seller_expires_at: expiresAt.toISOString(),
      verification_level: 'phone'
    }).eq('id', payment.seller_id);

    setLoading(false);
    onProcessed(); // Refresh the list
  }

  async function handleReject() {
    if (!rejectReason) return;
    setLoading(true);
    const supabase = createBrowserSupabase();

    await supabase.from('payments').update({
      status: 'rejected',
      reject_reason: rejectReason,
    }).eq('id', payment.id);

    await supabase.from('users').update({
      seller_status: 'unpaid'
    }).eq('id', payment.seller_id);

    setLoading(false);
    onProcessed();
  }

  const imageUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_400,q_auto/${payment.screenshot_url}`;

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row gap-6">
      {/* Screenshot */}
      <div className="shrink-0">
        <a href={imageUrl} target="_blank" rel="noreferrer" className="group relative block h-40 w-40 overflow-hidden rounded-xl border border-border bg-secondary">
          <img src={imageUrl} alt="Proof" className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
            <ExternalLink className="h-6 w-6 text-white" />
          </div>
        </a>
      </div>

      {/* Details */}
      <div className="flex-1">
        <h3 className="font-semibold text-lg">{payment.user.name}</h3>
        <p className="text-sm text-muted-foreground">{payment.user.email}</p>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Amount</p>
            <p className="font-bold text-primary">{formatPrice(payment.amount, payment.currency)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Seller Code</p>
            <p className="font-mono font-medium">{payment.user.seller_code}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Claimed Ref</p>
            <p className="font-medium">{payment.claimed_ref || 'N/A'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Date</p>
            <p className="font-medium">{new Date(payment.submitted_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col justify-center gap-3 sm:w-48">
        <button onClick={handleApprove} disabled={loading} className="flex items-center justify-center gap-2 rounded-xl bg-green-500 py-3 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Approve
        </button>
        
        {!showReject ? (
          <button onClick={() => setShowReject(true)} className="flex items-center justify-center gap-2 rounded-xl border border-red-500/30 py-3 text-sm font-semibold text-red-500 hover:bg-red-500/10">
            <X className="h-4 w-4" /> Reject
          </button>
        ) : (
          <div className="rounded-xl border border-red-500/30 p-3">
            <input type="text" placeholder="Reason..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="mb-2 w-full rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none" />
            <div className="flex gap-2">
              <button onClick={handleReject} disabled={!rejectReason || loading} className="flex-1 rounded bg-red-500 py-1.5 text-xs font-semibold text-white">Confirm</button>
              <button onClick={() => setShowReject(false)} className="flex-1 rounded border border-border py-1.5 text-xs">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}