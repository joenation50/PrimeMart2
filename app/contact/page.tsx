import { Mail, Phone, MessageCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 pb-32">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>
      
      <div className="glass-card rounded-3xl p-8 md:p-12">
        <h1 className="text-3xl font-bold text-foreground mb-4">Contact Support</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          We're here to help! Reach out to us through any of the channels below.
        </p>

        <div className="space-y-4">
          <a href="mailto:joenation98@gmail.com" className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors border border-border">
            <div className="p-3 bg-primary/10 rounded-xl text-primary"><Mail className="h-6 w-6" /></div>
            <div>
              <p className="font-semibold text-foreground">Email Us</p>
              <p className="text-sm text-muted-foreground">joenation98@gmail.com</p>
            </div>
          </a>

          <a href="https://wa.me/2348075771583" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors border border-border">
            <div className="p-3 bg-[#25D366]/10 rounded-xl text-[#25D366]"><MessageCircle className="h-6 w-6" /></div>
            <div>
              <p className="font-semibold text-foreground">WhatsApp</p>
              <p className="text-sm text-muted-foreground">+234 807 577 1583</p>
            </div>
          </a>

          <a href="tel:+2348022670705" className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors border border-border">
            <div className="p-3 bg-primary/10 rounded-xl text-primary"><Phone className="h-6 w-6" /></div>
            <div>
              <p className="font-semibold text-foreground">Local Calls</p>
              <p className="text-sm text-muted-foreground">+234 802 267 0705</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}