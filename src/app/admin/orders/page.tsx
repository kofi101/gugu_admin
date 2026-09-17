import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AreaLoading } from '@/features/area-loading';
import { AdminOrders } from '@/features/admin/orders';

export const metadata: Metadata = { title: 'All orders' };

export default function Page() {
  return (
    <Suspense fallback={<AreaLoading />}>
      <AdminOrders />
    </Suspense>
  );
}
