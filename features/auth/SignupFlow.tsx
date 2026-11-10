'use client';

import { useState } from 'react';
import { Step1Country } from './Step1Country';
import { Step2Auth } from './Step2Auth';
import { Step3Profile } from './Step3Profile';
import { Step4Confirm } from './Step4Confirm';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const [step, setStep] = useState(1);
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

  async function finalizeSignup() {
    const supabase = createBrowserSupabase();
    
    // 1. Create Auth User
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          country: data.country,
        },
      },
    });

    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error('Signup failed');

    // 2. Update public.users (country is locked after this)
    await supabase
      .from('users')
      .update({ country: data.country, country_locked: true })
      .eq('id', authData.user.id);

    // 3. If they want to sell, create seller profile draft
    if (data.intent === 'sell') {
      await supabase.from('seller_profiles').insert({
        user_id: authData.user.id,
        real_name: data.name,
        business_name: data.business_name,
        based_country: data.country,
        based_city: data.city,
      });
      
      await supabase
        .from('users')
        .update({ role: 'seller', seller_status: 'unpaid' })
        .eq('id', authData.user.id);
    }

    // Redirect to paywall if selling, otherwise to home
    router.push(data.intent === 'sell' ? '/paywall' : '/');
    router.refresh();
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-sm sm:p-8">
      {/* Progress Bar */}
      <div className="mb-8 flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= step ? 'bg-foreground' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <Step1Country
          data={data}
          updateData={updateData}
          onNext={nextStep}
        />
      )}
      {step === 2 && (
        <Step2Auth
          data={data}
          updateData={updateData}
          onNext={nextStep}
          onBack={prevStep}
        />
      )}
      {step === 3 && (
        <Step3Profile
          data={data}
          updateData={updateData}
          onNext={nextStep}
          onBack={prevStep}
        />
      )}
      {step === 4 && (
        <Step4Confirm
          data={data}
          onBack={prevStep}
          onSubmit={finalizeSignup}
        />
      )}
    </div>
  );
}