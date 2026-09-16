import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AreaLoading } from '@/features/area-loading';
import { AdminOverview } from '@/features/admin/overview';

export const metadata: Metadata = { title: 'Staff overview' };

export default function Page() {
  return (
    <Suspense fallback={<AreaLoading />}>
      <AdminOverview />
    </Suspense>
  );
}
