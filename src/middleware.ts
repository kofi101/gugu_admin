import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const globalPrefixes = ['/api', '/_next', '/favicon.ico', '/auth'];

export async function middleware(request: NextRequest) {
  // Allow internal Next.js requests
  if (
    globalPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix))
  ) {
    return NextResponse.next();
  }

  const userType = (await cookies()).get('userType')?.value;
  const token = (await cookies()).get('token')?.value;

  // Redirect unauthenticated users
  if (!token || !userType) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }

  // Redirect unapproved merchants to confirmation page
  if (userType === 'Merchant' && token === 'NotAllowed') {
    return NextResponse.redirect(new URL('/auth/confirmation', request.url));
  }

  // Define route prefixes for user types
  const routePrefixes = {
    Merchant: ['/'],
    SuperAdministrator: ['/admin'],
    Administrator: ['/admin'],
  };

  const userRoutes =
    routePrefixes[
      userType as 'Merchant' | 'SuperAdministrator' | 'Administrator'
    ];

  // Redirect merchants trying to access admin routes
  if (
    userType === 'Merchant' &&
    request.nextUrl.pathname.startsWith('/admin')
  ) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // Redirect admins trying to access non-admin routes
  if (
    (userType === 'SuperAdministrator' || userType === 'Administrator') &&
    !request.nextUrl.pathname.startsWith('/admin')
  ) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // Allow access to valid user routes
  if (
    userRoutes?.some((prefix) => request.nextUrl.pathname.startsWith(prefix))
  ) {
    return NextResponse.next();
  }

  // Final fallback redirect
  const redirectUrl = userType === 'Merchant' ? '/' : '/admin/dashboard';
  return NextResponse.redirect(new URL(redirectUrl, request.url));
}
