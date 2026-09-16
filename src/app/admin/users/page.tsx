import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AreaLoading } from '@/features/area-loading';
import { Users } from '@/features/admin/users';

export const metadata: Metadata = { title: 'Users and roles' };

export default function Page() {
  return (
    <Suspense fallback={<AreaLoading />}>
      <Users />
    </Suspense>
  );
}
