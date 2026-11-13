'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { 
  Loader2, MessageCircle, ShieldCheck, MapPin, ArrowLeft, 
  Heart, Share2, Flag, Star, AlertCircle, Phone, Package, Store 
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/format';
import { toggleFavorite, trackWhatsAppClick, trackView } from '@/actions/social';
import { cn } from '@/lib/utils';

export default function PublicListingPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    async function fetchListing() {
      const supabase = createBrowserSupabase();
      
      // 1. Get current user (can be null if guest)
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // 2. Fetch listing details (Added store_slug and seller_code to get the store link)
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *, 
          users(name, phone, store_slug, seller_code, verification_level, rating_avg, rating_count), 
          seller_profiles!listings_seller_profile_fkey(business_name, based_city, logo_url)
        `)
        .eq('id', params.id)
        .maybeSingle();
      
      if (error) {
        setErrorMsg("Database Error: " + error.message);
      } else if (data) {
        setListing(data);
        
        // Track view if logged in
        if (user) {
          trackView(data.id);
        }

        // Check if favorited
        if (user) {
          const { data: fav } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('listing_id', data.id)
            .maybeSingle();
          setIsFavorited(!!fav);
        }
      }
      setLoading(false);
    }
    fetchListing();
  }, [params.id]);

  async function handleFavorite() {
    if (!currentUser) {
      alert("Please join PrimeMart to save your favorite items!");
      router.push(`/login?redirect=/listing/${params.id}`);
      return;
    }
    setIsFavorited(!isFavorited);
    await toggleFavorite(listing.id);
  }

  function handleContactClick(e: React.MouseEvent) {
    if (!currentUser) {
      e.preventDefault();
      alert("Please join PrimeMart to view contact details and message this seller.");
      router.push(`/login?redirect=/listing/${params.id}`);
      return;
    }
    trackWhatsAppClick(listing.id);
  }

  async function handleShare() {
    const url = window.location.href;
    const shareData = { title: listing.title, text: `Check out ${listing.title} on PrimeMart`, url };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      }
    } catch (err) {}
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  
  if (errorMsg) return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h1 className="text-xl font-bold text-foreground mb-2">Error</h1>
      <p className="text-red-500 font-mono text-sm max-w-md">{errorMsg}</p>
    </div>
  );

  if (!listing) return <div className="text-center py-20 text-foreground">Listing not found.</div>;

  const sellerName = listing.seller_profiles?.business_name || listing.users?.name || 'Seller';
  const sellerLogo = listing.seller_profiles?.logo_url;
  const isVerified = listing.users?.verification_level === 'verified';
  const phoneNumber = listing.users?.phone;
  
  // Construct the store link
  const storeIdentifier = listing.users?.store_slug || listing.users?.seller_code;
  const storeLink = storeIdentifier ? `/store/${storeIdentifier}` : null;
  
  const whatsappLink = phoneNumber 
    ? `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=Hi, I saw your listing '${listing.title}' on PrimeMart. Is it still available?`
    : null;
  
  const images = listing.images || [];
  const primaryImage = images.length > 0 ? images[activeImage] : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-background pb-32 md:pb-8">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="h-4 w-4" /> Back to Marketplace</Link>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* IMAGE GALLERY */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-secondary">
              <Image src={primaryImage} alt={listing.title} fill className="object-cover" />
              <button onClick={handleFavorite} className="absolute top-4 right-4 p-3 rounded-full glass-card hover:scale-110 transition-transform">
                <Heart className={cn("h-5 w-5", isFavorited ? "fill-red-500 text-red-500" : "text-foreground")} />
              </button>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
                {images.map((img: string, i: number) => (
                  <button key={i} onClick={() => setActiveImage(i)} className={cn("relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border-2", activeImage === i ? "border-primary" : "border-transparent")}>
                    <Image src={img} alt={`View ${i+1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DETAILS */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{listing.category || 'General'}</span>
            </div>
            
            <h1 className="text-3xl font-bold text-foreground mb-2">{listing.title}</h1>
            
            <div className="flex items-end justify-between mb-6">
              <p className="text-3xl font-bold text-primary">{listing.price_negotiable ? 'Negotiable' : formatPrice(listing.price, listing.currency)}</p>
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Package className="h-4 w-4" /> Qty: {listing.quantity || 1}
              </p>
            </div>

            {/* SELLER & CONTACT BLOCK */}
            <div className="glass-card rounded-2xl p-4 flex flex-col gap-3 mb-6">
              
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-4">
                  <div className="relative h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-lg font-bold overflow-hidden shrink-0">
                    {sellerLogo ? (
                      <Image src={sellerLogo} alt={sellerName} fill className="object-cover" />
                    ) : (
                      sellerName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="font-semibold flex items-center gap-1">{sellerName} {isVerified && <ShieldCheck className="h-4 w-4 text-primary" />}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {listing.seller_profiles?.based_city || listing.location || 'Nigeria'}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      <span className="text-xs font-medium">{listing.users?.rating_avg?.toFixed(1) || '0.0'} ({listing.users?.rating_count || 0} reviews)</span>
                    </div>
                  </div>
                </div>

                {/* VISIT STORE BUTTON */}
                {storeLink && (
                  <Link 
                    href={storeLink} 
                    target="_blank"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary/80 transition-colors"
                  >
                    <Store className="h-3.5 w-3.5" /> Visit Store
                  </Link>
                )}
              </div>

              {/* SHOW PHONE NUMBER IF LOGGED IN */}
              {currentUser && phoneNumber && (
                <div className="mt-2 pt-3 border-t border-border flex items-center gap-2 text-sm font-medium text-foreground">
                  <Phone className="h-4 w-4 text-primary" />
                  {phoneNumber}
                </div>
              )}
            </div>

            <div className="text-muted-foreground whitespace-pre-wrap mb-8">{listing.description}</div>

            {/* DESKTOP ACTIONS */}
            <div className="hidden md:flex gap-2 mt-auto">
              {whatsappLink ? (
                <a 
                  href={currentUser ? whatsappLink : '#'} 
                  onClick={handleContactClick} 
                  target={currentUser ? "_blank" : "_self"} 
                  rel="noreferrer" 
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-green-500 py-4 font-bold text-white hover:bg-green-600 shadow-lg"
                >
                  <MessageCircle className="h-5 w-5" /> Message on WhatsApp
                </a>
              ) : (
                <div className="flex flex-1 items-center justify-center gap-2 rounded-full bg-secondary py-4 font-bold text-muted-foreground cursor-not-allowed">
                  <MessageCircle className="h-5 w-5" /> Contact Unavailable
                </div>
              )}
              <button onClick={handleShare} className="p-4 rounded-full border border-border hover:bg-secondary"><Share2 className="h-5 w-5" /></button>
              <button className="p-4 rounded-full border border-border hover:bg-red-500/10 text-red-500"><Flag className="h-5 w-5" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY ACTIONS */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-md border-t border-border z-40 flex gap-2">
        {whatsappLink ? (
          <a 
            href={currentUser ? whatsappLink : '#'} 
            onClick={handleContactClick} 
            target={currentUser ? "_blank" : "_self"} 
            rel="noreferrer" 
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-500 py-3 font-bold text-white"
          >
            <MessageCircle className="h-5 w-5" /> WhatsApp
          </a>
        ) : (
          <div className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-secondary py-3 font-bold text-muted-foreground">Contact Unavailable</div>
        )}
        <button onClick={handleShare} className="p-3 rounded-xl border border-border bg-background"><Share2 className="h-5 w-5" /></button>
      </div>
    </div>
  );
}