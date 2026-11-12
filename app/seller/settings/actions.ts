'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

export async function updateSellerSettings(formData: {
  phone: string;
  businessName: string;
}) {
  const session = await getSession();
  if (!session) return { error: 'Not logged in' };

  const supabase = await createServerSupabase();
  const userId = session.profile.id;

  // 1. Generate the slug from the business name
  const baseSlug = formData.businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // 2. Check if the slug is already taken by someone else
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('store_slug', baseSlug)
    .neq('id', userId)
    .maybeSingle();

  // If taken, add a random string to the end
  const finalSlug = existing ? `${baseSlug}-${Math.floor(Math.random() * 1000)}` : baseSlug;

  // 3. Update `users` (Phone + Slug)
  const { error: userError } = await supabase
    .from('users')
    .update({ 
      phone: formData.phone,
      store_slug: finalSlug 
    })
    .eq('id', userId);

  if (userError) return { error: userError.message };

  // 4. Update `seller_profiles` (Business Name)
  const { error: profileError } = await supabase
    .from('seller_profiles')
    .update({ business_name: formData.businessName })
    .eq('user_id', userId);

  if (profileError) return { error: profileError.message };

  // 5. Clear the cache for the account page and the public store
  revalidatePath('/seller/account');
  revalidatePath('/seller/settings');
  revalidatePath(`/store/${finalSlug}`);

  return { ok: true, slug: finalSlug };
}