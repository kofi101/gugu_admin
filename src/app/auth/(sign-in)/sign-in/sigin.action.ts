'use server';

import { auth } from 'firebase-admin';
import { customInitApp } from '@/config/firebase-admin';
import { cookies } from 'next/headers';
import { baseUrl } from '@/config/base-url';

customInitApp();

export const handleLogin = async ({ email, userId, token }) => {
  const cookieSet = await cookies();
  try {
    const dbTokenRes = await fetch(`${baseUrl}/User/GetToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!dbTokenRes.ok) {
      console.error('Something went wrong');
      return;
    }

    const dbToken = await dbTokenRes.json();

    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

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

    const decodedToken = await auth().verifyIdToken(token);

    if (!decodedToken) {
      throw new Error('Failed to authenticate');
    }
  } catch (error) {
    console.error(error);
    throw new Error('Failed to authenticate');
  }
};
