'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/badge';
import { formatDateTime, formatMoney } from '@/lib/format';
import { STATUS_LABEL, linesFor, linesTotal, unitsFor } from '@/lib/orders';
import type { Order } from '@/lib/types';

export function orderHref(base: '/merchant/orders' | '/admin/orders', order: Order) {
  return `${base}/view/?u=${encodeURIComponent(order.userId)}&o=${encodeURIComponent(order.id)}`;
}

/**
 * Order rows. With a merchantId, totals and item counts cover only that
 * merchant's lines.
 */
export function OrderRows({
  orders,
  merchantId,
  base,
}: {
  orders: Order[];
  merchantId: string | null;
  base: '/merchant/orders' | '/admin/orders';
}) {
  return (
    <ul className="divide-y divide-line">
      {orders.map((order) => {
        const lines = linesFor(order, merchantId);
        const units = unitsFor(lines);
        const total = merchantId ? linesTotal(lines) : order.orderTotal;
        return (
          <li key={`${order.userId}/${order.id}`}>
            <Link
              href={orderHref(base, order)}
              className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-4 py-3.5 transition-colors duration-150 hover:bg-brand-50/60 focus-visible:-outline-offset-2 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto_auto] sm:px-5"
            >
              <span className="min-w-0">
                <span className="block truncate font-semibold text-ink tabular">{order.orderNumber}</span>
                <span className="block truncate text-sm text-ink-muted">
                  {order.shipping?.fullName || 'Customer'}, {formatDateTime(order.createdAt)}
                </span>
              </span>
              <span className="order-3 col-span-1 text-sm text-ink-muted sm:order-none">
                {units} {units === 1 ? 'item' : 'items'}
                {order.shipping?.city ? `, to ${order.shipping.city}` : ''}
              </span>
              <span className="order-4 justify-self-end sm:order-none">
                <StatusBadge status={order.status} label={STATUS_LABEL[order.status]} />
              </span>
              <span className="flex items-center justify-end gap-2 font-semibold text-ink tabular">
                {formatMoney(total)}
                <ChevronRight
                  className="hidden size-4 text-ink-subtle transition-transform duration-150 group-hover:translate-x-0.5 sm:block"
                  aria-hidden
                />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
