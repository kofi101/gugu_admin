'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { auth } from '@/config/firebase';
import { Password } from '@/components/ui/password';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import toast from 'react-hot-toast';
import {
  useAuthState,
  useUpdatePassword,
  useSignInWithEmailAndPassword,
} from 'react-firebase-hooks/auth';

const initialValues = {
  currentPassword: '',
  newPassword: '',
};

export default function UpdatePassword() {
  const [loading, setLoading] = useState(false);
  const [updatePassword] = useUpdatePassword(auth);
  const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);

  const [user] = useAuthState(auth);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: initialValues,
  });

  const onSubmit = async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    if (!user || !user.email) {
      toast.error(<Text>No authenticated user found</Text>);
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(user?.email, data?.currentPassword);

      await updatePassword(data?.newPassword);

      reset(initialValues);
      toast.success(<Text>Password updated successfully</Text>);
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/wrong-password') {
        toast.error(<Text>Incorrect current password</Text>);
      } else if (error.code === 'auth/weak-password') {
        toast.error(<Text>New password is too weak</Text>);
      } else {
        toast.error(<Text>Something went wrong updating your password</Text>);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="w-full max-w-md" onSubmit={handleSubmit(onSubmit)}>
      <Password
        label="Current Password"
        placeholder="Enter your current password"
        size="lg"
        className="mb-4 [&>label>span]:font-medium"
        inputClassName="text-sm"
        {...register('currentPassword', {
          required: 'Please enter current password',
        })}
        error={errors.currentPassword?.message}
      />
      <Password
        label="New Password"
        placeholder="Enter new password"
        size="lg"
        className="mb-4 [&>label>span]:font-medium"
        inputClassName="text-sm"
        {...register('newPassword', {
          required: 'Please enter new password',
          minLength: {
            value: 6,
            message: 'Password must be at least 6 characters',
          },
        })}
        error={errors.newPassword?.message}
      />

      <Button
        isLoading={loading}
        size="md"
        type="submit"
        className="col-span-2 mt-2"
      >
        <span>Update Password</span>
      </Button>
    </form>
  );
}
