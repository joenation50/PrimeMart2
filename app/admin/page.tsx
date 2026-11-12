'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { PaymentReview } from '@/features/admin/PaymentReview';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function AdminDashboard() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

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

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-foreground">Approval Queue</h1>
      
      {payments.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground">All caught up!</h2>
          <p className="text-muted-foreground mt-2">There are no pending payments to review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <PaymentReview key={payment.id} payment={payment} onProcessed={fetchPayments} />
          ))}
        </div>
      )}
    </div>
  );
}