'use client';

import { PackagePlus } from 'lucide-react';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { Thumb } from '@/components/ui/filters';
import { PageHeader, Panel } from '@/components/ui/panel';
import { EmptyState, ErrorState, ListSkeleton, Skeleton } from '@/components/ui/states';
import { useMerchantId } from '@/lib/auth';
import { cn } from '@/lib/cn';
import { MERCHANT_ORDER_LIMIT, watchMerchantOrders, watchMerchantProducts } from '@/lib/data';
import { formatCount, formatMoney } from '@/lib/format';
import { ORDER_STATUSES, isOrderStatus, isRevenue, linesFor, linesTotal, statusFor, statusLabel } from '@/lib/orders';
import type { Order, OrderStatusValue, Product } from '@/lib/types';
import { useLive } from '@/lib/use-data';
import { OrderRows } from '../orders/order-rows';

export const LOW_STOCK = 5;

const statusColor: Record<string, string> = {
  awaiting_payment: 'bg-thread-300',
  placed: 'bg-brand-900',
  processing: 'bg-brand-700',
  shipped: 'bg-brand-400',
  delivered: 'bg-ok-700',
  cancelled: 'bg-line-strong',
  payment_failed: 'bg-bad-700',
  other: 'bg-line-strong',
};

function Kpis({ orders, products }: { orders: Order[] | null; products: Product[] | null }) {
  const merchantId = useMerchantId();
  const revenue = orders
    ? orders.filter((o) => isRevenue(o, merchantId)).reduce((sum, o) => sum + linesTotal(linesFor(o, merchantId)), 0)
    : null;
  const toFulfil = orders
    ? orders.filter((o) => ['placed', 'processing'].includes(statusFor(o, merchantId) ?? '')).length
    : null;
  const pending = products ? products.filter((p) => p.approvalStatus === 'pending').length : null;
  const live = products ? products.filter((p) => p.isActive && p.approvalStatus === 'approved').length : null;

  // The feed is capped, so past the cap "Earned" stops growing. Say so rather than
  // letting the figure look like the whole story.
  const capped = orders !== null && orders.length >= MERCHANT_ORDER_LIMIT;

  const cells: { label: string; value: string | null; note: string; href?: string }[] = [
    {
      label: 'Earned',
      value: revenue === null ? null : formatMoney(revenue),
      note: capped ? `Your delivered items, latest ${MERCHANT_ORDER_LIMIT} orders` : 'Your delivered items',
    },
    {
      label: 'To fulfil',
      value: toFulfil === null ? null : formatCount(toFulfil),
      note: 'Placed or processing',
      href: '/merchant/orders?status=placed',
    },
    { label: 'Live products', value: live === null ? null : formatCount(live), note: 'Visible to shoppers' },
    {
      label: 'Awaiting approval',
      value: pending === null ? null : formatCount(pending),
      note: 'Reviewed by GUGU staff',
      href: '/merchant/products?filter=pending',
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 overflow-hidden rounded-[var(--radius-panel)] border border-line bg-line shadow-[var(--shadow-panel)] lg:grid-cols-4 [&>*]:bg-surface gap-px">
      {cells.map((c) => {
        const body = (
          <>
            <span className="text-sm font-medium text-ink-muted">{c.label}</span>
            {c.value === null ? (
              <Skeleton className="mt-2 h-8 w-24" />
            ) : (
              <span className="mt-1 block text-[1.5rem] leading-tight font-bold tracking-[-0.02em] text-ink tabular sm:text-[1.75rem]">
                {c.value}
              </span>
            )}
            <span className="mt-1 block text-[0.8125rem] text-ink-subtle">{c.note}</span>
          </>
        );
        return c.href ? (
          <Link key={c.label} href={c.href} className="block px-4 py-4 transition-colors hover:bg-brand-50/60 sm:px-5">
            {body}
          </Link>
        ) : (
          <div key={c.label} className="px-4 py-4 sm:px-5">
            {body}
          </div>
        );
      })}
    </div>
  );
}

function StatusBreakdown({ orders, merchantId }: { orders: Order[]; merchantId: string }) {
  // Statuses this build does not know still have to add up, or the bar and the
  // numbers would silently disagree with the order list.
  const other = orders.filter((o) => !isOrderStatus(statusFor(o, merchantId))).length;
  const counts: { status: OrderStatusValue; count: number }[] = [
    ...ORDER_STATUSES.map((s) => ({
      status: s as OrderStatusValue,
      count: orders.filter((o) => statusFor(o, merchantId) === s).length,
    })),
    { status: 'other', count: other },
  ].filter((c) => c.count > 0);
  const total = orders.length;
  return (
    <div className="px-4 py-4 sm:px-5">
      <div className="flex h-3 overflow-hidden rounded-[3px] bg-line" aria-hidden>
        {counts.map((c) => (
          <span
            key={c.status}
            className={cn('h-full', statusColor[c.status] ?? statusColor.other)}
            style={{ width: `${(c.count / total) * 100}%` }}
          />
        ))}
      </div>
      <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
        {counts.map((c) => (
          <li key={c.status} className="flex items-center justify-between gap-3 text-[0.9375rem]">
            <span className="flex items-center gap-2">
              <span aria-hidden className={cn('size-2.5 rounded-[2px]', statusColor[c.status] ?? statusColor.other)} />
              {c.status === 'other' ? 'Other' : statusLabel(c.status)}
            </span>
            <span className="font-semibold tabular">{formatCount(c.count)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MerchantOverview() {
  const merchantId = useMerchantId();
  const orders = useLive<Order[]>(`m-orders:${merchantId}`, (next, fail) => watchMerchantOrders(merchantId, next, fail));
  const products = useLive<Product[]>(`m-products:${merchantId}`, (next, fail) =>
    watchMerchantProducts(merchantId, next, fail)
  );

  const lowStock =
    products.status === 'ready'
      ? products.data
          .filter((p) => typeof p.stockQuantity === 'number' && p.stockQuantity <= LOW_STOCK)
          .sort((a, b) => (a.stockQuantity ?? 0) - (b.stockQuantity ?? 0))
      : [];

  return (
    <>
      <PageHeader
        title="Overview"
        description="How your store is doing, from your GUGU orders and products."
        actions={
          <ButtonLink href="/merchant/products/new" icon={<PackagePlus aria-hidden />}>
            Add product
          </ButtonLink>
        }
      />

      <Kpis
        orders={orders.status === 'ready' ? orders.data : null}
        products={products.status === 'ready' ? products.data : null}
      />
      {orders.status === 'error' ? (
        <Panel className="mb-6">
          <ErrorState error={orders.error} onRetry={orders.retry} title="Your orders could not be loaded" />
        </Panel>
      ) : null}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel
          title="Recent orders"
          actions={
            orders.status === 'ready' && orders.data.length > 0 ? (
              <Link href="/merchant/orders" className="text-sm font-semibold text-brand-700 hover:underline">
                View all orders
              </Link>
            ) : null
          }
        >
          {orders.status === 'loading' ? <ListSkeleton rows={4} label="Loading orders" /> : null}
          {orders.status === 'error' ? <p className="px-5 py-6 text-ink-muted">Orders are unavailable right now.</p> : null}
          {orders.status === 'ready' && orders.data.length === 0 ? (
            <EmptyState title="No orders yet">
              When a shopper buys one of your approved products, the order appears here and in Orders.
            </EmptyState>
          ) : null}
          {orders.status === 'ready' && orders.data.length > 0 ? (
            <OrderRows orders={orders.data.slice(0, 6)} merchantId={merchantId} base="/merchant/orders" />
          ) : null}
        </Panel>

        <div className="flex flex-col gap-6">
          <Panel title="Orders by status">
            {orders.status === 'loading' ? (
              <div className="p-5">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="mt-4 h-16 w-full" />
              </div>
            ) : null}
            {orders.status === 'ready' && orders.data.length === 0 ? (
              <p className="px-5 py-6 text-[0.9375rem] text-ink-muted">No orders to break down yet.</p>
            ) : null}
            {orders.status === 'ready' && orders.data.length > 0 ? <StatusBreakdown orders={orders.data} merchantId={merchantId} /> : null}
            {orders.status === 'error' ? <p className="px-5 py-6 text-ink-muted">Unavailable.</p> : null}
          </Panel>

          <Panel title="Low stock" description={`Products with ${LOW_STOCK} or fewer left`}>
            {products.status === 'loading' ? <ListSkeleton rows={3} label="Loading products" /> : null}
            {products.status === 'error' ? (
              <ErrorState error={products.error} onRetry={products.retry} title="Products could not be loaded" />
            ) : null}
            {products.status === 'ready' && products.data.length === 0 ? (
              <EmptyState
                title="No products yet"
                action={
                  <ButtonLink href="/merchant/products/new" variant="secondary" size="sm">
                    Add your first product
                  </ButtonLink>
                }
              >
                Products you add are checked by GUGU staff before shoppers can see them.
              </EmptyState>
            ) : null}
            {products.status === 'ready' && products.data.length > 0 && lowStock.length === 0 ? (
              <p className="px-5 py-6 text-[0.9375rem] text-ink-muted">Every product has more than {LOW_STOCK} in stock.</p>
            ) : null}
            {lowStock.length > 0 ? (
              <ul className="divide-y divide-line">
                {lowStock.slice(0, 6).map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/merchant/products/edit?id=${encodeURIComponent(p.id)}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-brand-50/60 sm:px-5"
                    >
                      <Thumb src={p.imageUrls[0]} />
                      <span className="min-w-0 flex-1 truncate font-medium">{p.name}</span>
                      {p.stockQuantity === 0 ? (
                        <StatusBadge status="failed" label="Sold out" />
                      ) : (
                        <span className="text-sm font-semibold text-thread-800 tabular">{p.stockQuantity} left</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </Panel>
        </div>
      </div>
    </>
  );
}
