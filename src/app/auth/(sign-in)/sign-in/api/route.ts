import { auth } from 'firebase-admin';
import { customInitApp } from '@/config/firebase-admin';
import { cookies, headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { baseUrl } from '@/config/base-url';

customInitApp();

export async function POST(request: NextRequest, response: NextResponse) {
  try {
    const reqData = await request.json();

    const authorization = headers()?.get('Authorization');

    // verify token with firebase
    if (authorization?.startsWith('Bearer ')) {
      const idToken = authorization.split('Bearer ')[1];
      const decodedToken = await auth()?.verifyIdToken(idToken);

      if (!decodedToken) {
        return NextResponse.json({
          message: 'Failed to authenticate',
          status: 401,
        });
      }

      if (decodedToken) {
        const expiresIn = 60 * 60 * 24 * 5 * 1000;
        const sessionCookie = await auth().createSessionCookie(idToken, {
          expiresIn,
        });

        const options = {
          name: 'session',
          value: sessionCookie,
          maxAge: expiresIn,
          httpOnly: true,
          secure: true,
        };

        cookies().set(options);
      }
    }

    const dbTokenRes = await fetch(`${baseUrl}/User/GetToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: reqData?.email }),
    });

    if (!dbTokenRes.ok) {
      return NextResponse.json({
        message: 'Something went wrong',
        status: 500,
      });
    }

    const dbToken = await dbTokenRes.json();

    cookies().set('token', dbToken?.token, { secure: true });
    cookies().set('userType', dbToken?.userType, { secure: true });
    cookies().set('userId', reqData?.userId, { secure: true });

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
