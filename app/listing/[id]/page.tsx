'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Loader2, MessageCircle, ShieldCheck, MapPin, ArrowLeft, Heart, Share2, Flag, Star } from 'lucide-react';
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
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    async function fetchListing() {
      const supabase = createBrowserSupabase();
      
      const { data: { user } } = await supabase.auth.getUser();
      
      // AUTH GATE: If they aren't logged in, send them to login
      if (!user) {
        router.replace(`/login?redirect=/listing/${params.id}`);
        return;
      }
      
      setCurrentUser(user);

      const { data } = await supabase
        .from('listings')
        // Added logo_url to seller_profiles query
        .select(`*, users(name, phone, verification_level, rating_avg, rating_count), seller_profiles(business_name, based_city, logo_url)`)
        .eq('id', params.id)
        .single();
      
      if (data) {
        setListing(data);
        trackView(data.id); // Track the view since they are logged in

        // Check if favorited
        const { data: fav } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('listing_id', data.id)
          .maybeSingle();
        setIsFavorited(!!fav);
      }
      setLoading(false);
    }
    fetchListing();
  }, [params.id, router]);

  async function handleFavorite() {
    if (!currentUser) {
      router.push(`/login?redirect=/listing/${params.id}`);
      return;
    }
    // Optimistic UI update
    setIsFavorited(!isFavorited);
    await toggleFavorite(listing.id);
  }

  function handleWhatsAppClick(e: React.MouseEvent) {
    if (!currentUser) {
      e.preventDefault();
      router.push(`/login?redirect=/listing/${params.id}`);
      return;
    }
    trackWhatsAppClick(listing.id);
  }

  async function handleShare() {
    const url = window.location.href;
    const shareData = {
      title: listing.title,
      text: `Check out ${listing.title} on PrimeMart`,
      url: url,
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  }

  function handleReport() {
    router.push(`/report?type=listing&id=${listing.id}`);
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!listing) return <div className="text-center py-20 text-foreground">Listing not found.</div>;

  const sellerName = listing.seller_profiles?.business_name || listing.users?.name || 'Seller';
  const sellerLogo = listing.seller_profiles?.logo_url;
  const isVerified = listing.users?.verification_level === 'verified';
  
  // SAFE WHATSAPP LINK
  const whatsappLink = listing.users?.phone 
    ? `https://wa.me/${listing.users.phone.replace(/\D/g, '')}?text=Hi, I saw your listing '${listing.title}' on PrimeMart. Is it still available?`
    : null;
  
  // Since we now save full URLs to the database, we can use them directly.
  const images = listing.images || [];
  const primaryImage = images.length > 0 
    ? images[activeImage] 
    : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop";

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
            <p className="text-3xl font-bold text-primary mb-6">{listing.price_negotiable ? 'Negotiable' : formatPrice(listing.price, listing.currency)}</p>

            {/* SELLER BLOCK WITH LOGO */}
            <div className="glass-card rounded-2xl p-4 flex items-center justify-between mb-6">
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
            </div>

            <div className="text-muted-foreground whitespace-pre-wrap mb-8">{listing.description}</div>

            {/* DESKTOP ACTIONS */}
            <div className="hidden md:flex gap-2 mt-auto">
              {whatsappLink ? (
                <a href={whatsappLink} onClick={handleWhatsAppClick} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-green-500 py-4 font-bold text-white hover:bg-green-600 shadow-lg">
                  <MessageCircle className="h-5 w-5" /> Message on WhatsApp
                </a>
              ) : (
                <div className="flex flex-1 items-center justify-center gap-2 rounded-full bg-secondary py-4 font-bold text-muted-foreground cursor-not-allowed">
                  <MessageCircle className="h-5 w-5" /> Contact Unavailable
                </div>
              )}
              <button onClick={handleShare} className="p-4 rounded-full border border-border hover:bg-secondary" aria-label="Share listing">
                <Share2 className="h-5 w-5" />
              </button>
              <button onClick={handleReport} className="p-4 rounded-full border border-border hover:bg-red-500/10 text-red-500" aria-label="Report listing">
                <Flag className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY ACTIONS */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-md border-t border-border z-40 flex gap-2">
        {whatsappLink ? (
          <a href={whatsappLink} onClick={handleWhatsAppClick} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-500 py-3 font-bold text-white">
            <MessageCircle className="h-5 w-5" /> WhatsApp
          </a>
        ) : (
          <div className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-secondary py-3 font-bold text-muted-foreground">
            Contact Unavailable
          </div>
        )}
        <button onClick={handleShare} className="p-3 rounded-xl border border-border bg-background" aria-label="Share listing">
          <Share2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}