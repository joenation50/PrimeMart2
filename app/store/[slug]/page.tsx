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

  useEffect(() => {
    async function fetchStore() {
      const supabase = createBrowserSupabase();
      
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      try {
        // 1. Fetch Store Owner
        // Check if the slug is a valid UUID to prevent Postgres casting errors
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
        
        let query = supabase
          .from('users')
          .select(`
            id, name, phone, store_slug, seller_code, verification_level,
            seller_profiles(business_name, logo_url, based_city, bio, categories)
          `);

        if (isUUID) {
          query = query.or(`id.eq.${slug},store_slug.eq.${slug},seller_code.eq.${slug}`);
        } else {
          query = query.or(`store_slug.eq.${slug},seller_code.eq.${slug}`);
        }

        const { data: owner, error: ownerError } = await query.maybeSingle();

        if (ownerError || !owner) throw new Error('Store not found');
        setStoreOwner(owner);

        // 2. Fetch Store Listings
        const { data: storeListings } = await supabase
          .from('listings')
          .select('*')
          .eq('seller_id', owner.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false });
        
        setListings(storeListings || []);

        // 3. Fetch Store Reviews
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
    }

    if (slug) fetchStore();
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

  function handleBack() {
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push('/marketplace');
    }
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
  const location = storeOwner.seller_profiles?.based_city || 'Nigeria';
  const bio = storeOwner.seller_profiles?.bio || 'Welcome to my store on PrimeMart.';
  
  // --- BULLETPROOF CATEGORIES PARSER ---
  let rawCategories = storeOwner.seller_profiles?.categories;
  let categories: string[] = [];

  try {
    if (Array.isArray(rawCategories)) {
      categories = rawCategories;
    } else if (typeof rawCategories === 'string') {
      if (rawCategories.startsWith('[')) {
        categories = JSON.parse(rawCategories);
      } else {
        categories = rawCategories.split(',').map((c: string) => c.trim());
      }
    }
  } catch (e) {
    categories = ['General'];
  }

  if (!categories || categories.length === 0) {
    categories = ['General'];
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      
      {/* CUSTOM HEADER */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-background/90 px-4 py-4 backdrop-blur-md border-b border-border/50">
        <button onClick={handleBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border text-foreground hover:bg-muted transition-colors shadow-sm">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Store Profile</h1>
        <button onClick={handleShare} className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border text-foreground hover:bg-muted transition-colors shadow-sm">
          <Share2 className="h-5 w-5" />
        </button>
      </header>

      {/* MODERN MESH GRADIENT BANNER */}
      <div className="relative">
        <div className="h-56 w-full overflow-hidden bg-gradient-to-b from-primary/10 to-transparent relative">
          <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-primary/20 blur-[80px]" />
          <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-emerald-500/20 blur-[60px]" />
          <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-teal-500/20 blur-[50px]" />
        </div>

        {/* CSS Keyframes for the Floating Motion */}
        <style jsx>{`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
          .animate-float {
            animation: float 5s ease-in-out infinite;
          }
          .animate-float:hover {
            animation-play-state: paused;
          }
        `}</style>

        {/* FLOATING GLASSMORPHISM PROFILE CARD */}
        <div className="mx-auto max-w-lg px-4 -mt-28 relative z-10">
          <div className="animate-float rounded-[2rem] bg-card/80 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-2xl p-6 text-center transition-transform duration-300 hover:scale-[1.02]">
            
            {/* Logo */}
            <div className="relative mx-auto -mt-16 mb-4 h-24 w-24 rounded-full border-4 border-background bg-muted overflow-hidden shadow-xl flex items-center justify-center">
              {storeLogo ? (
                <Image src={storeLogo} alt={storeName} fill className="object-cover" />
              ) : (
                <span className="text-3xl font-bold text-primary">{storeName.charAt(0).toUpperCase()}</span>
              )}
            </div>

            {/* Store Name & Verification */}
            <h2 className="text-2xl font-extrabold text-foreground flex items-center justify-center gap-2 mb-2">
              {storeName}
              {isVerified && <CheckCircle2 className="h-6 w-6 text-primary fill-primary/20" />}
            </h2>

            {/* ALL CATEGORIES CHIPS */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {categories.map((cat: string, index: number) => (
                <div key={index} className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    {cat}
                  </span>
                </div>
              ))}
            </div>

            {/* Location */}
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-6">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>

            {/* Bio Box */}
            <div className="rounded-2xl bg-background/50 border border-border/50 p-5 mb-6">
              <p className="text-sm text-foreground leading-relaxed">
                {bio}
              </p>
            </div>

            {/* Message Store Button */}
            <button 
              onClick={handleMessageStore}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors mb-4"
            >
              <MessageCircle className="h-5 w-5" />
              Message Store
            </button>

            {/* Report Vendor */}
            <button 
              onClick={handleReport}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-500 hover:text-red-400 transition-colors"
            >
              <Flag className="h-4 w-4" />
              Report Vendor
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
              onClick={() => {
                if (!currentUser) {
                  alert("Please sign in to leave a review.");
                  router.push(`/login?redirect=/store/${slug}`);
                  return;
                }
                alert("Review modal will open here!");
              }} 
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

    </div>
  );
}