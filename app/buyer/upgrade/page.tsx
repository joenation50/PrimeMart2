'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import { Store, Check, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function BuyerUpgradePage() {
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
    // Update role to seller, but keep status 'unpaid' until they pay
    await supabase.from('users').update({ role: 'seller', seller_status: 'unpaid' }).eq('id', user.id);
    window.location.href = '/seller/paywall';
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="container mx-auto max-w-lg px-4 py-16 min-h-[80vh]">
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      
      <div className="glass-card rounded-[2rem] p-8 md:p-12 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-5 py-2 rounded-bl-xl tracking-wider">PRO SELLER</div>
        
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-2xl shadow-primary/30 animate-glow">
          <Store className="h-12 w-12" />
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-4">Unlock Your Selling Power</h1>
        <p className="text-muted-foreground mb-8 text-lg">Join the network of verified sellers on PrimeMart.</p>

        <div className="bg-secondary/30 rounded-2xl p-6 text-left mb-10">
          <ul className="space-y-4">
            {[
              "Unlimited product listings",
              "Direct WhatsApp integration",
              "Verified Seller Badge",
              "Store Analytics Dashboard",
              "Custom Storefront Page"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm font-medium text-foreground">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <Check className="h-4 w-4" />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-8">
          <p className="text-sm text-muted-foreground mb-1">One simple fee</p>
          <p className="text-4xl font-extrabold text-foreground">₦5,000<span className="text-lg text-muted-foreground font-medium">/year</span></p>
        </div>

        <button 
          onClick={handleUpgrade} 
          disabled={upgrading} 
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-base font-bold text-primary-foreground transition-all hover:scale-105 disabled:opacity-50 shadow-lg shadow-primary/25"
        >
          {upgrading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
          Proceed to Payment
        </button>
        
        <p className="mt-4 text-xs text-muted-foreground">You will be asked to upload proof of payment on the next page.</p>
      </div>
    </div>
  );
}