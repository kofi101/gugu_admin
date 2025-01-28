import Link from 'next/link';
import { routes } from '@/config/routes';
import { Button } from '@/components/ui/button';
import PageHeader from '@/app/shared/page-header';
import OrdersTable from '@/app/shared/ecommerce/order/order-list/table';
import { PiPlusBold } from 'react-icons/pi';
import { orderData } from '@/data/order-data';
import { metaObject } from '@/config/site.config';
import ExportButton from '@/app/shared/export-button';
import { cookies, headers } from 'next/headers';
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

const dummyData = [
  {
    checkOutOrderNumber: 'ORD-1001',
    transactionDate: '2025-01-15T14:30:00Z',
    customerId: 'CUST-001',
    fullName: 'John Doe',
    phoneNumber: '+1234567890',
    address: '123 Main Street, Cityville, USA',
    productId: 101,
    productCode: 'PROD-101',
    productName: 'Wireless Headphones',
    quantity: 2,
    salesPrice: 49.99,
    merchantId: 'MER-001',
    statusDescription: 'Shipped',
  },
  {
    checkOutOrderNumber: 'ORD-1002',
    transactionDate: '2025-01-16T09:15:00Z',
    customerId: 'CUST-002',
    fullName: 'Jane Smith',
    phoneNumber: '+9876543210',
    address: '456 Oak Avenue, Townsville, USA',
    productId: 102,
    productCode: 'PROD-102',
    productName: 'Bluetooth Speaker',
    quantity: 1,
    salesPrice: 99.99,
    merchantId: 'MER-002',
    statusDescription: 'Processing',
  },
  {
    checkOutOrderNumber: 'ORD-1003',
    transactionDate: '2025-01-17T11:45:00Z',
    customerId: 'CUST-003',
    fullName: 'Alice Johnson',
    phoneNumber: '+1928374655',
    address: '789 Pine Road, Villageville, USA',
    productId: 103,
    productCode: 'PROD-103',
    productName: 'Smartphone Case',
    quantity: 3,
    salesPrice: 19.99,
    merchantId: 'MER-003',
    statusDescription: 'Delivered',
  },
  {
    checkOutOrderNumber: 'ORD-1004',
    transactionDate: '2025-01-18T16:00:00Z',
    customerId: 'CUST-004',
    fullName: 'Bob Brown',
    phoneNumber: '+1122334455',
    address: '101 Maple Street, Metropolis, USA',
    productId: 104,
    productCode: 'PROD-104',
    productName: 'USB-C Charging Cable',
    quantity: 5,
    salesPrice: 9.99,
    merchantId: 'MER-004',
    statusDescription: 'Cancelled',
  },
  {
    checkOutOrderNumber: 'ORD-1005',
    transactionDate: '2025-01-19T13:20:00Z',
    customerId: 'CUST-005',
    fullName: 'Charlie Davis',
    phoneNumber: '+4455667788',
    address: '567 Elm Boulevard, Capitol City, USA',
    productId: 105,
    productCode: 'PROD-105',
    productName: 'Wireless Mouse',
    quantity: 1,
    salesPrice: 29.99,
    merchantId: 'MER-005',
    statusDescription: 'Pending',
  },
];

export default async function OrdersPage() {
  const token = cookies().get('token');

  const userId = cookies().get('userId');

  const fetchOptions = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  const statusRes = await await fetch(
    `${baseUrl}/Orders/OrderStatus`,
    fetchOptions
  );

  const statusData: OrderStatus = await statusRes.json();

  const ordersRes = await fetch(
    `${merchantUrl}/TotalOrders/${userId}`,
    fetchOptions
  );
  const allOrders: Array<MerchantOrders> = await ordersRes.json();

  const mappedStatus = statusData?.map((data) => ({
    label: data.displayName,
    value: data.name,
  }));

  const mappedOrders = dummyData?.map((order) => ({
    id: order.checkOutOrderNumber,
    name: order.fullName,
    email: order.phoneNumber,
    avatar:
      'https://isomorphic-furyroad.s3.amazonaws.com/public/avatars-blur/avatar-15.webp',
    items: order.quantity,
    price: order.salesPrice,
    status: order.statusDescription,
    createdAt: order.transactionDate,
    address: order.address,
  }));

  return (
    <>
      <PageHeader
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
      ></PageHeader>

      <OrdersTable data={mappedOrders} status={mappedStatus} />
    </>
  );
}
