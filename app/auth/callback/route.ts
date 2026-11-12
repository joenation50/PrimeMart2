// app/auth/callback/route.ts
import { createServerSupabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  // CHANGED: Default fallback is now /marketplace instead of /
  const next = requestUrl.searchParams.get('next') ?? '/marketplace';
  
  if (code) {
    const supabase = await createServerSupabase();
    await supabase.auth.exchangeCodeForSession(code);
  }
  
  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL(next, request.url));
}