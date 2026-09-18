import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthFrame } from '@/features/auth/auth-frame';
import { SignInForm } from '@/features/auth/sign-in-form';

export const metadata: Metadata = { title: 'Sign in' };

export default function SignInPage() {
  return (
    <AuthFrame title="Sign in" intro="Use the account you sell or work with on GUGU.">
      {/* This boundary has no fallback on purpose. SignInForm calls
          useSearchParams(), so in a static export the boundary bails out of
          prerendering and the built sign-in.html contains no form at all —
          which is what keeps a password out of the URL if someone submits
          before hydration. Giving it a fallback that renders the form, or
          dropping the useSearchParams() usage, would prerender the form and
          make that window live. See the guards in SignInForm itself. */}
      <Suspense>
        <SignInForm />
      </Suspense>
    </AuthFrame>
  );
}
