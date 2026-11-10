'use client';

import { NIGERIAN_STATES } from '@/lib/constants';
import type { SignupData } from './SignupFlow';

export function Step3Profile({
  data,
  updateData,
  onNext,
  onBack,
}: {
  data: SignupData;
  updateData: (d: Partial<SignupData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const isSelling = data.intent === 'sell';

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">
          {isSelling ? 'Set up your seller profile' : 'Almost there'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isSelling
            ? 'This is how buyers will see you on PrimeMart.'
            : 'What should we call you?'}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Your Name (private)</label>
          <input
            type="text"
            required
            value={data.name}
            onChange={(e) => updateData({ name: e.target.value })}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-foreground"
          />
        </div>

        {isSelling && (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium">Business Name (public)</label>
              <input
                type="text"
                required
                value={data.business_name}
                onChange={(e) => updateData({ business_name: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-foreground"
                placeholder="e.g. Chioma's Leather Works"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">WhatsApp Number</label>
              <p className="text-xs text-muted-foreground mb-1">Buyers will message you here.</p>
              <input
                type="tel"
                required
                value={data.whatsapp}
                onChange={(e) => updateData({ whatsapp: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-foreground"
                placeholder="+234 801 234 5678"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Location</label>
              <select
                required
                value={data.city}
                onChange={(e) => updateData({ city: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-foreground"
              >
                <option value="">Select State/City</option>
                {NIGERIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={onBack}
          className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!data.name || (isSelling && (!data.business_name || !data.whatsapp || !data.city))}
          className="flex-1 rounded-lg bg-foreground py-2.5 text-sm font-medium text-background disabled:opacity-50"
        >
          Review
        </button>
      </div>
    </div>
  );
}