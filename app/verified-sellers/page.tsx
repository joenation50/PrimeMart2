import { createServerSupabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Star } from 'lucide-react';

export const metadata = {
  title: 'Verified Sellers · PrimeMart',
};

export default async function VerifiedSellersPage() {
  const supabase = await createServerSupabase();

  const { data: sellers } = await supabase
    .from('users')
    .select(`
      id, rating_avg, rating_count, verification_level,
      seller_profiles!inner(business_name, avatar_url, based_city, based_region)
    `)
    .eq('verification_level', 'verified')
    .eq('seller_status', 'active')
    .eq('account_status', 'active')
    .order('rating_avg', { ascending: false });

  return (
    <div className="container mx-auto max-w-6xl px-4 py-16 min-h-screen">
      <div className="mb-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Verified Sellers</h1>
        <p className="mt-2 text-muted-foreground">Trusted businesses across Nigeria.</p>
      </div>

      {!sellers || sellers.length === 0 ? (
        <div className="rounded-2xl border border-border py-16 text-center text-muted-foreground">
          No verified sellers yet. Check back soon.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {sellers.map((seller: any) => {
            const profile = Array.isArray(seller.seller_profiles) ? seller.seller_profiles[0] : seller.seller_profiles;
            return (
              <Link key={seller.id} href={`/seller/${seller.id}`} className="glass-card group rounded-2xl p-6 text-center transition-all hover:border-primary/50 hover:-translate-y-1">
                <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full bg-secondary ring-4 ring-background">
                  {profile?.avatar_url ? (
                    <Image src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_200,h_200,c_fill,r_max,q_auto,f_auto/${profile.avatar_url}`} alt={profile.business_name} width={96} height={96} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl font-bold">{profile?.business_name?.[0] || 'S'}</div>
                  )}
                </div>
                <h3 className="flex items-center justify-center gap-1 font-semibold">
                  {profile?.business_name}
                  <ShieldCheck className="h-4 w-4 text-primary" />
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">{profile?.based_city}, {profile?.based_region}</p>
                <div className="mt-3 flex items-center justify-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  <span className="font-medium">{seller.rating_avg.toFixed(1)}</span>
                  <span className="text-muted-foreground">({seller.rating_count})</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}