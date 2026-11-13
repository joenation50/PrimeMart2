'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { 
  ArrowLeft, Share2, MapPin, CheckCircle2, 
  MessageCircle, Flag, Star, Loader2, Package 
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ListingGrid } from '@/features/marketplace/grid';
import { formatDate } from '@/lib/format';
import { ReviewModal } from '@/features/store/ReviewModal'; // <-- IMPORT MODAL

export default function PublicStorePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [storeOwner, setStoreOwner] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // State for the modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Extract fetch logic so we can call it again after submitting a review
  const fetchStoreData = async () => {
    const supabase = createBrowserSupabase();
    try {
      const { data: owner, error: ownerError } = await supabase
        .from('users')
        .select(`
          id, name, phone, store_slug, seller_code, verification_level,
          seller_profiles(business_name, logo_url, based_city, bio, categories)
        `)
        .or(`store_slug.eq.${slug},seller_code.eq.${slug}`)
        .maybeSingle();

      if (ownerError || !owner) throw new Error('Store not found');
      setStoreOwner(owner);

      const { data: storeListings } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', owner.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      setListings(storeListings || []);

      const { data: storeReviews } = await supabase
        .from('reviews')
        .select(`*, buyer:buyer_id(name)`)
        .eq('seller_id', owner.id)
        .eq('status', 'visible')
        .order('created_at', { ascending: false });
      setReviews(storeReviews || []);

    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      await fetchStoreData();
    }
    if (slug) init();
  }, [slug]);

  async function handleShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: storeOwner?.seller_profiles?.business_name || 'Store', url });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      }
    } catch (err) {}
  }

  function handleMessageStore() {
    if (!currentUser) {
      alert("Please sign in to message this store.");
      router.push(`/login?redirect=/store/${slug}`);
      return;
    }
    const phone = storeOwner?.phone;
    if (!phone) return alert("This seller hasn't added a phone number.");
    
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Hi ${storeOwner?.seller_profiles?.business_name}, I found your store on PrimeMart!`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  }

  function handleReport() {
    if (!currentUser) {
      alert("Please sign in to report this vendor.");
      router.push(`/login?redirect=/store/${slug}`);
      return;
    }
    router.push(`/report?type=seller&id=${storeOwner.id}`);
  }

  function handleWriteReview() {
    if (!currentUser) {
      alert("Please sign in to leave a review.");
      router.push(`/login?redirect=/store/${slug}`);
      return;
    }
    if (currentUser.id === storeOwner.id) {
      alert("You cannot review your own store.");
      return;
    }
    setIsReviewModalOpen(true);
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (errorMsg || !storeOwner) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <Package className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Store Not Found</h1>
        <p className="text-muted-foreground mb-6">{errorMsg || `The store "${slug}" does not exist.`}</p>
        <Link href="/marketplace" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const storeName = storeOwner.seller_profiles?.business_name || storeOwner.name || 'Seller Store';
  const storeLogo = storeOwner.seller_profiles?.logo_url;
  const isVerified = storeOwner.verification_level === 'verified';
  const category = storeOwner.seller_profiles?.categories?.[0] || 'General';
  const location = storeOwner.seller_profiles?.based_city || 'Nigeria';
  const bio = storeOwner.seller_profiles?.bio || 'Welcome to my store on PrimeMart.';

  return (
    <div className="min-h-screen bg-background pb-24">
      
      {/* CUSTOM HEADER */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-background/90 px-4 py-4 backdrop-blur-md">
        <button onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border text-foreground hover:bg-muted transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Store Profile</h1>
        <button onClick={handleShare} className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border text-foreground hover:bg-muted transition-colors">
          <Share2 className="h-5 w-5" />
        </button>
      </header>

      {/* BANNER SECTION */}
      <div className="relative overflow-hidden">
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
          <Image src="/logo-white.png" alt="Watermark" width={400} height={400} className="hidden dark:block object-contain scale-150" />
          <Image src="/logo-black.png" alt="Watermark" width={400} height={400} className="block dark:hidden object-contain scale-150" />
        </div>

        <div className="h-48 w-full bg-gradient-to-br from-primary/20 to-primary/5" />

        <div className="mx-auto max-w-lg px-4 -mt-24 relative z-10">
          <div className="rounded-3xl bg-card border border-border shadow-xl p-6 text-center">
            <div className="relative mx-auto -mt-16 mb-4 h-24 w-24 rounded-full border-4 border-background bg-muted overflow-hidden shadow-lg flex items-center justify-center">
              {storeLogo ? (
                <Image src={storeLogo} alt={storeName} fill className="object-cover" />
              ) : (
                <span className="text-3xl font-bold text-primary">{storeName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <h2 className="text-2xl font-extrabold text-foreground flex items-center justify-center gap-2 mb-2">
              {storeName}
              {isVerified && <CheckCircle2 className="h-6 w-6 text-primary fill-primary/20" />}
            </h2>
            <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">{category}</span>
            </div>
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-6">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
            <div className="rounded-2xl bg-secondary/50 border border-border/50 p-5 mb-6">
              <p className="text-sm text-foreground leading-relaxed">{bio}</p>
            </div>
            <button onClick={handleMessageStore} className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors mb-4">
              <MessageCircle className="h-5 w-5" /> Message Store
            </button>
            <button onClick={handleReport} className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-500 hover:text-red-400 transition-colors">
              <Flag className="h-4 w-4" /> Report Vendor
            </button>
          </div>
        </div>
      </div>

      {/* STORE REVIEWS SECTION */}
      <div className="mx-auto max-w-lg px-4 mt-8">
        <div className="rounded-3xl bg-card border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">Store Reviews</h3>
            <button 
              onClick={handleWriteReview} // <-- Connects to the modal
              className="rounded-full bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition-colors"
            >
              Write Review
            </button>
          </div>
          
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No reviews yet. Be the first!</p>
          ) : (
            <div className="space-y-4">
              {reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-foreground">{review.buyer?.name || 'Anonymous'}</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      <span className="text-xs font-semibold text-foreground">{review.rating}.0</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{review.comment}</p>
                  <p className="text-[10px] text-muted-foreground mt-2">{formatDate(review.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* STORE PRODUCTS */}
      <div className="mx-auto max-w-lg px-4 mt-8">
        <h3 className="text-lg font-bold text-foreground mb-4">Products from this Store</h3>
        {listings.length === 0 ? (
          <div className="rounded-3xl bg-card border border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">This seller hasn't listed any products yet.</p>
          </div>
        ) : (
          <ListingGrid listings={listings} />
        )}
      </div>

      {/* RENDER THE MODAL */}
      {isReviewModalOpen && (
        <ReviewModal 
          sellerId={storeOwner.id}
          sellerName={storeName}
          onClose={() => setIsReviewModalOpen(false)}
          onSuccess={() => fetchStoreData()} // Refresh the reviews list
        />
      )}

    </div>
  );
}