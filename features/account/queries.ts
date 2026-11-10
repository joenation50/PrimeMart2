// features/account/queries.ts
import { createServerSupabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export async function getAccountData() {
  const session = await requireAuth();
  return { user: session.profile };
}