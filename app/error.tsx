// app/error.tsx
'use client';

export default function Error({ reset }: { error: Error;reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">We couldn't load this page. Please try again.</p>
      <button onClick={() => reset()} className="mt-6 rounded-lg bg-foreground px-6 py-2 text-sm font-medium text-background">
        Try again
      </button>
    </div>
  );
}