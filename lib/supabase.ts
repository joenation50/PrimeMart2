// lib/supabase.ts
// Three Supabase clients: browser, server (cookie-based), admin (service role).

import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { NextRequest, NextResponse } from 'next/server';
import { env } from './env';

// BROWSER CLIENT
export function createBrowserSupabase() {
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}

// SERVER CLIENT
export async function createServerSupabase() {
  const cookieStore = await cookies();
  
  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Component — safe to ignore. Middleware handles refresh.
        }
      },
    },
  });
}

// ADMIN CLIENT — service role, bypasses RLS. Server-only.
export function createAdminSupabase() {
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// MIDDLEWARE HELPER — refreshes session on every request
export async function updateSession(
  request: NextRequest,
  response: NextResponse
): Promise < NextResponse > {
  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });
  
  await supabase.auth.getUser();
  return response;
}