'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { homeForRole } from './home-for-role';
import { NoAccess } from './no-access';

export function NoAccessRoute() {
  const { session } = useAuth();
  const router = useRouter();
  const target =
    session.status === 'signed-out'
      ? '/sign-in'
      : session.status === 'signed-in' && session.role !== 'customer'
        ? homeForRole(session.role)
        : null;
  useEffect(() => {
    if (target) router.replace(target);
  }, [target, router]);
  if (session.status !== 'signed-in' || target) {
    return <div role="status" className="grid min-h-dvh place-items-center text-ink-muted">Checking your access…</div>;
  }
  return <NoAccess />;
}
