import { Metadata } from 'next';
import { ShieldCheck, MessageCircle, Store, Code2, Phone, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About & FAQ · PrimeMart',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-6 text-4xl font-bold">About PrimeMart</h1>
      <p className="text-lg text-muted-foreground mb-12">
        PrimeMart is a modern marketplace designed for the way Nigeria buys and sells: on WhatsApp.
      </p>

      <div className="grid gap-6 sm:grid-cols-3 mb-16">
        <div className="rounded-xl border p-6">
          <ShieldCheck className="mb-3 h-8 w-8 text-blue-500" />
          <h3 className="font-semibold mb-2">Verified Sellers</h3>
          <p className="text-sm text-muted-foreground">We verify phone numbers and track seller activity so you know who you're dealing with.</p>
        </div>
        <div className="rounded-xl border p-6">
          <MessageCircle className="mb-3 h-8 w-8 text-green-500" />
          <h3 className="font-semibold mb-2">WhatsApp First</h3>
          <p className="text-sm text-muted-foreground">No complicated checkout. Tap a button and chat directly with the seller.</p>
        </div>
        <div className="rounded-xl border p-6">
          <Store className="mb-3 h-8 w-8 text-amber-500" />
          <h3 className="font-semibold mb-2">Seller Tools</h3>
          <p className="text-sm text-muted-foreground">Sellers get a storefront, analytics, and unlimited listings for one flat yearly fee.</p>
        </div>
      </div>

      <div id="faq" className="space-y-6 mb-16">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        
        <div>
          <h3 className="font-semibold text-lg">How do I buy something?</h3>
          <p className="text-muted-foreground mt-1">Find an item you like, click "Message on WhatsApp", and agree on the details with the seller. Always inspect the item before paying.</p>
        </div>

        <div>
          <h3 className="font-semibold text-lg">How much does it cost to sell?</h3>
          <p className="text-muted-foreground mt-1">It's ₦5,000 per year for Nigerian sellers ($10 for international). This gives you unlimited listings and a storefront.</p>
        </div>

        <div>
          <h3 className="font-semibold text-lg">Does PrimeMart hold the money?</h3>
          <p className="text-muted-foreground mt-1">No. You pay the seller directly (usually via bank transfer or cash on delivery). We just connect you.</p>
        </div>
      </div>

      {/* Support & Creator Credits */}
      <div id="contact" className="rounded-2xl border border-border bg-muted/30 p-8">
        <h2 className="text-2xl font-bold mb-6">Contact & Support</h2>
        
        <div>
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Code2 className="h-5 w-5" /> Built by PrimeWeb Designs
          </h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Nwankwo Uso Joseph</p>
            
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <a href="https://wa.me/2348075771583" target="_blank" rel="noreferrer" className="hover:text-foreground hover:underline">
                +234 807 577 1583 (WhatsApp only)
              </a>
            </div>
            
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <a href="tel:+2348022670705" className="hover:text-foreground hover:underline">
                0802 267 0705 (Calls only)
              </a>
            </div>

            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <a href="mailto:Joenation98@gmail.com" className="hover:text-foreground hover:underline">
                Joenation98@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}