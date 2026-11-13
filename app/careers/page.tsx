import { Briefcase, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CareersPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 pb-32">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>
      
      <div className="glass-card rounded-3xl p-8 md:p-12 text-center py-20">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Briefcase className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-4">Careers at PrimeMart</h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto mb-8">
          We are currently not hiring for any open positions. Check back later or reach out to us directly if you'd like to collaborate!
        </p>
      </div>
    </div>
  );
}