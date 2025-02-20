import { auth } from 'firebase-admin';
import { customInitApp } from '@/config/firebase-admin';
import { cookies, headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { baseUrl } from '@/config/base-url';
import { redirect } from 'next/navigation';

customInitApp();
// Sign in
export async function POST(request: NextRequest, response: NextResponse) {
  const { email, userId } = await request.json();
  try {
    const dbTokenRes = await fetch(`${baseUrl}/User/GetToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!dbTokenRes.ok) {
      return NextResponse.json({
        message: 'Something went wrong',
        status: 500,
      });
    }

    const dbToken = await dbTokenRes.json();

    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const cookieSet = await cookies();

    cookieSet.set('token', dbToken?.token, {
      secure: true,
      httpOnly: true,
      expires: expires,
      sameSite: 'lax',
    });
    cookieSet.set('userType', dbToken?.userType, {
      secure: true,
      httpOnly: true,
      expires: expires,
      sameSite: 'lax',
    });
    cookieSet.set('userId', userId, {
      secure: true,
      httpOnly: true,
      expires: expires,
      sameSite: 'lax',
    });

    const authorization = headers().get('Authorization');

    if (authorization?.startsWith('Bearer ')) {
      const idToken = authorization.split('Bearer ')[1];
      const decodedToken = await auth().verifyIdToken(idToken);

      if (!decodedToken) {
        return NextResponse.json({
          message: 'Failed to authenticate',
          status: 401,
        });
      }
    }

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error(error);
    throw new Error('Failed to authenticate');
  }
}

export async function GET(request: NextRequest) {
  const session = cookies().get('session')?.value || '';

  if (!session) {
    return NextResponse.json({ isLogged: false }, { status: 401 });
  }

  const decodedClaims = await auth().verifySessionCookie(session, true);

  if (!decodedClaims) {
    return NextResponse.json({ isLogged: false }, { status: 401 });
  }

  return NextResponse.json({ isLogged: true }, { status: 200 });
}
