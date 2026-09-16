'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { homeForRole } from '@/features/auth/home-for-role';
import { useAuth } from '@/lib/auth';

export default function Home() {
  const { session } = useAuth();
  const router = useRouter();
  const target =
    session.status === 'signed-in'
      ? homeForRole(session.role)
      : session.status === 'signed-out' || session.status === 'unconfigured'
        ? '/sign-in/'
        : null;

  useEffect(() => {
    if (target) router.replace(target);
  }, [target, router]);

  return (
    <div role="status" className="grid min-h-dvh place-items-center text-ink-muted">
      Opening your dashboard…
    </div>
  );
}
