import { auth } from '@/config/firebase';
import { customInitApp } from '@/config/firebase-admin';
import { cookies} from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

customInitApp();
export async function GET(request: NextRequest) {
  try {
    const cookieSet = await cookies();

    cookieSet.delete('token');
    cookieSet.delete('userType');
    cookieSet.delete('userId');
    cookieSet.delete('_vercel_jwt');
    cookieSet.delete('vercel-feature-flags');

    await auth.signOut();

    return NextResponse.json({
        message: 'Logged out successfully',
        status: 200
    })
  } catch (error) {
    console.error(error);
    throw new Error('Failed to logout');
  }
}
