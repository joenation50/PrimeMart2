// @ts-nocheck
'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';
import { createAdminMessage, createNotification } from '@/lib/notifications';
import { env } from '@/lib/env';

export async function adminLogin(email: string, password: string) {
  if (email.toLowerCase() !== env.adminEmail.toLowerCase()) {
    return { error: 'Invalid credentials' };
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error || !data.user) {
    return { error: 'Invalid credentials' };
  }

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

  await writeAuditLog({
    adminId: data.user.id,
    targetType: 'admin_login',
    targetId: data.user.id,
  });

  redirect('/auth/redirect');
}

// ... KEEP THE REST OF YOUR ADMIN FUNCTIONS (approvePayment, etc.) EXACTLY THE SAME ...