'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { Wordmark } from '@/components/brand';
import { Skeleton } from '@/components/ui/states';
import { useAuth } from '@/lib/auth';
import type { Role } from '@/lib/types';
import { homeForRole } from './home-for-role';
import { NoAccess } from './no-access';

function ShellPlaceholder() {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]" role="status" aria-live="polite">
      <span className="sr-only">Checking your access…</span>
      <div className="hidden bg-brand-900 lg:block">
        <div className="woven h-2" />
        <div className="px-5 pt-5">
          <Wordmark inverse area=" " />
        </div>
      </div>
      <div className="h-14 bg-brand-900 lg:hidden" />
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-3 h-4 w-80 max-w-full" />
        <Skeleton className="mt-8 h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}

/**
 * UX-only route guard. Real enforcement is Firestore/Storage rules and
 * callable Functions; this only decides what to render.
 */
export function RoleGate({ role, children }: { role: Exclude<Role, 'customer'>; children: ReactNode }) {
  const { session } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const redirect =
    session.status === 'signed-out'
      ? `/sign-in/?next=${encodeURIComponent(pathname)}`
      : session.status === 'signed-in' && session.role === 'admin' && role === 'merchant'
        ? homeForRole('admin')
        : null;

  useEffect(() => {
    if (redirect) router.replace(redirect);
  }, [redirect, router]);

  if (session.status === 'unconfigured') {
    return (
      <p role="alert" className="m-6 rounded-lg border border-bad-700/30 bg-bad-50 p-4 text-bad-700">
        {session.error}
      </p>
    );
  }
  if (session.status !== 'signed-in' || redirect) return <ShellPlaceholder />;
  if (session.role === role) return <>{children}</>;
  if (session.role === 'merchant' && role === 'admin') return <NoAccess reason="staff-only" />;
  return <NoAccess reason="customer" />;
}
