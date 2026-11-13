'use server';

import { createServerSupabase, createAdminSupabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function signupAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  const intent = formData.get('intent') as string;

  const supabase = await createServerSupabase();
  
  // We pass the callback URL so Supabase knows where to send them after they click the email link
  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password, 
    options: { 
      data: { name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
    }
  });

  if (error) return { error: error.message };

  if (data.user) {
    const adminSupabase = createAdminSupabase();
    
    // Create the user profile in the database
    await adminSupabase.from('users').upsert({
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
    }, { onConflict: 'id' });

    if (intent === 'sell') {
      await adminSupabase.from('seller_profiles').upsert({
        user_id: data.user.id,
        real_name: name,
        business_name: formData.get('business_name') as string || 'My Store',
        based_country: 'NG',
        based_city: formData.get('city') as string || 'Lagos',
      }, { onConflict: 'user_id' });
    }
  }

  // If Supabase didn't give a session, it means "Confirm Email" is ON.
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    // Tell the frontend to show the "Check your email" page
    return { 
      ok: true, 
      requiresEmailConfirmation: true, 
      email: email 
    };
  }

  // If Confirm Email is OFF, they are logged in immediately
  return { 
    ok: true, 
    redirectTo: intent === 'sell' ? '/seller/paywall' : '/marketplace' 
  };
}