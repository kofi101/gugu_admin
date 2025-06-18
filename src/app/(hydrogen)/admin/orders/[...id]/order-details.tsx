'use client';

import React from 'react';

import Image from 'next/image';
import { OrderDetailsProps } from './order-details.types';
import { ProcessOrder } from './process-order';

const OrderDetails: React.FC<OrderDetailsProps> = ({
  order,
  orderStatuses,
}) => {
  const currentOrderStatusNumber = orderStatuses?.find(
    (status: { name: string }) =>
      status.name === order?.orderSummary?.checkOutStatus
  )?.id;

  return (
    <div className="w-full rounded-lg border bg-white p-6 shadow-md">
      {/* Order Summary */}
      <div className="flex w-full justify-between">
        <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>

        <ProcessOrder
          orderStatusNumber={currentOrderStatusNumber}
          orderStatuses={orderStatuses}
          orderNumber={order?.orderSummary.checkOutOrderNumber}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <p>
          <strong>Order #:</strong> {order?.orderSummary.checkOutOrderNumber}
        </p>
        <p>
          <strong>Date:</strong>{' '}
          {new Date(order?.orderSummary.transactionDate).toLocaleDateString()}
        </p>
        <p>
          <strong>Status:</strong> {order?.orderSummary.checkOutStatus}
        </p>
        <p>
          <strong>Total Items:</strong> {order?.orderSummary.quantity}
        </p>
        <p>
          <strong>Discount:</strong> GHC{' '}
          {order?.orderSummary.discount.toFixed(2)}
        </p>
        <p>
          <strong>Shipping Cost:</strong> GHC
          {order?.orderSummary.shippingCost.toFixed(2)}
        </p>
        <p className="col-span-2">
          <strong>Checkout Total:</strong> GHC
          {order?.orderSummary.checkoutTotal.toFixed(2)}
        </p>
      </div>

      <hr className="my-4" />

      {/* Payment Details */}
      <h2 className="mb-4 text-xl font-semibold">Payment Details</h2>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <p>
          <strong>Item Total:</strong> GHC
          {order?.paymentDetails.itemTotal.toFixed(2)}
        </p>
        <p>
          <strong>Delivery Fees:</strong> GHC
          {order?.paymentDetails.deliveryFees.toFixed(2)}
        </p>
        <p>
          <strong>Discount:</strong> GHC{' '}
          {order?.paymentDetails.discount.toFixed(2)}
        </p>
        <p className="col-span-2">
          <strong>Total:</strong> GHC {order?.paymentDetails.total.toFixed(2)}
        </p>
      </div>

      <hr className="my-4" />

      {/* Order Items */}
      <h2 className="mb-4 text-xl font-semibold">Order Items</h2>
      <div className="space-y-4">
        {order.orderDetails.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-4 rounded-lg border p-3 shadow-sm"
          >
            <div className="relative h-20 w-20">
              <Image
                src={item.imageOne}
                alt={item.productName}
                className="rounded object-cover"
                fill
              />
            </div>
            <div className="flex-1 text-sm">
              <p>
                <strong>Product:</strong> {item.productName} ({item.brand})
              </p>
              <p>
                <strong>Merchant:</strong> {item.merchant}
              </p>
              <p>
                <strong>Quantity:</strong> {item.quantity}
              </p>
              <p>
                <strong>Unit Price:</strong> GHC {item.unitPrice.toFixed(2)}
              </p>
              <p>
                <strong>Sales Price:</strong> GHC {item.salesPrice.toFixed(2)}
              </p>
              <p>
                <strong>Discount:</strong> GHC {item.discount.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <hr className="my-4" />

      {/* Delivery Information */}
      <h2 className="mb-4 text-xl font-semibold">Delivery Information</h2>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <p>
          <strong>Address:</strong> {order.deliveryInformation.address}
        </p>
        <p>
          <strong>Digital Address:</strong>{' '}
          {order.deliveryInformation.digitalAddress}
        </p>
        <p>
          <strong>Region:</strong> {order.deliveryInformation.region}
        </p>
        <p>
          <strong>Destination:</strong> {order.deliveryInformation.destination}
        </p>
      </div>
    </div>
  );
};

export default OrderDetails;
