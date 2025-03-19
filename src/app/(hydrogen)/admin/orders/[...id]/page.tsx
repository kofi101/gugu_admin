import { metaObject } from '@/config/site.config';
import PageHeader from '@/app/shared/page-header';
import { baseUrl } from '@/config/base-url';
import { cookies } from 'next/headers';
import CustomerOrderDetails from './order-details';

export const metadata = {
  ...metaObject('Orders Details'),
};

const pageHeader = {
  title: 'Order Details',
  breadcrumb: [
    {
      name: 'All Orders',
      href: '/admin/orders',
    },
    {
      name: 'Orders details',
    },
  ],
};

export default async function OrderDetails({
  params,
}: {
  params: Promise<{ id: Array<string> }>;
}) {
  const { id } = await params;

  const token = cookies()?.get('token')?.value;

  const fetchOptions = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const slug = id?.join('/');

  const orderDetailsRes = await fetch(
    `${baseUrl}/Orders/CustomerOrderDetails/${slug}`,
    fetchOptions
  );

  const details = await orderDetailsRes.json();

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

      <CustomerOrderDetails orderStatuses={orderStatuses} order={details} />
    </>
  );
}
