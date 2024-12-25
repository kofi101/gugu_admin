import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest, response: NextResponse) {
  const session = request.cookies.get('session');

  if (!session) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }

  const responseAPI = await fetch(
    `${request.nextUrl.origin}/auth/sign-in/api`,
    {
      headers: {
        Cookie: `session=${session?.value}`,
      },
    }
  );

  if (responseAPI.status !== 200) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // restricted routes
  matcher: [
    // '/',
    // '/products',
    // // '/products/create',
    // '/products/configs',
    // '/products/orders',
    // '/products/orders/:path*',
    // '/products/reviews',
    // '/analytics',
    // '/invoice',
    // '/invoice/create',
    // '/invoice/:path*',
    // '/invoice/:path/edit',
    // '/admin',
    // '/admin/business',
    // '/admin/products',
    // '/admin/orders',
    // '/admin/inventory',
    // '/admin/user-control',
    // '/admin/communication',
    // '/admin/customer-services',
    // '/admin/business/merchants',
    // '/admin/business/customers',
    // '/admin/products/pending',
    // '/admin/products/approved',
    // '/admin/user-control/business-info',
    // '/admin/user-control/roles',
    // '/admin/analytics',
    // '/admin/content',
  ],
};
