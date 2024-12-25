// import AnalyticsDashboard from '@/app/shared/analytics-dashboard';

import { CustomerReviews } from './review';
import { metaObject } from '@/config/site.config';
import PageHeader from '@/app/shared/page-header';

export const metadata = {
  ...metaObject('Reviews'),
};

const pageHeader = {
  title: 'Customer Reviews',
  breadcrumb: [
    {
      href: '/admin/reviews',
      name: 'Customer reviews',
    },
  ],
};

export default function AdminOrders() {
  return (
    <>
      <PageHeader
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
      ></PageHeader>
      <CustomerReviews />
    </>
  );
}
