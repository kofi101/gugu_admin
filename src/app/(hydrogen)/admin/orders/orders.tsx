'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { SpinnerLoader } from '@/components/ui/spinner';
import { fetchUtil } from '@/utils/fetch';
import { baseUrl, managementUrl } from '@/config/base-url';
import toast from 'react-hot-toast';
import { getUserToken } from '@/utils/get-token';
import { Input } from 'rizzui';
import { AllOrderTypes } from './page';
import { format } from 'date-fns';
import { Unauthorized } from '../../(product-page)/products/configs/page';
import { register } from 'module';

type Order = {
  orderId: string;
  customerName: string;
  orderDate: string;
  orderStatus: string;
  totalAmount: number;
  refundStatus?: string;
};

type OrderStatus = {
  id: number;
  name: string;
  displayName: string;
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
  orderStatuses: Array<OrderStatus>;
}) => {
  const [filteredStatus, setFilteredStatus] = useState('');
  const [orders, setOrders] = useState(allOrders);

  const [formLoading, setFormLoading] = useState(false);

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (formData) => {
    try {
      const token = await getUserToken();

      const fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({}),
      };

      const response = await fetch(
        `${baseUrl}/Orders/AllOrdersByDate/${formData.start}/${formData.end}`,
        fetchOptions
      );

      if (response.status === 401) {
        setFormLoading(false);
        return toast.error(<Unauthorized />);
      }

      if (!response.ok) {
        setFormLoading(false);
        return toast.error('Failed to filter Orders');
      }

      const data = await response.json();

      setOrders(data);

      reset();

      setFormLoading(false);
    } catch (error) {
      setFormLoading(false);
      toast.error('Failed to filter Orders');
      console.error('Failed to filter Orders', error);
    }

    reset();
  };

  const filteredOrders = filteredStatus
    ? orders?.filter((order) => order.orderStatus === filteredStatus)
    : orders;

  if (!orders || orders?.length === 0) {
    return <p className="mt-20 text-center text-gray-600">No orders found</p>;
  }
  return (
    <div className="max-w-full overflow-auto rounded-lg bg-white p-6 shadow-md">
      <h4 className="mb-4 text-xl font-semibold text-gray-800">Order List</h4>

      {/* Filter Buttons */}

      <div className="mb-6 flex flex-col items-center md:flex-row md:justify-between md:gap-10">
        <div className="mb-4 flex flex-wrap gap-2 md:w-1/2">
          <Button
            className={`rounded bg-gray-200 px-4 py-2 text-sm font-medium hover:text-white ${
              !filteredStatus ? 'bg-blue-500 text-white' : 'text-gray-800'
            }`}
            onClick={() => setFilteredStatus('')}
          >
            All
          </Button>
          {orderStatuses?.map((status) => (
            <Button
              key={status?.id}
              className={`rounded px-4 py-2 text-sm font-medium hover:text-white ${
                filteredStatus === status?.name
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
              onClick={() => setFilteredStatus(status?.name)}
            >
              {status?.displayName}
            </Button>
          ))}
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-wrap items-center gap-2 md:mb-6 md:gap-4"
        >
          <Input
            {...register('start', {
              required: 'Start date is required',
            })}
            className="mb-4"
            label="Start Date"
            type="date"
            error={errors.start?.message as string}
          />
          <Input
            {...register('end', {
              required: 'End date is required',
            })}
            className="mb-4"
            label="End Date"
            type="date"
            error={errors.end?.message as string}
          />

          <Button className="mt-2" type="submit">
            {' '}
            Filter By Date
          </Button>
        </form>
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
          {filteredOrders?.map((order) => (
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
                {order.orderStatus === 'OutforDelivery'
                  ? 'Out for Delivery'
                  : order.orderStatus}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
