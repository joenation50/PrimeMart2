// app/admin/page.tsx
import { createServerSupabase } from '@/lib/supabase';
import { PaymentReview } from '@/features/admin/PaymentReview';

export default async function AdminDashboard() {
  const supabase = await createServerSupabase();
  
  // Fetch pending payments with user details
  const { data: payments } = await supabase
    .from('payments')
    .select(`
      *,
      user:seller_id(name, email, seller_code, country)
    `)
    .eq('status', 'pending_review')
    .order('submitted_at', { ascending: true });
  
  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">Pending Payments</h1>
      {!payments || payments.length === 0 ? (
        <div className="rounded-xl border border-border bg-background p-12 text-center text-muted-foreground">
          All caught up! No pending payments to review.
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment: any) => (
            <PaymentReview key={payment.id} payment={payment} />
          ))}
        </div>
      )}
    </div>
  );
}