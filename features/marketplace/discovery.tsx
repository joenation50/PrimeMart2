'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Lock, Zap, ShieldCheck, MessageCircle, Star, Check } from 'lucide-react';
import { formatCompact } from '@/lib/format';

export function HeroStrip({ sellerCount, listingCount }: { sellerCount: number; listingCount: number }) {
  return (
    <section className="relative flex min-h-[95vh] flex-col items-center justify-center overflow-hidden bg-background pt-20">
      {/* Background Grid & Glows */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-1/4 left-1/4 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] translate-x-1/2 translate-y-1/2 rounded-full bg-blue-500/10 blur-[120px]" />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 text-center">
        {/* Floating Badge */}
        <div className="animate-slide-up mx-auto mb-8 inline-flex items-center gap-2 rounded-full glass-card px-5 py-2 text-xs font-semibold uppercase tracking-widest text-foreground">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          Trusted by {formatCompact(sellerCount)}+ sellers in Nigeria
        </div>

        {/* Massive Typography */}
        <h1 className="animate-slide-up text-6xl font-medium tracking-tighter text-balance sm:text-8xl lg:text-9xl mb-8" style={{ animationDelay: '100ms' }}>
          The quiet your <br />
          <span className="italic font-serif text-primary">best sales</span> need.
        </h1>

        <p className="animate-slide-up mx-auto max-w-xl text-lg text-muted-foreground mb-12" style={{ animationDelay: '200ms' }}>
          PrimeMart seals off the noise. A members-only marketplace for verified sellers and serious buyers. Direct WhatsApp chats, zero commission, perfect focus.
        </p>

        {/* CTA Buttons */}
        <div className="animate-slide-up flex flex-col items-center justify-center gap-4 sm:flex-row" style={{ animationDelay: '300ms' }}>
          <Link href="/signup" className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-primary px-10 py-5 text-base font-semibold text-primary-foreground transition-all hover:scale-105 animate-glow">
            Request Access <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="/login" className="flex w-full sm:w-auto items-center justify-center rounded-full glass-card px-10 py-5 text-base font-medium text-foreground hover:bg-secondary transition-all">
            Sign In to Browse
          </Link>
        </div>

        {/* Floating Glass UI Mockups (Visual interest) */}
        <div className="relative mx-auto mt-24 hidden max-w-4xl sm:block" style={{ animationDelay: '500ms' }}>
           <div className="absolute -left-12 top-10 animate-float glass-card rounded-2xl p-4 flex items-center gap-3" style={{ animationDelay: '1s' }}>
             <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center"><ShieldCheck className="h-5 w-5 text-primary" /></div>
             <div><p className="text-xs text-muted-foreground">Seller</p><p className="text-sm font-bold">Verified</p></div>
           </div>
           
           <div className="absolute -right-12 top-24 animate-float glass-card rounded-2xl p-4 flex items-center gap-3" style={{ animationDelay: '2s' }}>
             <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center"><MessageCircle className="h-5 w-5 text-blue-500" /></div>
             <div><p className="text-xs text-muted-foreground">Chat</p><p className="text-sm font-bold">WhatsApp</p></div>
           </div>
           
           <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
             <div className="h-8 w-full bg-secondary flex items-center px-4 gap-2 border-b border-border">
               <div className="h-2 w-2 rounded-full bg-red-400" />
               <div className="h-2 w-2 rounded-full bg-amber-400" />
               <div className="h-2 w-2 rounded-full bg-green-400" />
             </div>
             <Image src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop" alt="UI Preview" width={1000} height={600} className="object-cover h-64 w-full opacity-80" />
           </div>
        </div>
      </div>
    </section>
  );
}

export function Marquee() {
  return (
    <div className="border-y border-border bg-secondary/20 py-6 overflow-hidden">
      <div className="flex w-[200%] animate-marquee">
        {[1, 2].map((i) => (
          <div key={i} className="flex w-1/2 items-center justify-around text-sm font-medium uppercase tracking-widest text-muted-foreground">
            <span className="flex items-center gap-2"><Star className="h-4 w-4" /> Premium Quality</span>
            <span className="flex items-center gap-2"><Lock className="h-4 w-4" /> Secure Access</span>
            <span className="flex items-center gap-2"><Zap className="h-4 w-4" /> Instant Contact</span>
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Verified Sellers</span>
            <span className="flex items-center gap-2"><MessageCircle className="h-4 w-4" /> Direct Deals</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section className="py-32 relative">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-20 text-center">
          <h2 className="text-4xl font-medium tracking-tight sm:text-6xl mb-4">Built for serious transactions.</h2>
          <p className="text-lg text-muted-foreground">Three steps to access the exclusive network.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Lock, title: "Create an account.", desc: "Sign up in seconds. Buyers browse for free. Sellers pay a flat yearly fee to publish." },
            { icon: Zap, title: "Access the network.", desc: "Browse verified sellers, explore curated categories, and find exactly what you need." },
            { icon: MessageCircle, title: "Chat on WhatsApp.", desc: "No middleman. Click the button and negotiate directly with the seller on WhatsApp." },
          ].map((item, i) => (
            <div key={i} className="group relative glass-card rounded-3xl p-8 transition-all hover:-translate-y-2 hover:border-primary/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-background border border-border shadow-sm">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="relative z-10 mb-3 text-2xl font-medium">{item.title}</h3>
              <p className="relative z-10 text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PricingSection() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
        <h2 className="mb-4 text-4xl font-medium tracking-tight sm:text-5xl">One fee. Infinite reach.</h2>
        <p className="text-lg text-muted-foreground mb-16">No commissions. No hidden fees. Just pure selling.</p>

        <div className="mx-auto max-w-md rounded-[2rem] border border-primary/30 glass-card p-10 text-left relative overflow-hidden animate-glow">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-5 py-2 rounded-bl-xl tracking-wider">SELLER PRO</div>

          <h3 className="text-xl font-medium mb-2">PrimeMart Seller</h3>
          <div className="mb-8 flex items-baseline gap-1">
            <span className="text-6xl font-semibold">₦5k</span>
            <span className="text-muted-foreground text-lg">/year</span>
          </div>

          <ul className="mb-10 space-y-4">
            {["Unlimited listings", "Direct WhatsApp integration", "Verified Seller Badge", "Custom Storefront Page", "Advanced Analytics"].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-base">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <Check className="h-3 w-3" />
                </div>
                {item}
              </li>
            ))}
          </ul>

          <Link href="/signup" className="flex w-full items-center justify-center rounded-full bg-primary px-6 py-4 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-transform hover:scale-105">
            Start Selling Now
          </Link>
        </div>
      </div>
    </section>
  );
}