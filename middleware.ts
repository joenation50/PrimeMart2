import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Create new headers and pass the current pathname to the layout
  // This is what stops the Admin panel from infinitely looping on the login page.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // 2. Refresh the Supabase session cookie
  // If the user is logged in, this keeps their session alive.
  // If they aren't, it does nothing.
  return await updateSession(request, response);
}

export const config = {
  // 3. This matcher ensures the middleware runs on all pages EXCEPT static files and images
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};