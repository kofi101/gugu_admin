import PageHeader from '@/app/shared/page-header';
import OrdersTable from '@/app/shared/ecommerce/order/order-list/table';
import { metaObject } from '@/config/site.config';
import { cookies } from 'next/headers';
import { baseUrl, merchantUrl } from '@/config/base-url';

export type MerchantOrders = {
  checkOutOrderNumber: string;
  transactionDate: string;
  customerId: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  productId: number;
  productCode: string;
  productName: string;
  quantity: number;
  salesPrice: number;
  merchantId: string;
  statusDescription: string;
};

export type OrderStatus = Array<{
  id: number;
  name: string;
  displayName: string;
}>;

export const metadata = {
  ...metaObject('Orders'),
};

const pageHeader = {
  title: 'Orders',
  breadcrumb: [
    {
      href: '/orders',
      name: 'Orders',
    },
    {
      name: 'List',
    },
  ],
};

export default async function OrdersPage() {
  const token = cookies()?.get('token');
  const userId = cookies()?.get('userId');
  try {
    if (!token || !userId) {
      throw new Error('Unauthorized: Missing token or userId.');
    }

    const fetchOptions = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    const [statusRes, ordersRes] = await Promise.all([
      fetch(`${baseUrl}/Orders/OrderStatus`, fetchOptions),
      fetch(`${merchantUrl}/TotalOrders/${userId}`, fetchOptions),
    ]);

    if (!statusRes.ok || !ordersRes.ok) {
      throw new Error('Failed to fetch orders or statuses.');
    }

    const statusData: OrderStatus = await statusRes.json();
    const allOrders: Array<MerchantOrders> = await ordersRes.json();

    const mappedStatus = statusData?.map(({ displayName, name }) => ({
      label: displayName,
      value: name,
    }));

    const mappedOrders = allOrders?.map(
      ({
        checkOutOrderNumber,
        fullName,
        phoneNumber,
        quantity,
        salesPrice,
        statusDescription,
        transactionDate,
        address,
        customerId,
      }) => ({
        id: checkOutOrderNumber,
        name: fullName,
        email: phoneNumber,
        avatar:
          'https://isomorphic-furyroad.s3.amazonaws.com/public/avatars-blur/avatar-15.webp',
        items: quantity,
        price: salesPrice,
        status: statusDescription,
        createdAt: transactionDate,
        address,
        customerId,
      })
    );

    return (
      <>
        <PageHeader
          title={pageHeader.title}
          breadcrumb={pageHeader.breadcrumb}
        />
        <OrdersTable data={mappedOrders} status={mappedStatus} />
      </>
    );
  } catch (error) {
    console.error('Error loading orders:', error);
    return <p className="text-center text-red-500">Failed to load orders.</p>;
  }
}
