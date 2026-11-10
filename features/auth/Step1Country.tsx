'use client';

import { COUNTRIES } from '@/lib/constants';
import type { SignupData } from './SignupFlow';
import { cn } from '@/lib/utils';

export function Step1Country({
  data,
  updateData,
  onNext,
}: {
  data: SignupData;
  updateData: (d: Partial<SignupData>) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Where are you located?</h2>
        <p className="text-sm text-muted-foreground">This helps us set your currency and delivery options.</p>
        <select
          value={data.country}
          onChange={(e) => updateData({ country: e.target.value })}
          className="mt-3 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-foreground"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h2 className="text-xl font-bold">What brings you to PrimeMart?</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            onClick={() => updateData({ intent: 'browse' })}
            className={cn(
              'flex flex-col items-center justify-center gap-2 rounded-xl border p-4 transition hover:border-foreground',
              data.intent === 'browse' ? 'border-foreground bg-muted/50' : 'border-border'
            )}
          >
            <span className="text-2xl">🛍️</span>
            <span className="font-medium">I want to buy</span>
          </button>
          
          <button
            onClick={() => updateData({ intent: 'sell' })}
            className={cn(
              'flex flex-col items-center justify-center gap-2 rounded-xl border p-4 transition hover:border-foreground',
              data.intent === 'sell' ? 'border-foreground bg-muted/50' : 'border-border'
            )}
          >
            <span className="text-2xl">🏪</span>
            <span className="font-medium">I want to sell</span>
          </button>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!data.intent}
        className="w-full rounded-lg bg-foreground py-2.5 text-sm font-medium text-background disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  );
}