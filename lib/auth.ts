import { redirect } from 'next/navigation';
import { cache } from 'react';
import { createServerSupabase } from './supabase';
import { env } from './env';
import type { User } from '@/types';

export const getSession = cache(async () => {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) return null;
  return { auth: user, profile: profile as User };
});

export async function requireAuth() {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
}

export async function requireSeller() {
  const session = await requireAuth();
  if (session.profile.role !== 'seller') redirect('/account');
  if (session.profile.seller_status !== 'active') redirect('/dashboard');
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.profile.role !== 'admin') redirect('/admin/login');
  return session;
}

export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (email.toLowerCase() !== env.adminEmail.toLowerCase()) {
    return { ok: false, error: 'Invalid credentials' };
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error || !data.user) {
    return { ok: false, error: 'Invalid credentials' };
  }

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