import MerchantSalesByDate from './sales';
import { metaObject } from '@/config/site.config';
import PageHeader from '@/app/shared/page-header';

export const metadata = {
  ...metaObject('Sales'),
};

const pageHeader = {
  title: 'Merchant Sales',
  breadcrumb: [
    {
      href: '/admin/sales',
      name: 'Merchant sales',
    },
  ],
};

export default function MerchantSales() {
  return (
    <>
      <PageHeader
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
      ></PageHeader>
      <MerchantSalesByDate />
    </>
  );
}
