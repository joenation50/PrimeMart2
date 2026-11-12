import { requireAuth } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase';
import { DashboardView } from '@/features/seller/DashboardView';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle, BarChart } from 'lucide-react';

export const metadata = { title: 'Dashboard · PrimeMart' };

export default async function DashboardPage() {
  const session = await requireAuth();
  const { profile } = session;

  if (profile.role === 'buyer') redirect('/buyer');
  if (profile.role === 'admin') redirect('/admin');
  if (profile.seller_status === 'unpaid' || profile.seller_status === 'pending') redirect('/paywall');

  const supabase = await createServerSupabase();

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('seller_id', profile.id)
    .neq('status', 'deleted')
    .order('created_at', { ascending: false });

  // We pass a custom header to the DashboardView
  return (
    <div className="relative min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-4 pt-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {profile.name}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard/analytics"
              className="flex items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-medium hover:bg-secondary transition-all"
            >
              <BarChart className="h-4 w-4" />
              Analytics
            </Link>
            <Link 
              href="/listings/new"
              className="flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-all"
            >
              <PlusCircle className="h-4 w-4" />
              Add Listing
            </Link>
          </div>
        </div>
      </div>

      {/* We pass a prop to hide the internal header of DashboardView since we built our own above */}
      <DashboardView 
        user={profile} 
        initialListings={listings || []} 
        hideHeader={true} 
      />
    </div>
  );
}