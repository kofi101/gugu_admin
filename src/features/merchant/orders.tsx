'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { FilterTabs, SearchInput } from '@/components/ui/filters';
import { PageHeader, Panel } from '@/components/ui/panel';
import { DataView, EmptyState } from '@/components/ui/states';
import { useMerchantId } from '@/lib/auth';
import { watchMerchantOrders } from '@/lib/data';
import { statusFor } from '@/lib/orders';
import type { Order, OrderStatus } from '@/lib/types';
import { useLive } from '@/lib/use-data';
import { OrderDetail } from '../orders/order-detail';
import { OrderRows } from '../orders/order-rows';

type Filter = 'open' | 'placed' | 'processing' | 'shipped' | 'delivered' | 'closed' | 'all';

const matches: Record<Filter, (s: OrderStatus) => boolean> = {
  open: (s) => s === 'placed' || s === 'processing' || s === 'shipped' || s === 'awaiting_payment',
  placed: (s) => s === 'placed',
  processing: (s) => s === 'processing',
  shipped: (s) => s === 'shipped',
  delivered: (s) => s === 'delivered',
  closed: (s) => s === 'cancelled' || s === 'payment_failed',
  all: () => true,
};

const isFilter = (v: string | null): v is Filter => !!v && v in matches;

export function MerchantOrders() {
  const merchantId = useMerchantId();
  const params = useSearchParams();
  const router = useRouter();
  const initial = params.get('status');
  const filter: Filter = isFilter(initial) ? initial : 'open';
  const [term, setTerm] = useState('');

  const result = useLive<Order[]>(`m-orders:${merchantId}`, (next, fail) => watchMerchantOrders(merchantId, next, fail));

  const setFilter = (f: Filter) => router.replace(`/merchant/orders?status=${f}`, { scroll: false });

  return (
    <>
      <PageHeader title="Orders" description="Orders that include your products. Open one to move it along." />
      <Panel>
        <div className="flex flex-col gap-3 border-b border-line px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <FilterTabs
            label="Filter orders by status"
            value={filter}
            onChange={setFilter}
            options={(
              [
                ['open', 'Open'],
                ['placed', 'Placed'],
                ['processing', 'Processing'],
                ['shipped', 'Shipped'],
                ['delivered', 'Delivered'],
                ['closed', 'Cancelled'],
                ['all', 'All'],
              ] as [Filter, string][]
            ).map(([value, label]) => ({
              value,
              label,
              count:
                result.status === 'ready'
                  ? result.data.filter((o) => matches[value](statusFor(o, merchantId))).length
                  : undefined,
            }))}
          />
          <SearchInput
            label="Search by order number or customer"
            placeholder="Order number or customer"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="lg:w-72"
          />
        </div>
        <DataView result={result} errorTitle="Your orders could not be loaded">
          {(orders) => {
            if (orders.length === 0) {
              return (
                <EmptyState title="No orders yet">
                  Orders appear here as soon as a shopper buys one of your approved products.
                </EmptyState>
              );
            }
            const q = term.trim().toLowerCase();
            const visible = orders.filter(
              (o) =>
                matches[filter](statusFor(o, merchantId)) &&
                (!q || o.orderNumber.toLowerCase().includes(q) || (o.shipping?.fullName ?? '').toLowerCase().includes(q))
            );
            if (visible.length === 0) {
              return (
                <EmptyState title="No orders match">
                  Try another status{q ? ' or clear the search' : ''}.
                </EmptyState>
              );
            }
            return <OrderRows orders={visible} merchantId={merchantId} base="/merchant/orders" />;
          }}
        </DataView>
      </Panel>
    </>
  );
}

export function MerchantOrderDetail() {
  const merchantId = useMerchantId();
  return <OrderDetail merchantId={merchantId} mode="merchant" />;
}
