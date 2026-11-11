'use client';

import { HeroStrip, Marquee, HowItWorks, PricingSection } from './discovery';

export function MarketplacePage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <HeroStrip sellerCount={342} listingCount={1240} />
      <Marquee />
      <HowItWorks />
      <PricingSection />
    </div>
  );
}