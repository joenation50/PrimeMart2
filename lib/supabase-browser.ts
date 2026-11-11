import { createBrowserClient } from '@supabase/ssr';
import { env } from './env';

export function createBrowserSupabase() {
  return createBrowserClient(
    env.supabaseUrl,
    env.supabaseAnonKey,
    {
      cookies: {
        // Next.js App Router handles cookies via the document, 
        // but we need to make sure it's using the right path.
        get(name: string) {
          return document.cookie.split('; ').find((row) => row.startsWith(`${name}=`))?.split('=')[1];
        },
        set(name: string, value: string, options: any) {
          document.cookie = `${name}=${value}; path=/; max-age=${options.maxAge || 31536000}; SameSite=Lax; Secure`;
        },
        remove(name: string, options: any) {
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        },
      },
    }
  );
}