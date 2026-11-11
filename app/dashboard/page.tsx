import { requireAuth } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase';
import { DashboardView } from '@/features/seller/DashboardView';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Dashboard · PrimeMart',
  description: 'Manage your listings, track views, and grow your sales.',
};

export default async function DashboardPage() {
  const session = await requireAuth();
  const { profile } = session;

  // 1. If they are an admin, send them to the admin panel instead
  if (profile.role === 'admin') {
    redirect('/admin');
  }

  // 2. If they are a buyer, send them to their account page
  if (profile.role === 'buyer') {
    redirect('/account');
  }

  // 3. If they are a seller but haven't paid, send them to the paywall
  if (profile.seller_status === 'unpaid' || profile.seller_status === 'pending') {
    redirect('/paywall');
  }

  // 4. Fetch their listings
  const supabase = await createServerSupabase();

  const { data: listings, error } = await supabase
    .from('listings')
    .select('*')
    .eq('seller_id', profile.id)
    .neq('status', 'deleted')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching listings:", error.message);
  }

  // 5. Render the glassmorphism dashboard
  return (
    <DashboardView 
      user={profile} 
      initialListings={listings || []} 
    />
  );
}