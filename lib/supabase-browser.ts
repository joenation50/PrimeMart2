import { createBrowserClient } from '@supabase/ssr';
import { env } from './env';

export function createBrowserSupabase() {
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}