// lib/auth.ts
import bcrypt from 'bcryptjs'; // You can actually remove this import now
import { createServerSupabase } from './supabase';
import { env } from './env';

export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise < { ok: true } | { ok: false;error: string } > {
  // 1. Check if the email matches the ADMIN_EMAIL in .env
  if (email.toLowerCase() !== env.adminEmail.toLowerCase()) {
    return { ok: false, error: 'Invalid credentials' };
  }
  
  // 2. Skip bcrypt. Just try to log into Supabase directly.
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error || !data.user) {
    return { ok: false, error: 'Invalid credentials' };
  }
  
  // 3. Verify they actually have the 'admin' role in the database
  const { data: profile } = await supabase
  .from('users')
  .select('role')
  .eq('id', data.user.id)
  .single();
  
  if (profile?.role !== 'admin') {
    await supabase.auth.signOut();
    return { ok: false, error: 'Not an admin account' };
  }
  
  return { ok: true };
}