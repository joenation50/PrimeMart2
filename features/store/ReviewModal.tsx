'use client';

import { useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Star, Loader2, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ReviewModal({ 
  sellerId, 
  sellerName, 
  onClose, 
  onSuccess 
}: { 
  sellerId: string; 
  sellerName: string; 
  onClose: () => void; 
  onSuccess: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

    // Insert the review
    const { error: dbError } = await supabase.from('reviews').insert({
      seller_id: sellerId,
      buyer_id: user.id,
      rating: rating,
      comment: comment,
      status: 'visible'
    });

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
    } else {
      onSuccess();
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div 
        className="w-full max-w-md rounded-3xl bg-background border border-border p-6 shadow-2xl animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Review {sellerName}</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full text-muted-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 p-3 text-sm text-red-500">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-medium text-muted-foreground">Tap to rate</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star 
                    className={cn(
                      "h-8 w-8 transition-colors", 
                      star <= rating ? "fill-amber-500 text-amber-500" : "fill-muted text-muted-foreground"
                    )} 
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment Box */}
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Your Review</label>
            <textarea 
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was your experience with this seller?"
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}