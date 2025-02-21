import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, response: NextResponse) {
  if (request.method === 'POST') {
    return NextResponse.json('Method not supported');
  }

  const token = await cookies().get('token')?.value;
  const userType = await cookies().get('UserType')?.value;

  return NextResponse.json({ token, userType });
}
