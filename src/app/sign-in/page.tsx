import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthFrame } from '@/features/auth/auth-frame';
import { SignInForm } from '@/features/auth/sign-in-form';

export const metadata: Metadata = { title: 'Sign in' };

export default function SignInPage() {
  return (
    <AuthFrame title="Sign in" intro="Use the account you sell or work with on GUGU.">
      <Suspense>
        <SignInForm />
      </Suspense>
    </AuthFrame>
  );
}
