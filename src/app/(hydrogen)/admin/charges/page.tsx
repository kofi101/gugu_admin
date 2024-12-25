import { metaObject } from '@/config/site.config';
import ChargesTaxConfig from './config';

export const metadata = {
  ...metaObject('Taxes and Charges'),
};

export default function AnalyticsPage() {
  return <ChargesTaxConfig />;
}
