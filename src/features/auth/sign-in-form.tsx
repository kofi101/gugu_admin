'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { useHydrated } from '@/hooks/use-hydrated';
import { useAuth } from '@/lib/auth';
import { describeError } from '@/lib/errors';
import { safeNext } from './home-for-role';

const schema = z.object({
  email: z.string().trim().min(1, 'Enter your email address.').email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});
type Values = z.infer<typeof schema>;

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1 .7-2.4 1.1-4 1.1-3.1 0-5.7-2.1-6.6-4.9h-4v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.4 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8z" />
    </svg>
  );
}

export function SignInForm() {
  const { session, signInWithEmail, signInWithGoogle } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const hydrated = useHydrated();
  const [formError, setFormError] = useState<string | null>(null);
  const [googleBusy, setGoogleBusy] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const signedInRole = session.status === 'signed-in' ? session.role : null;
  useEffect(() => {
    if (signedInRole) router.replace(safeNext(params.get('next'), signedInRole));
  }, [signedInRole, params, router]);

  const onSubmit = async (values: Values) => {
    setFormError(null);
    try {
      await signInWithEmail(values.email, values.password);
    } catch (error) {
      setFormError(describeError(error));
    }
  };

  const onGoogle = async () => {
    setFormError(null);
    setGoogleBusy(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      setFormError(describeError(error));
    } finally {
      setGoogleBusy(false);
    }
  };

  if (session.status === 'unconfigured') {
    return (
      <p role="alert" className="rounded-lg border border-bad-700/30 bg-bad-50 p-4 text-[0.9375rem] text-bad-700">
        {session.error}
      </p>
    );
  }

  const busy = isSubmitting || googleBusy || signedInRole !== null;

  return (
    <div className="flex flex-col gap-6">
      {params.get('reason') === 'session-ended' && !formError ? (
        <p role="status" className="rounded-lg border border-brand-200 bg-brand-50 px-3.5 py-3 text-[0.9375rem] text-brand-900">
          Your account access changed, so you were signed out. Sign in again to continue.
        </p>
      ) : null}
      <Button variant="secondary" onClick={onGoogle} loading={!hydrated || googleBusy} disabled={busy} icon={<GoogleIcon />}>
        Continue with Google
      </Button>
      <div className="flex items-center gap-3 text-sm text-ink-muted" aria-hidden>
        <span className="h-px flex-1 bg-line" />
        or use your email
        <span className="h-px flex-1 bg-line" />
      </div>
      {/* method="post" is a backstop, not the fix: a form with no method submits
          as GET, so a click landing before hydration would put the password in
          the URL, the browser history and any referrer. The button below is
          disabled until React is listening; the method keeps credentials out of
          the URL even if it somehow submits anyway. */}
      <form method="post" onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        {formError ? (
          <p role="alert" className="rounded-lg border border-bad-700/25 bg-bad-50 px-3.5 py-3 text-[0.9375rem] text-bad-700">
            {formError}
          </p>
        ) : null}
        <Field label="Email" error={errors.email?.message}>
          {(p) => <Input {...p} type="email" autoComplete="email" inputMode="email" {...register('email')} />}
        </Field>
        <Field label="Password" error={errors.password?.message}>
          {(p) => <Input {...p} type="password" autoComplete="current-password" {...register('password')} />}
        </Field>
        <div className="-mt-2 flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-brand-700 underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        {/* `loading`, not `disabled`: Button maps loading to disabled anyway, but
            also sets aria-busy and shows a spinner that animates without JS —
            so a keyboard or screen-reader user meets a busy control rather than
            one silently missing from the tab order. */}
        <Button type="submit" loading={!hydrated || isSubmitting || signedInRole !== null} disabled={busy}>
          Sign in
        </Button>
      </form>
    </div>
  );
}
