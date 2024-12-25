import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, response: NextResponse) {
  if (request.method === 'POST') {
    return NextResponse.json('Method not supported');
  }

  const token = cookies().get('token')?.value;
  

  return NextResponse.json({ token });
}
