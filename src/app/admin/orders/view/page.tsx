import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AreaLoading } from '@/features/area-loading';
import { AdminOrderDetail } from '@/features/admin/orders';

export const metadata: Metadata = { title: 'Order' };

export default function Page() {
  return (
    <Suspense fallback={<AreaLoading />}>
      <AdminOrderDetail />
    </Suspense>
  );
}
