import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AreaLoading } from '@/features/area-loading';
import { StoreProfile } from '@/features/merchant/store';

export const metadata: Metadata = { title: 'Store profile' };

export default function Page() {
  return (
    <Suspense fallback={<AreaLoading />}>
      <StoreProfile />
    </Suspense>
  );
}
