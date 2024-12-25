import { z } from 'zod';
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from '@/utils/validators/common-rules';

// form zod validation schema
export const signUpSchema = z
  .object({
    businessName: z.string().min(1, { message: 'Enter business name' }),
    businessPhone: z.string().min(1, { message: 'Enter business phone' }),
    email: validateEmail,
    password: validatePassword,
    confirmPassword: validateConfirmPassword,
    category: z.string().min(1, { message: 'Select business category' }),
    address: z.string().min(1, { message: 'Enter business address' }),
    isAgreed: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// generate form types from zod validation schema
export type SignUpSchema = z.infer<typeof signUpSchema>;
