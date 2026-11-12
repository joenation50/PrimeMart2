'use server';

import { createServerSupabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const next = formData.get('next') as string || '/dashboard';

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect(next);
}

export async function signupAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    // Create their profile row immediately
    await supabase.from('users').insert({
      id: data.user.id,
      name: email.split('@')[0],
      email: email,
      role: 'buyer',
      seller_code: `USR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      country: 'NG',
      country_locked: false,
      timezone: 'Africa/Lagos',
      auth_method: 'email',
      account_status: 'active',
      verification_level: 'none'
    });
  }

  redirect('/dashboard');
}