import { AlertTriangle, ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SafetyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 pb-32">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>
      
      <div className="glass-card rounded-3xl p-8 md:p-12">
        <div className="flex items-center gap-4 mb-8 border-b border-border pb-6">
          <div className="p-3 bg-red-500/10 rounded-xl text-red-500"><ShieldCheck className="h-8 w-8" /></div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Safety Guidelines</h1>
            <p className="text-sm text-muted-foreground mt-1">Protect yourself when buying and selling.</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="rounded-2xl bg-amber-500/10 p-6 border border-amber-500/20">
            <h3 className="font-bold text-amber-500 flex items-center gap-2 mb-2 text-lg">
              <AlertTriangle className="h-5 w-5" /> For Buyers
            </h3>
            <ul className="list-disc list-inside text-sm text-amber-900 dark:text-amber-200 space-y-2">
              <li>Never pay before seeing the item in person.</li>
              <li>Meet in safe, public locations (e.g., school campus, busy plazas).</li>
              <li>Inspect the item thoroughly before handing over cash.</li>
              <li>Do not send money to unverified sellers.</li>
            </ul>
          </div>

          <div className="rounded-2xl bg-primary/10 p-6 border border-primary/20">
            <h3 className="font-bold text-primary flex items-center gap-2 mb-2 text-lg">
              <ShieldCheck className="h-5 w-5" /> For Sellers
            </h3>
            <ul className="list-disc list-inside text-sm text-primary space-y-2">
              <li>Verify the buyer's identity if possible.</li>
              <li>Do not accept suspicious overpayments or fake transfer alerts.</li>
              <li>Only hand over the item after confirming the money is in your account.</li>
              <li>Keep records of your conversations.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}