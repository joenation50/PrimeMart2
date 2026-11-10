// features/admin/PaymentReview.tsx
'use client';

import { useState } from 'react';
import { approvePayment, rejectPayment } from '@/actions/admin';
import { Check, X, ExternalLink, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/format';

export function PaymentReview({ payment }: { payment: any }) {
  const [loading, setLoading] = useState < 'approve' | 'reject' | null > (null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  
  async function handleApprove() {
    setLoading('approve');
    await approvePayment(payment.id);
    setLoading(null);
  }
  
  async function handleReject() {
    if (!rejectReason) return;
    setLoading('reject');
    await rejectPayment(payment.id, rejectReason);
    setLoading(null);
  }
  
  const imageUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_400,q_auto/${payment.screenshot_url}`;
  
  return (
    <div className="flex flex-col gap-6 rounded-xl border border-border bg-background p-6 sm:flex-row">
      {/* Image */}
      <div className="shrink-0">
        <a href={imageUrl} target="_blank" rel="noreferrer" className="group relative block h-48 w-48 overflow-hidden rounded-lg border border-border bg-muted">
          <img src={imageUrl} alt="Proof" className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
            <ExternalLink className="h-6 w-6 text-white" />
          </div>
        </a>
      </div>

      {/* Details */}
      <div className="flex-1 space-y-2">
        <h3 className="font-semibold">{payment.user.name} <span className="font-normal text-muted-foreground">({payment.user.email})</span></h3>
        <p className="text-sm">Code: <span className="font-mono font-medium">{payment.user.seller_code}</span></p>
        <p className="text-sm">Amount: <span className="font-medium">{formatPrice(payment.amount, payment.currency)}</span></p>
        {payment.claimed_ref && <p className="text-sm">Claimed Ref: {payment.claimed_ref}</p>}
        <p className="text-sm text-muted-foreground">Submitted: {new Date(payment.submitted_at).toLocaleString()}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col justify-center gap-3 sm:w-48">
        <button onClick={handleApprove} disabled={!!loading} className="flex items-center justify-center gap-2 rounded-lg bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">
          {loading === 'approve' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Approve
        </button>
        
        {!showRejectBox ? (
          <button onClick={() => setShowRejectBox(true)} className="flex items-center justify-center gap-2 rounded-lg border border-red-200 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
            <X className="h-4 w-4" /> Reject
          </button>
        ) : (
          <div className="rounded-lg border border-red-200 p-2">
            <input type="text" placeholder="Reason..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="mb-2 w-full rounded border border-border px-2 py-1 text-xs" />
            <div className="flex gap-2">
              <button onClick={handleReject} disabled={!rejectReason || !!loading} className="flex-1 rounded bg-red-600 py-1 text-xs font-medium text-white disabled:opacity-50">
                {loading === 'reject' ? '...' : 'Confirm'}
              </button>
              <button onClick={() => setShowRejectBox(false)} className="flex-1 rounded border border-border py-1 text-xs">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}