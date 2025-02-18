import { metaObject } from '@/config/site.config';
import SystemPage from './config';
import { managementUrl } from '@/config/base-url';

export const metadata = {
  ...metaObject('Accounts Management'),
};

export default async function AnalyticsPage() {
  let companyDetails = await fetch(`${managementUrl}/CompanyDetails`).then(
    (res) => res.json()
  );

  return <SystemPage companyDetails={companyDetails} />;
}
