'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Loader2, MessageCircle, ShieldCheck, MapPin, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/format';

export default function PublicListingPage() {
  const params = useParams();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchListing() {
      const supabase = createBrowserSupabase();
      
      // Fetch the listing and join the seller profile
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          users(name, phone, verification_level),
          seller_profiles(business_name, based_city)
        `)
        .eq('id', params.id)
        .single();

      if (!error && data) {
        setListing(data);
      }
      setLoading(false);
    }
    fetchListing();
  }, [params.id]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!listing) {
    return <div className="text-center py-20 text-foreground">Listing not found.</div>;
  }

  const sellerName = listing.seller_profiles?.business_name || listing.users?.name || 'Seller';
  const isVerified = listing.users?.verification_level === 'verified';
  const whatsappLink = `https://wa.me/${listing.users?.phone}?text=Hi, I saw your listing '${listing.title}' on PrimeMart. Is it still available?`;
  
  const primaryImage = listing.images?.[0] 
    ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_1200,q_auto,f_auto/${listing.images[0]}`
    : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Marketplace
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-secondary">
            <Image src={primaryImage} alt={listing.title} fill className="object-cover" />
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-foreground mb-2">{listing.title}</h1>
            <p className="text-3xl font-bold text-primary mb-6">
              {listing.price_negotiable ? 'Negotiable' : formatPrice(listing.price, listing.currency)}
            </p>

            {/* Seller Info */}
            <div className="glass-card rounded-2xl p-4 flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-lg font-bold">
                {sellerName.charAt(0)}
              </div>
              <div>
                <p className="font-semibold flex items-center gap-1">
                  {sellerName} {isVerified && <ShieldCheck className="h-4 w-4 text-primary" />}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {listing.seller_profiles?.based_city || listing.location || 'Nigeria'}
                </p>
              </div>
            </div>

            <div className="text-muted-foreground whitespace-pre-wrap mb-8">
              {listing.description}
            </div>

            {/* WhatsApp Button */}
            <a 
              href={whatsappLink} 
              target="_blank" 
              rel="noreferrer"
              className="mt-auto flex items-center justify-center gap-2 w-full rounded-full bg-green-500 py-4 font-bold text-white hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
            >
              <MessageCircle className="h-5 w-5" /> Message on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}