'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { ArrowLeft, AlertTriangle, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function ReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetType = searchParams.get('type') || 'seller';
  const targetId = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [reason, setReason] = useState('Scam or Fraud');
  const [details, setDetails] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!targetId) return setErrorMsg('Invalid report target.');

    setLoading(true);
    setErrorMsg('');
    const supabase = createBrowserSupabase();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    // Fetch the user's role to satisfy the database constraint
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
    const role = profile?.role || 'buyer';

    const { error } = await supabase.from('reports').insert({
      reporter_id: user.id,
      reporter_role: role,
      target_type: targetType,
      target_id: targetId,
      reason: reason,
      details: details,
      status: 'pending'
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Report Submitted</h1>
        <p className="text-muted-foreground mb-8">Our admin team will review this report shortly. Thank you for helping keep PrimeMart safe.</p>
        <Link href="/marketplace" className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-12 pb-32">
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="glass-card rounded-3xl p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="p-3 bg-red-500/10 rounded-xl">
            <ShieldAlert className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground capitalize">Report {targetType}</h1>
            <p className="text-sm text-muted-foreground">Help us keep PrimeMart safe.</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-500/10 p-4 text-red-500">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Reason for Report</label>
            <select 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            >
              <option value="Scam or Fraud">Scam or Fraud</option>
              <option value="Counterfeit Products">Counterfeit Products</option>
              <option value="Inappropriate Content">Inappropriate Content</option>
              <option value="Harassment">Harassment</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Additional Details</label>
            <textarea 
              required
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Please explain what happened..."
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary resize-none"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-500 py-3.5 font-bold text-white disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
}