'use server';

import { createServerSupabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const next = formData.get('next') as string || '/dashboard';

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };
  
  redirect(next);
}

export async function signupAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  const intent = formData.get('intent') as string;

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: { data: { name } }
  });

  if (error) return { error: error.message };

  if (data.user) {
    // 1. Create the base user profile
    await supabase.from('users').insert({
      id: data.user.id,
      name: name || email.split('@')[0],
      email: email,
      role: intent === 'sell' ? 'seller' : 'buyer',
      seller_status: intent === 'sell' ? 'unpaid' : null,
      seller_code: `USR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      country: 'NG',
      country_locked: false,
      timezone: 'Africa/Lagos',
      auth_method: 'email',
      account_status: 'active',
      verification_level: 'none'
    });

    // 2. If they want to sell, create the seller profile draft
    if (intent === 'sell') {
      const businessName = formData.get('business_name') as string;
      const whatsapp = formData.get('whatsapp') as string;
      const city = formData.get('city') as string;

      await supabase.from('seller_profiles').insert({
        user_id: data.user.id,
        real_name: name,
        business_name: businessName || 'My Store',
        based_country: 'NG',
        based_city: city || 'Lagos',
      });
    }
  }

  redirect(intent === 'sell' ? '/paywall' : '/dashboard');
}