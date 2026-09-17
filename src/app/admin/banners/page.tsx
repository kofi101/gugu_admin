import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AreaLoading } from '@/features/area-loading';
import { Banners } from '@/features/admin/banners';

export const metadata: Metadata = { title: 'Banners' };

export default function Page() {
  return (
    <Suspense fallback={<AreaLoading />}>
      <Banners />
    </Suspense>
  );
}
