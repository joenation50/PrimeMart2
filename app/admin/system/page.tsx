import { BannerManager } from '@/features/admin/BannerManager';
import { createServerSupabase } from '@/lib/supabase';

export default async function SystemPage() {
  const supabase = await createServerSupabase();
  const { data: banners } = await supabase.from('banners').select('*').order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-foreground">System Settings</h1>
      <BannerManager initialBanners={banners || []} />
    </div>
  );
}