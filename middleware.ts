import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  return await updateSession(request, response);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};