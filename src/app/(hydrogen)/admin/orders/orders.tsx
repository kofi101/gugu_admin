'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { SpinnerLoader } from '@/components/ui/spinner';
import { fetchUtil } from '@/utils/fetch';
import { managementUrl } from '@/config/base-url';
import toast from 'react-hot-toast';
import { getUserToken } from '@/utils/get-token';
import { AllOrderTypes } from './page';
import { format } from 'date-fns';

type Order = {
  orderId: string;
  customerName: string;
  orderDate: string;
  orderStatus: string;
  totalAmount: number;
  refundStatus?: string;
};

const orderStatusOptions = [
  { label: 'Pending', value: 'Pending' },
  { label: 'Processed', value: 'Processed' },
  { label: 'Shipped', value: 'Shipped' },
  { label: 'Delivered', value: 'Delivered' },
  { label: 'Cancelled', value: 'Cancelled' },
];

export const OrdersManagement = ({
  allOrders,
  orderStatuses,
}: {
  allOrders: Array<AllOrderTypes>;
}) => {
  const [filteredStatus, setFilteredStatus] = useState('');

  const filteredOrders = filteredStatus
    ? allOrders.filter((order) => order.orderStatus === filteredStatus)
    : allOrders;

  if (!allOrders || allOrders.length === 0) {
    return <p className="mt-20 text-center text-gray-600">No orders found</p>;
  }
  return (
    <div className="max-w-full overflow-auto rounded-lg bg-white p-6 shadow-md">
      <h4 className="mb-4 text-xl font-semibold text-gray-800">Order List</h4>

      {/* Filter Buttons */}
      <div className="mb-4 flex gap-2">
        <Button
          className={`rounded bg-gray-200 px-4 py-2 text-sm font-medium hover:text-white ${
            !filteredStatus ? 'bg-blue-500 text-white' : 'text-gray-800'
          }`}
          onClick={() => setFilteredStatus('')}
        >
          All
        </Button>
        {['Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
          <Button
            key={status}
            className={`rounded px-4 py-2 text-sm font-medium hover:text-white ${
              filteredStatus === status
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
            onClick={() => setFilteredStatus(status)}
          >
            {status}
          </Button>
        ))}
      </div>

      <table className="min-w-full border border-gray-200 bg-white text-left">
        <thead>
          <tr>
            <th className="border-b bg-gray-100 px-4 py-2 text-sm font-semibold uppercase text-gray-600">
              Order Number
            </th>
            <th className="border-b bg-gray-100 px-4 py-2 text-sm font-semibold uppercase text-gray-600">
              Customer Name
            </th>
            <th className="border-b bg-gray-100 px-4 py-2 text-sm font-semibold uppercase text-gray-600">
              Transaction Date
            </th>
            <th className="border-b bg-gray-100 px-4 py-2 text-sm font-semibold uppercase text-gray-600">
              Quantity
            </th>
            <th className="border-b bg-gray-100 px-4 py-2 text-sm font-semibold uppercase text-gray-600">
              Item Total (GHC)
            </th>
            <th className="border-b bg-gray-100 px-4 py-2 text-sm font-semibold uppercase text-gray-600">
              Discount (GHC)
            </th>
            <th className="border-b bg-gray-100 px-4 py-2 text-sm font-semibold uppercase text-gray-600">
              Shipping Cost (GHC)
            </th>
            <th className="border-b bg-gray-100 px-4 py-2 text-sm font-semibold uppercase text-gray-600">
              Total (GHC)
            </th>
            <th className="border-b bg-gray-100 px-4 py-2 text-sm font-semibold uppercase text-gray-600">
              Order Status
            </th>
          </tr>
        </thead>
        <tbody>
          {allOrders?.map((order) => (
            <tr className="" key={order.orderNumber}>
              <td className="border-b px-4 py-4 text-sm text-gray-700">
                {order.orderNumber}
              </td>
              <td className="border-b px-4 py-4 text-sm text-gray-700">
                {order.fullName}
              </td>
              <td className="border-b px-4 py-4 text-sm text-gray-700">
                {format(new Date(order.transactionDate), 'yyyy-MM-dd')}
              </td>
              <td className="border-b px-4 py-4 text-sm text-gray-700">
                {order.quantity}
              </td>
              <td className="border-b px-4 py-4 text-sm text-gray-700">
                {order.itemTotal.toFixed(2)}
              </td>
              <td className="border-b px-4 py-4 text-sm text-gray-700">
                {order.discount.toFixed(2)}
              </td>
              <td className="border-b px-4 py-4 text-sm text-gray-700">
                {order.shippingCost.toFixed(2)}
              </td>
              <td className="border-b px-4 py-4 text-sm text-gray-700">
                {order.total.toFixed(2)}
              </td>
              <td className="border-b px-4 py-4 text-sm text-gray-700">
                {order.orderStatus}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
