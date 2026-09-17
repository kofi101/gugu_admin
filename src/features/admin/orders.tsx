'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { FilterTabs, SearchInput } from '@/components/ui/filters';
import { PageHeader, Panel } from '@/components/ui/panel';
import { DataView, EmptyState } from '@/components/ui/states';
import { watchAllOrders } from '@/lib/data';
import { ORDER_STATUSES, STATUS_LABEL } from '@/lib/orders';
import type { Order, OrderStatus, PaymentMethod } from '@/lib/types';
import { useLive } from '@/lib/use-data';
import { OrderDetail } from '../orders/order-detail';
import { OrderRows } from '../orders/order-rows';
import { Select } from '@/components/ui/field';

type StatusFilter = OrderStatus | 'all';
const isStatus = (v: string | null): v is OrderStatus => !!v && (ORDER_STATUSES as string[]).includes(v);

export function AdminOrders() {
  const params = useSearchParams();
  const router = useRouter();
  const raw = params.get('status');
  const status: StatusFilter = isStatus(raw) ? raw : 'all';
  const [term, setTerm] = useState('');
  const [payment, setPayment] = useState<PaymentMethod | 'all'>('all');

  // Status filters server-side (index: orders status+createdAt, collection group).
  const result = useLive<Order[]>(`admin-orders:${status}`, (next, fail) => watchAllOrders(status, next, fail, 300));

  return (
    <>
      <PageHeader title="All orders" description="Every order on GUGU, newest first. Shows the latest 300 for the chosen status." />
      <Panel>
        <div className="flex flex-col gap-3 border-b border-line px-4 py-3 sm:px-5">
          <FilterTabs
            label="Filter by order status"
            value={status}
            onChange={(v) => router.replace(v === 'all' ? '/admin/orders' : `/admin/orders?status=${v}`, { scroll: false })}
            options={[
              { value: 'all', label: 'All' },
              ...ORDER_STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] })),
            ]}
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <SearchInput
              label="Search by order number, customer or phone"
              placeholder="Order number, customer or phone"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="sm:flex-1"
            />
            <label className="sm:w-64">
              <span className="sr-only">Payment method</span>
              <Select value={payment} onChange={(e) => setPayment(e.target.value as PaymentMethod | 'all')} className="min-h-10">
                <option value="all">Any payment method</option>
                <option value="cash_on_delivery">Cash on delivery</option>
                <option value="mobile_money_on_delivery">Mobile money on delivery</option>
                <option value="expresspay">ExpressPay</option>
              </Select>
            </label>
          </div>
        </div>
        <DataView result={result} errorTitle="Orders could not be loaded">
          {(orders) => {
            const q = term.trim().toLowerCase();
            const visible = orders.filter(
              (o) =>
                (payment === 'all' || o.paymentMethod === payment) &&
                (!q ||
                  o.orderNumber.toLowerCase().includes(q) ||
                  (o.shipping?.fullName ?? '').toLowerCase().includes(q) ||
                  (o.shipping?.phone ?? '').includes(q))
            );
            if (orders.length === 0) {
              return (
                <EmptyState title={status === 'all' ? 'No orders yet' : `No ${STATUS_LABEL[status].toLowerCase()} orders`} />
              );
            }
            if (visible.length === 0) return <EmptyState title="No orders match">Clear the search or payment filter.</EmptyState>;
            return <OrderRows orders={visible} merchantId={null} base="/admin/orders" />;
          }}
        </DataView>
      </Panel>
    </>
  );
}

export function AdminOrderDetail() {
  return <OrderDetail merchantId={null} mode="admin" />;
}
