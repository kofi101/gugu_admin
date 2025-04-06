'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Text } from '@/components/ui/text';
import { routes } from '@/config/routes';
import { useSendPasswordResetEmail } from 'react-firebase-hooks/auth';
import { auth } from '@/config/firebase';
import toast from 'react-hot-toast';

const initialValues = {
  email: '',
};

export default function ForgetPasswordForm() {
  const [reset, setReset] = useState({});

  const [sendPasswordResetEmail, sending, error] =
    useSendPasswordResetEmail(auth);

  const onSubmit = async (data) => {
    try {
      sendPasswordResetEmail(data.email, {
        url: 'https://gugu-admin.vercel.app/auth/sign-in',
        handleCodeInApp: false,
      });
      setReset(initialValues);

      toast.success(<Text>Password reset mail sent to your email</Text>);
    } catch (error) {
      toast.error(
        <Text>Something went wrong sending you password reset link</Text>
      );
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-lg md:mt-36">
      <Form
        resetValues={reset}
        onSubmit={onSubmit}
        useFormProps={{
          mode: 'onChange',
          defaultValues: initialValues,
        }}
        className="pt-1.5"
      >
        {({ register, formState: { errors } }) => (
          <div className="space-y-6">
            <Input
              type="email"
              size="lg"
              label="Email"
              placeholder="Enter your email"
              className="[&>label>span]:font-medium"
              inputClassName="text-sm"
              {...register('email', {
                required: 'Provide a password reset link',
              })}
              error={errors.email?.message}
            />

            <Button
              isLoading={sending}
              className="mt-2 w-full"
              type="submit"
              size="lg"
            >
              Get Password Reset Link
            </Button>
          </div>
        )}
      </Form>
      <Text className="mt-6 text-center text-[15px] leading-loose text-gray-500 lg:mt-8 lg:text-start xl:text-base">
        Don’t want to reset your password?{' '}
        <Link
          href={routes.auth.signIn}
          className="font-bold text-gray-700 transition-colors hover:text-blue"
        >
          Sign In
        </Link>
      </Text>
    </div>
  );
}
