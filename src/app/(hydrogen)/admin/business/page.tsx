import { metaObject } from '@/config/site.config';
import { AdminMerchantConfig } from './config';

export const metadata = {
  ...metaObject('Business-Configurations'),
};

export default function AnalyticsPage() {
  return <AdminMerchantConfig />;
}
