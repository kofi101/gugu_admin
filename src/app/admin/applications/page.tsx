import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AreaLoading } from '@/features/area-loading';
import { Applications } from '@/features/admin/applications';

export const metadata: Metadata = { title: 'Seller applications' };

export default function Page() {
  return (
    <Suspense fallback={<AreaLoading />}>
      <Applications />
    </Suspense>
  );
}
