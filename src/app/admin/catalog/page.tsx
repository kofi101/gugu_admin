import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AreaLoading } from '@/features/area-loading';
import { Catalog } from '@/features/admin/catalog';

export const metadata: Metadata = { title: 'Categories' };

export default function Page() {
  return (
    <Suspense fallback={<AreaLoading />}>
      <Catalog />
    </Suspense>
  );
}
