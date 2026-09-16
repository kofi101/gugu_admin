import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AreaLoading } from '@/features/area-loading';
import { MerchantOrders } from '@/features/merchant/orders';

export const metadata: Metadata = { title: 'Orders' };

export default function MerchantOrdersPage() {
  return (
    <Suspense fallback={<AreaLoading />}>
      <MerchantOrders />
    </Suspense>
  );
}
