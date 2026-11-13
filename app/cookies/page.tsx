import { Cookie, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CookiePage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 pb-32">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>
      
      <div className="glass-card rounded-3xl p-8 md:p-12">
        <div className="flex items-center gap-4 mb-8 border-b border-border pb-6">
          <div className="p-3 bg-primary/10 rounded-xl text-primary"><Cookie className="h-8 w-8" /></div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Cookie Policy</h1>
            <p className="text-sm text-muted-foreground mt-1">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="space-y-6 text-muted-foreground leading-relaxed text-sm">
          <section>
            <h2 className="text-lg font-bold text-foreground mb-2">1. What Are Cookies?</h2>
            <p>Cookies are small text files stored on your device. They help us remember your preferences and keep you logged in securely.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-foreground mb-2">2. How We Use Cookies</h2>
            <p>We use essential cookies for authentication (to keep you logged in) and security. We do not use intrusive tracking cookies.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-foreground mb-2">3. Managing Cookies</h2>
            <p>You can disable cookies in your browser settings. However, doing so will likely log you out and prevent the app from functioning properly.</p>
          </section>
        </div>
      </div>
    </div>
  );
}