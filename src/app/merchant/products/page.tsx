import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AreaLoading } from '@/features/area-loading';
import { MerchantProducts } from '@/features/merchant/products';

export const metadata: Metadata = { title: 'Products' };

export default function Page() {
  return (
    <Suspense fallback={<AreaLoading />}>
      <MerchantProducts />
    </Suspense>
  );
}
