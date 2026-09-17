import type { Metadata } from 'next';
import { AuthFrame } from '@/features/auth/auth-frame';
import { ForgotPasswordForm } from '@/features/auth/forgot-password-form';

export const metadata: Metadata = { title: 'Reset password' };

export default function ForgotPasswordPage() {
  return (
    <AuthFrame title="Reset your password" intro="Enter your account email and we will send you a link to set a new password.">
      <ForgotPasswordForm />
    </AuthFrame>
  );
}
