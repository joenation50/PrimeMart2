import { createServerSupabase } from '@/lib/supabase';
import { Tag, CheckCircle2 } from 'lucide-react';

export default async function ContentPage() {
  const supabase = await createServerSupabase();
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Tag className="h-6 w-6 text-primary" /> Content & Categories
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage the categories that sellers can choose from when listing products.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
          <h2 className="text-lg font-bold text-foreground">Active Categories</h2>
          <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
            {categories?.length || 0} Total
          </span>
        </div>
        
        {!categories || categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No categories found in the database.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((c) => (
              <div 
                key={c.id} 
                className="flex items-center gap-3 rounded-xl border border-border bg-background p-4 hover:bg-secondary/50 transition-colors"
              >
                <CheckCircle2 className={`h-5 w-5 shrink-0 ${c.active ? 'text-green-500' : 'text-muted-foreground'}`} />
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground font-mono truncate">{c.slug || c.id}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}