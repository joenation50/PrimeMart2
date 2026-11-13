'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { DashboardView } from '@/features/seller/DashboardView';
import { Loader2 } from 'lucide-react';

export default function SellerDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) { window.location.href = '/login'; return; }

      const { data: profileData } = await supabase.from('users').select('*').eq('id', user.id).single();
      
      if (!profileData) { window.location.href = '/login'; return; }
      
      // Redirect buyers and admins
      if (profileData.role === 'buyer') { window.location.href = '/buyer'; return; }
      if (profileData.role === 'admin') { window.location.href = '/admin'; return; }

      // FIXED: Only kick them out if they are completely UNPAID. 
      // If they are 'pending', they are allowed to see the dashboard.
      if (profileData.seller_status === 'unpaid') {
        window.location.href = '/seller/paywall'; return;
      }

      const { data: listingsData } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', profileData.id)
        .neq('status', 'deleted')
        .order('created_at', { ascending: false });

      setProfile(profileData);
      setListings(listingsData || []);
      setLoading(false);
    }
    loadDashboard();
  }, []);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return <DashboardView user={profile} initialListings={listings} />;
}