import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase';

export async function middleware(request: NextRequest) {
  // We only use the middleware to refresh the Supabase session.
  // We removed the manual cookie check because it was causing redirect loops on Vercel.
  return await updateSession(request, NextResponse.next({ request }));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};