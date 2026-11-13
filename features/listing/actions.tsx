'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Heart, Share2 } from 'lucide-react';
import { trackWhatsAppClick, toggleFavorite } from '@/actions/social';
import { cn } from '@/lib/utils';

interface ListingActionsProps {
  listingId: string;
  sellerPhone: string | null;
  listingTitle: string;
  price: number;
  currency: string;
  isFavorited: boolean;
  isLoggedIn: boolean;
}

export function ListingActions({ listingId, sellerPhone, listingTitle, price, currency, isFavorited, isLoggedIn }: ListingActionsProps) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(isFavorited);
  const [loading, setLoading] = useState(false);
  
  const formattedPrice = currency === 'NGN' ? `₦${price.toLocaleString()}` : `$${price}`;
  const prefill = encodeURIComponent(`Hi, I saw your listing '${listingTitle}' (${formattedPrice}) on PrimeMart. Is it still available?`);
  const waLink = sellerPhone ? `https://wa.me/${sellerPhone.replace(/\D/g, '')}?text=${prefill}` : '#';
  
  async function handleWhatsApp() {
    if (!isLoggedIn) {
      alert("Please join PrimeMart to view contact details and message this seller.");
      router.push(`/login?redirect=/listing/${listingId}`);
      return;
    }
    if (!sellerPhone) return;
    
    setLoading(true);
    await trackWhatsAppClick(listingId);
    window.open(waLink, '_blank');
    setLoading(false);
  }
  
  async function handleFavorite() {
    if (!isLoggedIn) {
      alert("Please join PrimeMart to save your favorite items.");
      router.push(`/login?redirect=/listing/${listingId}`);
      return;
    }
    setFavorited(!favorited);
    await toggleFavorite(listingId);
  }
  
  async function handleShare() {
    if (navigator.share) {
      await navigator.share({ title: listingTitle, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard');
    }
  }
  
  return (
    // FIXED: Changed bottom-0 to bottom-[88px] to clear the mobile dock
    <div className="fixed bottom-[88px] left-0 right-0 z-40 border-t border-border bg-background p-4 pb-safe sm:static sm:border-none sm:bg-transparent sm:p-0">
      <div className="container flex max-w-2xl items-center gap-3 sm:mx-0 sm:max-w-none sm:px-0">
        <button
          onClick={handleWhatsApp}
          disabled={loading}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 text-sm font-semibold text-white transition hover:bg-[#20b858] disabled:opacity-70 sm:text-base"
        >
          <MessageCircle className="h-5 w-5" />
          {isLoggedIn ? 'Message on WhatsApp' : 'Sign in to contact'}
        </button>
        
        <button onClick={handleFavorite} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-background transition hover:bg-muted">
          <Heart className={cn('h-5 w-5', favorited ? 'fill-red-500 text-red-500' : 'text-foreground')} />
        </button>
        
        <button onClick={handleShare} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-background transition hover:bg-muted">
          <Share2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}