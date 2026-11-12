'use client';

import { useState, useTransition } from 'react';
import { Step1Country } from './Step1Country';
import { Step2Auth } from './Step2Auth';
import { Step3Profile } from './Step3Profile';
import { Step4Confirm } from './Step4Confirm';
import { signupAction } from '@/actions/auth';
import { Loader2 } from 'lucide-react';

export type SignupData = {
  country: string;
  intent: 'browse' | 'sell' | null;
  email: string;
  password: string;
  name: string;
  whatsapp: string;
  business_name: string;
  city: string;
};

export function SignupFlow() {
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  
  const [data, setData] = useState<SignupData>({
    country: 'NG',
    intent: null,
    email: '',
    password: '',
    name: '',
    whatsapp: '',
    business_name: '',
    city: '',
  });

  function updateData(fields: Partial<SignupData>) {
    setData((prev) => ({ ...prev, ...fields }));
  }

  function nextStep() {
    setStep((s) => s + 1);
  }

  function prevStep() {
    setStep((s) => s - 1);
  }

  function finalizeSignup() {
    setError(null);
    
    startTransition(async () => {
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('name', data.name);
      formData.append('intent', data.intent || 'browse');
      formData.append('business_name', data.business_name);
      formData.append('whatsapp', data.whatsapp);
      formData.append('city', data.city);

      const result = await signupAction(formData);

      if (result?.error) {
        setError(result.error);
      }
    });
  }

  if (isPending) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Creating your account...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-sm sm:p-8">
      <div className="mb-8 flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= step ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
          {error}
        </div>
      )}

      {step === 1 && (
        <Step1Country data={data} updateData={updateData} onNext={nextStep} />
      )}
      {step === 2 && (
        <Step2Auth data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />
      )}
      {step === 3 && (
        <Step3Profile data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />
      )}
      {step === 4 && (
        <Step4Confirm data={data} onBack={prevStep} onSubmit={finalizeSignup} />
      )}
    </div>
  );
}