import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AreaLoading } from '@/features/area-loading';
import { MerchantOrderDetail } from '@/features/merchant/orders';

export const metadata: Metadata = { title: 'Order' };

export default function MerchantOrderPage() {
  return (
    <Suspense fallback={<AreaLoading />}>
      <MerchantOrderDetail />
    </Suspense>
  );
}
