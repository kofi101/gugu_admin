// import AnalyticsDashboard from '@/app/shared/analytics-dashboard';

import { OrdersManagement } from './orders';
import { metaObject } from '@/config/site.config';
import PageHeader from '@/app/shared/page-header';

export const metadata = {
  ...metaObject('Orders'),
};

const pageHeader = {
  title: 'Order Management',
  breadcrumb: [
    {
      href: '/admin/orders',
      name: 'Orders management',
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
      <OrdersManagement />
    </>
  );
}
