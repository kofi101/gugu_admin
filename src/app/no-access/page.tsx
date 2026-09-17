import type { Metadata } from 'next';
import { NoAccessRoute } from '@/features/auth/no-access-route';

export const metadata: Metadata = { title: 'No seller access' };

export default function NoAccessPage() {
  return <NoAccessRoute />;
}
