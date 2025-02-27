import { metaObject } from '@/config/site.config';
import SystemPage from './config';
import { managementUrl } from '@/config/base-url';
import { fetchUtil } from '@/utils/fetch';
import { cookies } from 'next/headers';

export const metadata = {
  ...metaObject('Accounts Management'),
};

export default async function AnalyticsPage() {
  const cookieSet = await cookies();
  const token = cookieSet.get('token')?.value;

  const fetchOptions = {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };

  const companyDetails = await fetchUtil(
    `${managementUrl}/CompanyDetails`,
    fetchOptions
  );

  const approvedProducts = await fetchUtil(
    `${managementUrl}/ApprovedProducts`,
    fetchOptions
  );

  const carouselData = await fetchUtil(
    `${managementUrl}/CarouselBanner`,
    fetchOptions
  );

  return (
    <SystemPage
      approvedProducts={approvedProducts}
      carouselData={carouselData}
      companyDetails={companyDetails}
    />
  );
}
