'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { PaymentReview } from '@/features/admin/PaymentReview';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function AdminDashboard() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPayments() {
      const supabase = createBrowserSupabase();
      const { data } = await supabase
        .from('payments')
        .select(`
          *,
          user:seller_id(name, email, seller_code, country)
        `)
        .eq('status', 'pending_review')
        .order('submitted_at', { ascending: true });

      setPayments(data || []);
      setLoading(false);
    }
    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-foreground">Pending Payments</h1>
      
      {payments.length === 0 ? (
        <div className="rounded-xl border border-border glass-card p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground">All caught up!</h2>
          <p className="text-muted-foreground mt-2">There are no pending payments to review right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <PaymentReview key={payment.id} payment={payment} />
          ))}
        </div>
      )}
    </div>
  );
}