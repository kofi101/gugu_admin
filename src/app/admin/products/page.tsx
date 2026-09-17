import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AreaLoading } from '@/features/area-loading';
import { ProductApprovals } from '@/features/admin/product-approvals';

export const metadata: Metadata = { title: 'Product approvals' };

export default function Page() {
  return (
    <Suspense fallback={<AreaLoading />}>
      <ProductApprovals />
    </Suspense>
  );
}
