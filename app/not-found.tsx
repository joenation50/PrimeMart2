import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-2 text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
      <Link href="/" className="mt-6 rounded-lg bg-foreground px-6 py-2 text-sm font-medium text-background">
        Back to Marketplace
      </Link>
    </div>
  );
}