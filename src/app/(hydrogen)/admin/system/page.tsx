import { metaObject } from '@/config/site.config';
import SystemPage from './config';

export const metadata = {
  ...metaObject('Accounts Management'),
};

export default function AnalyticsPage() {
  return <SystemPage />;
}
