'use client';

import { useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Star, X, Loader2 } from 'lucide-react';

export function ReviewModal({ 
  isOpen, 
  onClose, 
  storeId, 
  onReviewAdded 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  storeId: string;
  onReviewAdded: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const supabase = createBrowserSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('You must be logged in to leave a review.');
      setLoading(false);
      return;
    }

    const { error: submitError } = await supabase.from('reviews').insert({
      store_id: storeId,
      reviewer_id: user.id,
      rating,
      comment
    });

    if (submitError) {
      setError(submitError.message);
      setLoading(false);
      return;
    }

    onReviewAdded(); // Refresh the reviews list on the store page
    setLoading(false);
    onClose();
    setRating(5);
    setComment('');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-card border border-border p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute right-4 top-4 p-2 rounded-full hover:bg-secondary transition-colors">
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
        
        <h2 className="text-2xl font-bold text-foreground mb-2">Write a Review</h2>
        <p className="text-sm text-muted-foreground mb-6">Share your experience with this store.</p>

        {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Star Rating */}
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star className={`h-8 w-8 ${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
              </button>
            ))}
          </div>

          <textarea
            placeholder="What did you like or dislike?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full h-32 rounded-xl border border-border bg-background p-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none mb-6"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}