import { NextRequest, NextResponse } from 'next/server';

const globalPrefixes = ['/api', '/_next'];
export async function middleware(request: NextRequest) {
  // Allow internal Next.js requests (e.g., /_next/*)
  for (const prefix of globalPrefixes) {
    if (request.nextUrl.pathname.startsWith(prefix)) {
      return NextResponse.next();
    }
  }

  // Allow all users to access /auth/* paths
  if (request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  const session = request.cookies.get('session')?.value;
  const userType = request.cookies.get('userType')?.value;

  console.log('usertype session', { session, userType });

  // Redirect unauthenticated users to sign-in if not accessing /auth/*
  if (!session || !userType) {
    console.log('session or usertype is not set');
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }

  // Validate the session via API call
  try {
    console.log('waht origin here', request.nextUrl.origin);
    const responseAPI = await fetch(
      `${request.nextUrl.origin}/auth/sign-in/api`,
      {
        headers: { Cookie: `session=${session}` },
      }
    );

    if (responseAPI.status !== 200) {
      console.log('what response status', responseAPI.status);

      return NextResponse.redirect(new URL('/auth/sign-in', request.url));
    }
  } catch (error) {
    console.error('API validation failed:', error);
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }

  // Define route prefixes for user types
  const routePrefixes = {
    Merchant: ['/'],
    SuperAdministrator: ['/admin'],
  };

  const userRoutes =
    routePrefixes[userType as 'Merchant' | 'SuperAdministrator'];

  // Allow access to user-specific routes
  if (
    userRoutes?.some((prefix) => request.nextUrl.pathname.startsWith(prefix))
  ) {
    return NextResponse.next();
  }

  console.log('what request url', request.url);
  // Redirect users to their default dashboard if accessing unauthorized routes
  const redirectUrl = userType === 'Merchant' ? '/' : '/admin/dashboard';
  return NextResponse.redirect(new URL(redirectUrl, request.url));
}
