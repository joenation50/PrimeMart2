// features/auth/Step4Confirm.tsx
'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import type { SignupData } from './SignupFlow';

export function Step4Confirm({
  data,
  onBack,
  onSubmit,
}: {
  data: SignupData;
  onBack: () => void;
  onSubmit: () => Promise < void > ;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState < string | null > (null);
  const isSelling = data.intent === 'sell';
  
  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      await onSubmit();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Check your details</h2>
        <p className="text-sm text-muted-foreground">
          Please review carefully — these are saved to your account.
        </p>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      <div className="space-y-3 rounded-xl border border-border p-4 text-sm">
        <div className="flex justify-between border-b border-border pb-2">
          <span className="text-muted-foreground">Country</span>
          <span className="font-medium">{data.country}</span>
        </div>
        <div className="flex justify-between border-b border-border pb-2">
          <span className="text-muted-foreground">Email</span>
          <span className="font-medium">{data.email}</span>
        </div>
        <div className="flex justify-between border-b border-border pb-2">
          <span className="text-muted-foreground">Name</span>
          <span className="font-medium">{data.name}</span>
        </div>
        
        {isSelling && (
          <>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Business</span>
              <span className="font-medium">{data.business_name}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">WhatsApp</span>
              <span className="font-medium">{data.whatsapp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location</span>
              <span className="font-medium">{data.city}</span>
            </div>
          </>
        )}
      </div>

      {isSelling && (
        <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950/30 dark:text-blue-200">
          <p className="font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Next step: Payment
          </p>
          <p className="mt-1 opacity-90">
            After creating your account, you'll be asked to pay ₦5,000/year to activate your seller dashboard.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium disabled:opacity-50"
        >
          Edit details
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex flex-1 items-center justify-center rounded-lg bg-foreground py-2.5 text-sm font-medium text-background disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm & continue'}
        </button>
      </div>
      
      <p className="text-center text-xs text-muted-foreground">
        Country can't be changed after this step without contacting support.
      </p>
    </div>
  );
}