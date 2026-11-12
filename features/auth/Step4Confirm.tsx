'use client';

import { Loader2, CheckCircle2 } from 'lucide-react';
import type { SignupData } from './SignupFlow';

export function Step4Confirm({
  data,
  onBack,
  onSubmit,
}: {
  data: SignupData;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const isSelling = data.intent === 'sell';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Check your details</h2>
        <p className="text-sm text-muted-foreground">Please review carefully — these are saved to your account.</p>
      </div>

      <div className="space-y-3 rounded-xl border border-border p-4 text-sm bg-secondary/20">
        <div className="flex justify-between border-b border-border pb-2">
          <span className="text-muted-foreground">Country</span>
          <span className="font-medium text-foreground">{data.country}</span>
        </div>
        <div className="flex justify-between border-b border-border pb-2">
          <span className="text-muted-foreground">Email</span>
          <span className="font-medium text-foreground">{data.email}</span>
        </div>
        <div className="flex justify-between border-b border-border pb-2">
          <span className="text-muted-foreground">Name</span>
          <span className="font-medium text-foreground">{data.name}</span>
        </div>
        
        {isSelling && (
          <>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Business</span>
              <span className="font-medium text-foreground">{data.business_name}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">WhatsApp</span>
              <span className="font-medium text-foreground">{data.whatsapp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location</span>
              <span className="font-medium text-foreground">{data.city}</span>
            </div>
          </>
        )}
      </div>

      {isSelling && (
        <div className="rounded-xl bg-primary/10 p-4 text-sm text-primary border border-primary/20">
          <p className="font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Next step: Payment
          </p>
          <p className="mt-1 opacity-90">After creating your account, you'll be asked to pay ₦5,000/year to activate your seller dashboard.</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-foreground transition hover:bg-secondary"
        >
          Edit details
        </button>
        <button
          onClick={onSubmit}
          className="flex flex-1 items-center justify-center rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 shadow-lg shadow-primary/20"
        >
          Confirm & continue
        </button>
      </div>
      
      <p className="text-center text-xs text-muted-foreground">
        Country can't be changed after this step without contacting support.
      </p>
    </div>
  );
}