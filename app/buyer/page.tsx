import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, Heart, Store, ShieldCheck, ArrowRight } from 'lucide-react';

export const metadata = { title: 'My Account · PrimeMart' };

export default async function BuyerPage() {
  const session = await requireAuth();
  const { profile } = session;

  // If a seller or admin lands here, send them to their correct dashboard
  if (profile.role === 'admin') redirect('/admin');
  if (profile.role === 'seller') redirect('/dashboard');

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16 min-h-[80vh]">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-foreground">Welcome, {profile.name}</h1>
        <p className="text-muted-foreground">This is your buyer dashboard.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Saved Items Card */}
        <Link href="/favorites" className="glass-card group rounded-3xl p-8 transition-all hover:-translate-y-1 hover:border-primary/50">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-background border border-border shadow-sm">
            <Heart className="h-6 w-6 text-primary" />
          </div>
          <h2 className="mb-2 text-2xl font-medium text-foreground">Saved Items</h2>
          <p className="text-muted-foreground mb-6">View the products you've saved for later.</p>
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            View Favorites <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* Upgrade to Seller Card */}
        <Link href="/signup?intent=sell" className="glass-card group rounded-3xl p-8 transition-all hover:-translate-y-1 hover:border-primary/50 bg-primary/5">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Store className="h-6 w-6" />
          </div>
          <h2 className="mb-2 text-2xl font-medium text-foreground">Start Selling</h2>
          <p className="text-muted-foreground mb-6">Join verified sellers and reach thousands of buyers.</p>
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            Become a Seller <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>

      <div className="mt-10 glass-card rounded-2xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-green-500" />
          <div>
            <p className="font-medium text-foreground">Account Status</p>
            <p className="text-sm text-muted-foreground">Verified Buyer</p>
          </div>
        </div>
      </div>
    </div>
  );
}