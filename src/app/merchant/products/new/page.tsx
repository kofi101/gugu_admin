import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AreaLoading } from '@/features/area-loading';
import { NewProduct } from '@/features/merchant/products';

export const metadata: Metadata = { title: 'Add product' };

export default function Page() {
  return (
    <Suspense fallback={<AreaLoading />}>
      <NewProduct />
    </Suspense>
  );
}
