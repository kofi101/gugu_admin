import { OrdersManagement } from './orders';
import { metaObject } from '@/config/site.config';
import PageHeader from '@/app/shared/page-header';
import { baseUrl } from '@/config/base-url';
import { cookies, headers } from 'next/headers';

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

export type AllOrderTypes = {
  orderNumber: string;
  customerId: string;
  fullName: string;
  transactionDate: string;
  quantity: number;
  itemTotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  orderStatus: string;
};

export default async function AdminOrders() {
  const token = cookies().get('token')?.value;

  const fetchOptions = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const ordersRes = await fetch(`${baseUrl}/Orders/AllOrders`, fetchOptions);
  const allOrders: Array<AllOrderTypes> = await ordersRes.json();

  const orderStatusesRes = await fetch(
    `${baseUrl}/Orders/OrderStatus`,
    fetchOptions
  );

  const orderStatuses = await orderStatusesRes.json();

  return (
    <>
      <PageHeader
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
      ></PageHeader>
      <OrdersManagement orderStatuses={orderStatuses} allOrders={allOrders} />
    </>
  );
}
