'use client';

import { collection, collectionGroup, getCountFromServer, query, where } from 'firebase/firestore';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { PageHeader, Panel } from '@/components/ui/panel';
import { EmptyState, ErrorState, ListSkeleton, Skeleton } from '@/components/ui/states';
import { watchAllOrders } from '@/lib/data';
import { firebase } from '@/lib/firebase';
import { formatCount } from '@/lib/format';
import type { Order } from '@/lib/types';
import { useAsync, useLive } from '@/lib/use-data';
import { OrderRows } from '../orders/order-rows';

async function loadCounts() {
  const { db } = firebase();
  const count = async (q: Parameters<typeof getCountFromServer>[0]) => (await getCountFromServer(q)).data().count;
  const [applications, products, placed, processing] = await Promise.all([
    count(query(collection(db, 'merchant_applications'), where('status', '==', 'pending'))),
    count(query(collection(db, 'products'), where('approvalStatus', '==', 'pending'))),
    count(query(collectionGroup(db, 'orders'), where('status', '==', 'placed'))),
    count(query(collectionGroup(db, 'orders'), where('status', '==', 'processing'))),
  ]);
  return { applications, products, placed, processing };
}

export function AdminOverview() {
  const counts = useAsync('admin-counts', loadCounts);
  const recent = useLive<Order[]>('admin-recent-orders', (next, fail) => watchAllOrders('all', next, fail, 8));

  const queues = [
    {
      label: 'Seller applications to review',
      value: counts.status === 'ready' ? counts.data.applications : null,
      href: '/admin/applications',
    },
    { label: 'Products awaiting approval', value: counts.status === 'ready' ? counts.data.products : null, href: '/admin/products' },
    { label: 'Orders not yet processing', value: counts.status === 'ready' ? counts.data.placed : null, href: '/admin/orders?status=placed' },
    { label: 'Orders being processed', value: counts.status === 'ready' ? counts.data.processing : null, href: '/admin/orders?status=processing' },
  ];

  return (
    <>
      <PageHeader title="Overview" description="What needs GUGU staff attention right now." />
      <Panel title="Queues" className="mb-6">
        {counts.status === 'error' ? (
          <ErrorState error={counts.error} onRetry={counts.retry} title="Queue counts could not be loaded" />
        ) : (
          <ul className="divide-y divide-line">
            {queues.map((q) => (
              <li key={q.href}>
                <Link href={q.href} className="group flex min-h-14 items-center gap-4 px-4 py-3 hover:bg-brand-50/60 sm:px-5">
                  <span className="flex-1 text-[0.9375rem] font-medium">{q.label}</span>
                  {q.value === null ? (
                    <Skeleton className="h-6 w-10" />
                  ) : (
                    <span
                      className={
                        q.value > 0
                          ? 'min-w-10 rounded-full bg-brand-900 px-2.5 py-0.5 text-center font-bold text-white tabular'
                          : 'min-w-10 px-2.5 text-center font-semibold text-ink-subtle tabular'
                      }
                    >
                      {formatCount(q.value)}
                    </span>
                  )}
                  <ChevronRight className="size-4 text-ink-subtle group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Panel
        title="Latest orders"
        actions={
          <Link href="/admin/orders" className="text-sm font-semibold text-brand-700 hover:underline">
            View all orders
          </Link>
        }
      >
        {recent.status === 'loading' ? <ListSkeleton rows={4} label="Loading orders" /> : null}
        {recent.status === 'error' ? (
          <ErrorState error={recent.error} onRetry={recent.retry} title="Orders could not be loaded" />
        ) : null}
        {recent.status === 'ready' && recent.data.length === 0 ? (
          <EmptyState title="No orders yet">Orders placed in the app or on the web appear here.</EmptyState>
        ) : null}
        {recent.status === 'ready' && recent.data.length > 0 ? (
          <OrderRows orders={recent.data} merchantId={null} base="/admin/orders" />
        ) : null}
      </Panel>
    </>
  );
}
