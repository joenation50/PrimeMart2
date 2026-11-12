'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import { Store, Check, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function UpgradePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    async function getUser() {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);
      setLoading(false);
    }
    getUser();
  }, [router]);

  async function handleUpgrade() {
    setUpgrading(true);
    const supabase = createBrowserSupabase();
    
    // 1. Upgrade the user to 'seller' with 'unpaid' status
    await supabase.from('users').update({
      role: 'seller',
      seller_status: 'unpaid'
    }).eq('id', user.id);

    // 2. Send them directly to the paywall
    window.location.href = '/paywall';
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="container mx-auto max-w-lg px-4 py-16 min-h-[80vh]">
      <Link href="/buyer" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="glass-card rounded-3xl p-8 md:p-12 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
          <Store className="h-10 w-10" />
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-4">Become a Seller</h1>
        <p className="text-muted-foreground mb-8">
          Join thousands of verified sellers on PrimeMart. Get unlimited listings, direct WhatsApp connections, and a verified storefront.
        </p>

        <ul className="text-left space-y-4 mb-10 max-w-sm mx-auto">
          {["Unlimited product listings", "Direct WhatsApp integration", "Verified Seller Badge", "Access to seller analytics"].map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-foreground">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Check className="h-4 w-4" />
              </div>
              {item}
            </li>
          ))}
        </ul>

        <button
          onClick={handleUpgrade}
          disabled={upgrading}
          className="flex w-full items-center justify-center rounded-xl bg-primary py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-50"
        >
          {upgrading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Proceed to Payment (₦5,000/year)'}
        </button>
      </div>
    </div>
  );
}