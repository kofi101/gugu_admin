import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AreaLoading } from '@/features/area-loading';
import { EditProduct } from '@/features/merchant/products';

export const metadata: Metadata = { title: 'Edit product' };

export default function Page() {
  return (
    <Suspense fallback={<AreaLoading />}>
      <EditProduct />
    </Suspense>
  );
}
