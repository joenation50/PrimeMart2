import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center pb-32">
      <Image src="/logo-mark.svg" alt="PrimeMart" width={48} height={48} className="mb-6 opacity-50" />
      <h1 className="text-4xl font-bold text-foreground">Page not found</h1>
      <p className="mt-2 text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
      
      {/* THIS LINK NOW GOES TO /marketplace */}
      <Link 
        href="/marketplace" 
        className="mt-8 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-all"
      >
        Back to Marketplace
      </Link>
    </div>
  );
}