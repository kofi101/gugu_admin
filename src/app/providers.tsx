'use client';

import type { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/lib/auth';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster
        position="top-center"
        gutter={10}
        toastOptions={{
          duration: 4000,
          className: '!rounded-lg !text-[0.9375rem] !text-ink !shadow-[var(--shadow-pop)] !max-w-md',
          success: { iconTheme: { primary: '#1a7547', secondary: '#fff' } },
          error: { iconTheme: { primary: '#b42318', secondary: '#fff' } },
        }}
      />
    </AuthProvider>
  );
}
