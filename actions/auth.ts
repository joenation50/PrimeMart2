'use server';

import { createServerSupabase, createAdminSupabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };
  
  redirect('/auth/redirect');
}

export async function signupAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  const intent = formData.get('intent') as string;

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signUp({ 
    email, password, options: { data: { name } }
  });

  if (error) return { error: error.message };

  if (data.user) {
    // USE ADMIN CLIENT TO BYPASS RLS
    const adminSupabase = createAdminSupabase();
    
    await adminSupabase.from('users').insert({
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

    if (intent === 'sell') {
      await adminSupabase.from('seller_profiles').insert({
        user_id: data.user.id,
        real_name: name,
        business_name: formData.get('business_name') as string || 'My Store',
        based_country: 'NG',
        based_city: formData.get('city') as string || 'Lagos',
      });
      redirect('/paywall');
    }
  }

  redirect('/auth/redirect');
}