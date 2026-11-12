'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { PaywallView } from '@/features/payments/PaywallView';
import { Loader2 } from 'lucide-react';

export default function PaywallPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [existingPayment, setExistingPayment] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const supabase = createBrowserSupabase();
      
      // 1. Get user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        window.location.href = '/login';
        return;
      }

      // 2. Get profile
      const { data: profile } = await supabase.from('users').select('*').eq('id', authUser.id).single();
      
      if (profile?.seller_status === 'active') {
        window.location.href = '/dashboard';
        return;
      }

      // 3. Check for existing payment
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('seller_id', authUser.id)
        .eq('status', 'pending_review')
        .maybeSingle();

      setUser(profile);
      setExistingPayment(payment);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-8 pb-24">
      <PaywallView user={user} existingPayment={existingPayment} />
    </div>
  );
}