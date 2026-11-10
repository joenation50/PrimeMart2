// app/admin/system/page.tsx
import { createServerSupabase } from '@/lib/supabase';
import { BannerManager } from '@/features/admin/BannerManager';

export default async function SystemPage() {
  const supabase = await createServerSupabase();
  const { data: banners } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
  
  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">System Settings</h1>
      <BannerManager initialBanners={banners || []} />
    </div>
  );
}