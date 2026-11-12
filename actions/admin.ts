'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase';
import { requireAdmin, verifyAdminCredentials } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';
import { createAdminMessage, createNotification } from '@/lib/notifications';
import { env } from '@/lib/env';

// ============================================================
// ADMIN LOGIN (BULLETPROOF VERSION)
// ============================================================
export async function adminLogin(email: string, password: string) {
  // 1. Check against the Vercel ENV variables directly
  if (email.toLowerCase() !== env.adminEmail.toLowerCase()) {
    return { error: 'Invalid credentials' };
  }

  const supabase = await createServerSupabase();
  
  // 2. Log in via Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error || !data.user) {
    return { error: 'Invalid credentials' };
  }

  // 3. Force the database to recognize this user as an admin
  // (We use the Admin client to bypass RLS just in case)
  const adminSupabase = createAdminSupabase();
  
  await adminSupabase
    .from('users')
    .upsert({
      id: data.user.id,
      email: email,
      name: 'Admin',
      role: 'admin',
      seller_code: 'USR-ADMIN1',
      country: 'NG',
      country_locked: true,
      timezone: 'Africa/Lagos',
      auth_method: 'email',
      account_status: 'active',
      verification_level: 'verified'
    }, { onConflict: 'id' });

  // 4. Log the action
  await writeAuditLog({
    adminId: data.user.id,
    targetType: 'admin_login',
    targetId: data.user.id,
  });

  // 5. Redirect to the admin dashboard
  redirect('/admin');
}