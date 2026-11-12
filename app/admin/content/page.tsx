import { createServerSupabase } from '@/lib/supabase';

export default async function ContentPage() {
  const supabase = await createServerSupabase();
  const { data: categories } = await supabase.from('categories').select('*').order('sort_order');

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-foreground">Content & Categories</h1>
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Active Categories</h2>
        <ul className="space-y-2">
          {categories?.map(c => <li key={c.id} className="text-muted-foreground">{c.name}</li>)}
        </ul>
      </div>
    </div>
  );
}