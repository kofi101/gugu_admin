'use client';

import { PiCheckBold } from 'react-icons/pi';
import OrderViewProducts from './order-products/order-view-products';
import { Title, Text } from '@/components/ui/text';
import { formatDate } from '@/utils/format-date';
import cn from '@/utils/class-names';
import { orderDetailsType, OrderStatus } from './order-view.type';

const currentOrderStatus = 1;

function WidgetCard({
  title,
  className,
  children,
  childrenWrapperClass,
}: {
  title?: string;
  className?: string;
  children: React.ReactNode;
  childrenWrapperClass?: string;
}) {
  return (
    <div className={className}>
      <Title
        as="h3"
        className="mb-3.5 text-base font-semibold @5xl:mb-5 4xl:text-lg"
      >
        {title}
      </Title>
      <div
        className={cn(
          'rounded-lg border border-muted px-5 @sm:px-7 @5xl:rounded-xl',
          childrenWrapperClass
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default function OrderView({
  orderData,
  orderStatus,
}: {
  orderData: orderDetailsType;
  orderStatus: OrderStatus;
}) {
  return (
    <div className="@container">
      <div className="flex flex-wrap justify-center border-b border-t border-gray-300 py-4 font-medium text-gray-700 @5xl:justify-start">
        <span className="my-2 border-r border-muted px-5 py-0.5 first:ps-0 last:border-r-0">
          Total Items: {orderData?.paymentDetails?.itemTotal}
        </span>
        <span className="my-2 border-r border-muted px-5 py-0.5 first:ps-0 last:border-r-0">
          Discount: {orderData?.paymentDetails?.discount} %
        </span>
        <span className="my-2 border-r border-muted px-5 py-0.5 first:ps-0 last:border-r-0">
          Delivery Fee GHC: {orderData?.paymentDetails?.deliveryFees}
        </span>
        <span className="my-2 border-r border-muted px-5 py-0.5 first:ps-0 last:border-r-0">
          Total GHC: {orderData?.paymentDetails?.total}
        </span>
      </div>
      <div className="items-start pt-10 @5xl:grid @5xl:grid-cols-12 @5xl:gap-7 @6xl:grid-cols-10 @7xl:gap-10">
        <div className="space-y-7 @5xl:col-span-8 @5xl:space-y-10 @6xl:col-span-7">
          {orderData?.orderDetails?.map((order) => (
            <div key={order.productName} className="pb-5">
              <OrderViewProducts
                items={[
                  {
                    name: order.productName,
                    image: order?.imageOne,
                    price: order?.unitPrice,
                    salePrice: order?.salesPrice,
                    quantity: order?.quantity,
                  },
                ]}
              />
              <div className="border-t border-muted pt-7 @5xl:mt-3">
                <div className="ms-auto max-w-lg space-y-6">
                  <div className="flex justify-between font-medium">
                    Sales Price <span>GHC {order.salesPrice}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    Unit Price <span>GHC {order.unitPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="">
            <div className="mb-3.5 @5xl:mb-5">
              <Title as="h3" className="text-base font-semibold @7xl:text-lg">
                Order Summary
              </Title>
            </div>
            <div className="space-y-6 rounded-xl border border-muted px-5 py-6 @5xl:space-y-7 @5xl:p-7">
              <div className="flex justify-between font-medium">
                Order Number{' '}
                <span>{orderData?.orderSummary?.checkOutOrderNumber}</span>
              </div>
              <div className="flex justify-between font-medium">
                Date{' '}
                <span>
                  {formatDate(
                    orderData?.orderSummary?.transactionDate,
                    'MMMM D, YYYY'
                  )}
                </span>
              </div>
              <div className="flex justify-between font-medium">
                Quantity<span>{orderData?.orderSummary?.quantity}</span>
              </div>
              <div className="flex justify-between font-medium">
                Discount <span> GHC{orderData?.orderSummary?.discount}</span>
              </div>
              <div className="flex justify-between font-medium">
                Shipping Cost{' '}
                <span>GHC{orderData?.orderSummary?.shippingCost}</span>
              </div>
              <div className="flex justify-between font-medium">
                Checkout Total{' '}
                <span>GHC{orderData?.orderSummary?.checkoutTotal}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-7 pt-8 @container @5xl:col-span-4 @5xl:space-y-10 @5xl:pt-0 @6xl:col-span-3">
          <WidgetCard
            title="Order Status"
            childrenWrapperClass="py-5 @5xl:py-8 flex"
          >
            <div className="ms-2 w-full space-y-7 border-s-2 border-gray-100">
              {orderStatus?.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "relative ps-6 text-sm font-medium before:absolute before:-start-[9px] before:top-px before:h-5 before:w-5 before:-translate-x-px before:rounded-full before:bg-gray-100 before:content-[''] after:absolute after:-start-px after:top-5  after:h-10 after:w-0.5  after:content-[''] last:after:hidden",
                    currentOrderStatus > item.id
                      ? 'before:bg-primary after:bg-primary'
                      : 'after:hidden',
                    currentOrderStatus === item.id && 'before:bg-primary'
                  )}
                >
                  {currentOrderStatus >= item.id ? (
                    <span className="absolute -start-1.5 top-1 text-white">
                      <PiCheckBold className="h-auto w-3" />
                    </span>
                  ) : null}

                  {item.displayName}
                </div>
              ))}
            </div>
          </WidgetCard>

          {/* delivery information  */}

          <WidgetCard
            title="Delivery Information"
            childrenWrapperClass="py-5 @5xl:py-8 flex"
          >
            <div className="ps-4 @5xl:ps-6">
              <Title
                as="h3"
                className="mb-2.5 text-base font-semibold @7xl:text-lg"
              >
                {orderData?.deliveryInformation?.address}
              </Title>
              <Text as="p" className="mb-2 last:mb-0">
                {orderData?.deliveryInformation?.digitalAddress}
              </Text>
              <Text as="p" className="mb-2 break-all last:mb-0">
                {orderData?.deliveryInformation?.destination}
              </Text>
              <Text as="p" className="mb-2 break-all last:mb-0">
                {orderData?.deliveryInformation?.region}
              </Text>
            </div>
          </WidgetCard>
        </div>
      </div>
    </div>
  );
}
