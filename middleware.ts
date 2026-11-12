import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase';

export async function middleware(request: NextRequest) {
  // We only refresh the session here. We do NOT block routes.
  // The pages themselves (e.g. /dashboard) use requireAuth() to protect themselves.
  return await updateSession(request, NextResponse.next({ request }));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};