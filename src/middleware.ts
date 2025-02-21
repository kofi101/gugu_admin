import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const globalPrefixes = ['/api', '/_next', '/favicon.ico', '/auth'];

export async function middleware(request: NextRequest, response: NextResponse) {
  console.log('Request Path:', request.nextUrl.pathname);

  // Allow internal Next.js requests
  if (
    globalPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix))
  ) {
    return NextResponse.next();
  }

  // const userType = request.cookies.get('userType')?.value;
  // const token = request.cookies.get('token')?.value;
  const userType = (await cookies()).get('userType')?.value;
  const token = (await cookies()).get('token')?.value;

  // const resCookies = response.Set

  // const res = await fetch(
  //   `${request.nextUrl.origin}/auth/sign-in/api`
  // ).then((res) => res.json());

  // // const userType = res.userType;
  // const token = res.token;
  // console.log('all cookies', resCookies);
  console.log('UserType:', userType);
  console.log('Token:', token);

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
    return NextResponse.redirect(new URL('/', request.url));
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
