'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FirebaseError } from 'firebase/app';
import { MailCheck } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button, ButtonLink } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { useAuth } from '@/lib/auth';
import { describeError } from '@/lib/errors';

const schema = z.object({
  email: z.string().trim().min(1, 'Enter your email address.').email('Enter a valid email address.'),
});
type Values = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const { sendReset } = useAuth();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }: Values) => {
    setFormError(null);
    try {
      await sendReset(email);
      setSentTo(email);
    } catch (error) {
      // Do not reveal whether an account exists.
      if (error instanceof FirebaseError && error.code === 'auth/user-not-found') {
        setSentTo(email);
        return;
      }
      setFormError(describeError(error));
    }
  };

  if (sentTo) {
    return (
      <div className="flex flex-col items-start gap-4" role="status">
        <MailCheck className="size-7 text-brand-700" aria-hidden />
        <p className="text-[0.9375rem] text-ink">
          If <strong className="font-semibold break-all">{sentTo}</strong> has a GUGU account, a reset link is on its way.
          Check spam if it does not arrive in a few minutes.
        </p>
        <ButtonLink href="/sign-in/" variant="secondary">
          Back to sign in
        </ButtonLink>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      {formError ? (
        <p role="alert" className="rounded-lg border border-bad-700/25 bg-bad-50 px-3.5 py-3 text-[0.9375rem] text-bad-700">
          {formError}
        </p>
      ) : null}
      <Field label="Email" error={errors.email?.message}>
        {(p) => <Input {...p} type="email" autoComplete="email" inputMode="email" {...register('email')} />}
      </Field>
      <Button type="submit" loading={isSubmitting}>
        Send reset link
      </Button>
      <Link href="/sign-in/" className="text-sm font-semibold text-brand-700 underline-offset-4 hover:underline">
        Back to sign in
      </Link>
    </form>
  );
}
