import { redirect } from 'next/navigation';
import { createServerSupabase } from './supabase';
import { env } from './env';
import type { User } from '@/types';

// Removed the React 'cache()' wrapper to ensure we always get the freshest role from the DB
export async function getSession() {
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
}

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
  if (!session || session.profile.role !== 'admin') {
    redirect('/admin/login');
  }
  return session;
}

export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  // 1. Verify email matches the ENV variable
  if (email.toLowerCase() !== env.adminEmail.toLowerCase()) {
    return { ok: false, error: 'Invalid credentials' };
  }

  // 2. Authenticate with Supabase
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error || !data.user) {
    return { ok: false, error: 'Invalid credentials' };
  }

  // 3. Fetch the role using the EMAIL, not the ID (Fixes the mismatch bug)
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('email', email)
    .single();

  // 4. Debug log (Check your Vercel function logs if this fails)
  console.log("ADMIN CHECK -> Email:", email, "| Role in DB:", profile?.role, "| DB Error:", profileError);

  // 5. Strict check
  if (!profile || profile.role !== 'admin') {
    await supabase.auth.signOut();
    return { ok: false, error: 'Not an admin account' };
  }

  return { ok: true };
}

export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.profile.role === 'admin';
}

export async function isSeller(): Promise<boolean> {
  const session = await getSession();
  return session?.profile.role === 'seller';
}

export async function isActiveSeller(): Promise<boolean> {
  const session = await getSession();
  return (
    session?.profile.role === 'seller' &&
    session.profile.seller_status === 'active'
  );
}