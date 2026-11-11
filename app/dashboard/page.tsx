import { requireAuth } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase';
import { DashboardView } from '@/features/seller/DashboardView';
import { redirect } from 'next/navigation';

export const metadata = { title: 'Dashboard · PrimeMart' };

export default async function DashboardPage() {
  const session = await requireAuth();
  const { profile } = session;

  // If they are a buyer, send them to their account page
  if (profile.role === 'buyer') {
    redirect('/account');
  }

  // If they are a seller but haven't paid, send them to the paywall
  if (profile.role === 'seller' && (profile.seller_status === 'unpaid' || profile.seller_status === 'pending')) {
    redirect('/paywall');
  }

  const supabase = await createServerSupabase();

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('seller_id', profile.id)
    .neq('status', 'deleted')
    .order('created_at', { ascending: false });

  return (
    <DashboardView 
      user={profile} 
      initialListings={listings || []} 
    />
  );
}