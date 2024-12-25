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

export const OrdersManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit } = useForm();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchUtil(`${managementUrl}/orders`);
      setOrders(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error fetching orders:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const token = await getUserToken();
      await fetchUtil(`${managementUrl}/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      toast.success('Order status updated successfully');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
      console.error('Error updating order status:', error);
    }
  };

  const processRefund = async (orderId: string) => {
    try {
      const token = await getUserToken();
      await fetchUtil(`${managementUrl}/orders/${orderId}/refund`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      toast.success('Refund processed successfully');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to process refund');
      console.error('Error processing refund:', error);
    }
  };

  const handleCancellation = async (orderId: string) => {
    try {
      const token = await getUserToken();
      await fetchUtil(`${managementUrl}/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      toast.success('Order cancelled successfully');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to cancel order');
      console.error('Error cancelling order:', error);
    }
  };

  if (loading) {
    return <SpinnerLoader />;
  }

  return (
    <div className="w-full rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-6 text-xl font-bold">Orders Management</h2>
      <ul className="space-y-4">
        {(orders.length > 0 || dummy).map((order) => (
          <li
            key={order.orderId}
            className="flex items-center justify-between rounded-lg bg-gray-100 p-4 shadow-sm"
          >
            <div>
              <p className="font-semibold">Order ID: {order.orderId}</p>
              <p>Customer: {order.customerName}</p>
              <p>
                Order Date: {new Date(order.orderDate).toLocaleDateString()}
              </p>
              <p>Total Amount: ${order.totalAmount}</p>
              <p>Status: {order.orderStatus}</p>
              {order.refundStatus && <p>Refund Status: {order.refundStatus}</p>}
            </div>
            <div className="flex gap-4">
              <Controller
                name="orderStatus"
                control={control}
                defaultValue={order.orderStatus}
                render={({ field: { onChange, value } }) => (
                  <Select
                    options={orderStatusOptions}
                    value={value}
                    onChange={(value) => {
                      onChange(value);
                      updateOrderStatus(order.orderId, value);
                    }}
                    label="Update Status"
                    className="w-40"
                  />
                )}
              />
              <Button
                onClick={() => processRefund(order.orderId)}
                variant="outline"
                size="sm"
              >
                Process Refund
              </Button>
              <Button
                onClick={() => handleCancellation(order.orderId)}
                variant="outline"
                size="sm"
              >
                Cancel Order
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const dummy = [
  {
    orderId: 'ORD001',
    customerName: 'John Doe',
    orderDate: '2024-08-01T10:30:00Z',
    orderStatus: 'Pending',
    totalAmount: 250.99,
    refundStatus: null,
  },
  {
    orderId: 'ORD002',
    customerName: 'Jane Smith',
    orderDate: '2024-08-02T12:45:00Z',
    orderStatus: 'Shipped',
    totalAmount: 150.0,
    refundStatus: null,
  },
  {
    orderId: 'ORD003',
    customerName: 'Michael Brown',
    orderDate: '2024-08-03T14:00:00Z',
    orderStatus: 'Delivered',
    totalAmount: 99.99,
    refundStatus: 'Refunded',
  },
  {
    orderId: 'ORD004',
    customerName: 'Emily Johnson',
    orderDate: '2024-08-04T16:15:00Z',
    orderStatus: 'Processed',
    totalAmount: 349.5,
    refundStatus: null,
  },
  {
    orderId: 'ORD005',
    customerName: 'David Wilson',
    orderDate: '2024-08-05T09:00:00Z',
    orderStatus: 'Cancelled',
    totalAmount: 220.75,
    refundStatus: null,
  },
];
