// app/admin/moderation/page.tsx
import { createServerSupabase } from '@/lib/supabase';
import { ReportQueue } from '@/features/admin/ReportQueue';

export default async function ModerationPage() {
  const supabase = await createServerSupabase();
  const { data: reports } = await supabase
    .from('reports')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  
  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">Moderation Queue</h1>
      <ReportQueue reports={reports || []} />
    </div>
  );
}