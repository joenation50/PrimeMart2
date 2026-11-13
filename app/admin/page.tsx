'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Loader2, CheckCircle2, XCircle, ExternalLink, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { approvePayment, rejectPayment } from './actions';

export default function AdminDashboard() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    setLoading(true);
    setErrorMsg('');
    const supabase = createBrowserSupabase();
    
    // Using the exact relationship we just created in SQL
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        user:seller_id(name, email, seller_code)
      `)
      .eq('status', 'pending_review')
      .order('created_at', { ascending: true });

    if (error) {
      console.error(error);
      setErrorMsg("Database Error: " + error.message);
    } else {
      setPayments(data || []);
    }
    setLoading(false);
  }

  async function handleApprove(paymentId: string, sellerId: string) {
    setActionLoading(paymentId);
    await approvePayment(paymentId, sellerId);
    setPayments(prev => prev.filter(p => p.id !== paymentId));
    setActionLoading(null);
  }

  async function handleReject(paymentId: string, sellerId: string) {
    setActionLoading(paymentId);
    await rejectPayment(paymentId, sellerId);
    setPayments(prev => prev.filter(p => p.id !== paymentId));
    setActionLoading(null);
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-foreground">Approval Queue</h1>
      
      {/* SHOW ERRORS ON SCREEN IF DATABASE FAILS */}
      {errorMsg && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-500/10 p-4 text-red-500 border border-red-500/20">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{errorMsg}</p>
        </div>
      )}

      {payments.length === 0 && !errorMsg ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground">All caught up!</h2>
          <p className="text-muted-foreground mt-2">There are no pending payments to review.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {payments.map((payment) => (
            <div key={payment.id} className="glass-card rounded-2xl p-6 flex flex-col md:flex-row gap-6">
              
              {/* Screenshot Preview */}
              <div className="relative h-48 w-full md:w-48 shrink-0 rounded-xl overflow-hidden bg-secondary border border-border">
                <a href={payment.proof_url} target="_blank" rel="noreferrer" className="block w-full h-full relative group">
                  <Image src={payment.proof_url} alt="Proof" fill className="object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="h-6 w-6 text-white" />
                  </div>
                </a>
              </div>

              {/* Details & Actions */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{payment.user?.name || 'Unknown User'}</h3>
                      <p className="text-sm text-muted-foreground">{payment.user?.email}</p>
                      <p className="text-xs font-mono text-muted-foreground mt-1">Code: {payment.user?.seller_code}</p>
                    </div>
                    <span className="rounded-full bg-amber-500/10 text-amber-500 px-3 py-1 text-xs font-bold uppercase">
                      Pending
                    </span>
                  </div>

                  <div className="mt-4 space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Amount:</span> <span className="font-semibold text-primary">₦{payment.amount?.toLocaleString()}</span></p>
                    <p><span className="text-muted-foreground">Reference:</span> {payment.reference}</p>
                    <p><span className="text-muted-foreground">Date:</span> {new Date(payment.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button 
                    onClick={() => handleApprove(payment.id, payment.seller_id)}
                    disabled={actionLoading === payment.id}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {actionLoading === payment.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Approve
                  </button>
                  
                  <button 
                    onClick={() => handleReject(payment.id, payment.seller_id)}
                    disabled={actionLoading === payment.id}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 py-2.5 text-sm font-semibold disabled:opacity-50"
                  >
                    {actionLoading === payment.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                    Reject
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}