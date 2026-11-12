import { requireAuth } from '@/lib/auth';
import { PaywallView } from '@/features/payments/PaywallView';
import { createServerSupabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Activate Seller Account · PrimeMart',
};

export default async function PaywallPage() {
  const session = await requireAuth();
  
  // If they are already an active seller, they don't need this page
  if (session.profile.seller_status === 'active') {
    redirect('/dashboard');
  }

  const supabase = await createServerSupabase();
  const { data: existingPayment } = await supabase
    .from('payments')
    .select('*')
    .eq('seller_id', session.profile.id)
    .eq('status', 'pending_review')
    .maybeSingle();

  return (
    <div className="min-h-screen bg-background pt-8 pb-24">
      <PaywallView 
        user={session.profile} 
        existingPayment={existingPayment} 
      />
    </div>
  );
}