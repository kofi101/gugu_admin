import type { Metadata } from 'next';
import { MerchantOverview } from '@/features/merchant/overview';

export const metadata: Metadata = { title: 'Overview' };

export default function MerchantHomePage() {
  return <MerchantOverview />;
}
