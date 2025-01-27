'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { SpinnerLoader } from '@/components/ui/spinner';
import { baseUrl } from '@/config/base-url';
import toast from 'react-hot-toast';
import { getUserToken } from '@/utils/get-token';
import { Input } from 'rizzui';
import { AllOrderTypes } from './page';
import { format } from 'date-fns';
import { Unauthorized } from '../../(product-page)/products/configs/page';
import { MdClose } from 'react-icons/md';

type OrderStatus = {
  id: number;
  name: string;
  displayName: string;
};

export const OrdersManagement = ({
  allOrders,
  orderStatuses,
}: {
  allOrders: Array<AllOrderTypes>;
  orderStatuses: Array<OrderStatus>;
}) => {
  const [filteredStatus, setFilteredStatus] = useState();
  const [orders, setOrders] = useState(allOrders);

  const [formLoading, setFormLoading] = useState(false);

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (formData) => {
    setFormLoading(true);
    try {
      const token = await getUserToken();

      const fetchOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
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

      setFormLoading(false);
    } catch (error) {
      setFormLoading(false);
      toast.error('Failed to filter Orders');
      console.error('Failed to filter Orders', error);
    }
  };

  const filteredOrders = filteredStatus
    ? Array.isArray(orders) &&
      orders?.filter((order) => order.orderStatus === filteredStatus.value)
    : orders;

  if (!orders || orders?.length === 0) {
    return <p className="mt-20 text-center text-gray-600">No orders found</p>;
  }
  return (
    <div className="max-w-full overflow-auto rounded-lg bg-white p-6 shadow-md">
      <h4 className="mb-4 text-xl font-semibold text-gray-800">Order List</h4>

      <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <div className="mb-10 w-full md:mb-4 md:w-72 lg:mb-0">
          <Select
            label="Filter order status"
            options={orderStatuses?.map((status) => ({
              label: status.displayName,
              value: status.name,
            }))}
            value={filteredStatus}
            onChange={setFilteredStatus}
            clearable={filteredStatus !== null}
            onClear={() => setFilteredStatus(null)}
          />
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4"
        >
          <Input
            {...register('start', {
              required: 'Start date is required',
            })}
            className="mb-4 w-full md:mb-0"
            label="Start Date"
            type="date"
            error={errors.start?.message as string}
          />
          <Input
            {...register('end', {
              required: 'End date is required',
            })}
            className="mb-4 w-full md:mb-0"
            label="End Date"
            type="date"
            error={errors.end?.message as string}
          />

          <Button
            isLoading={formLoading}
            className="mt-2 w-full md:mt-7 md:w-80"
            type="submit"
          >
            {' '}
            Filter By Date
          </Button>
          <Button
            title="Clear Filters"
            className="mt-2 w-fit md:mt-7 "
            onClick={() => {
              setOrders(allOrders);
              reset();
            }}
          >
            <MdClose size={24} />
          </Button>
        </form>
      </div>

      {formLoading && (
        <div className="flex items-center justify-center ">
          <SpinnerLoader />
        </div>
      )}
      {!formLoading && (
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
            {Array.isArray(filteredOrders) &&
              filteredOrders?.map((order) => (
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
      )}
    </div>
  );
};
