'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import { Loader2, Star, MessageSquare, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/format';

export default function SellerReviewsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    async function loadReviews() {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) { router.replace('/login'); return; }

      const { data, error } = await supabase
        .from('reviews')
        .select(`*, buyer:buyer_id(name, email)`)
        .eq('seller_id', user.id)
        .eq('status', 'visible')
        .order('created_at', { ascending: false });

      if (data) setReviews(data);
      setLoading(false);
    }
    loadReviews();
  }, [router]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : '0.0';

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 pb-32">
      <Link href="/seller" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-primary" /> Customer Reviews
        </h1>
        
        <div className="glass-card px-6 py-3 rounded-2xl flex items-center gap-3">
          <span className="text-3xl font-black text-amber-500">{averageRating}</span>
          <div className="flex flex-col">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`h-4 w-4 ${s <= Number(averageRating) ? 'fill-amber-500 text-amber-500' : 'fill-muted text-muted'}`} />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{reviews.length} total reviews</span>
          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold text-foreground">No reviews yet</h2>
          <p className="text-muted-foreground mt-2">When buyers review your store, they will show up here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="glass-card rounded-2xl p-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold text-foreground">{review.buyer?.name || 'Anonymous Buyer'}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(review.created_at)}</p>
                </div>
                <div className="flex items-center gap-1 bg-amber-500/10 px-3 py-1 rounded-full">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  <span className="text-sm font-bold text-amber-500">{review.rating}.0</span>
                </div>
              </div>
              <p className="text-sm text-foreground leading-relaxed mt-3">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}