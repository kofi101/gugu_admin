import { metaObject } from '@/config/site.config';
import AccountsPage from './config';

export const metadata = {
  ...metaObject('Accounts Management'),
};

export default function AnalyticsPage() {
  return <AccountsPage />;
}
