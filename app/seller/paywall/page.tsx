'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Loader2 } from 'lucide-react';
import { PaywallView } from '@/features/payments/PaywallView';

export default function SellerPaywallPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [existingPayment, setExistingPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }

      // Check if they already submitted a payment
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('seller_id', user.id)
        .eq('status', 'pending_review')
        .maybeSingle();

      setUser(user);
      setExistingPayment(payment);
      setLoading(false);
    }
    loadData();
  }, [router]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-background pt-8 pb-24">
      <PaywallView user={user} existingPayment={existingPayment} />
    </div>
  );
}