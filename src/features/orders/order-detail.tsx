'use client';

import { AlertTriangle, ArrowLeft, Ban, PackageCheck } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/dialog';
import { Thumb } from '@/components/ui/filters';
import { DefinitionList, PageHeader, Panel } from '@/components/ui/panel';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { cancelOrder, updateOrderStatus, watchOrder } from '@/lib/data';
import { formatDateTime, formatMoney, humanize } from '@/lib/format';
import { mutate } from '@/lib/notify';
import {
  ADMIN_CANCELLABLE,
  NEXT_ACTION_LABEL,
  merchantCanCancel,
  nextStatusFor,
  statusFor,
  STATUS_LABEL,
  linesFor,
  linesTotal,
} from '@/lib/orders';
import type { Order } from '@/lib/types';
import { useLive } from '@/lib/use-data';
import { StatusStrip } from './status-strip';

const PAYMENT_LABEL: Record<string, string> = {
  cash_on_delivery: 'Cash on delivery',
  mobile_money_on_delivery: 'Mobile money on delivery',
  expresspay: 'ExpressPay (online)',
};

function BackLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-9 items-center gap-1.5 rounded text-sm font-semibold text-brand-700 hover:underline"
    >
      <ArrowLeft className="size-4" aria-hidden />
      All orders
    </Link>
  );
}

function DetailSkeleton() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading order…</span>
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-8 h-24 w-full rounded-xl" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

export function OrderDetail({ merchantId, mode }: { merchantId: string | null; mode: 'merchant' | 'admin' }) {
  const params = useSearchParams();
  const userId = params.get('u') ?? '';
  const orderId = params.get('o') ?? '';
  const valid = Boolean(userId && orderId);
  const listHref = mode === 'merchant' ? '/merchant/orders' : '/admin/orders';

  const result = useLive<Order | null>(valid ? `order:${userId}/${orderId}` : null, (next, fail) =>
    watchOrder(userId, orderId, next, fail)
  );
  const [dialog, setDialog] = useState<'advance' | 'cancel' | null>(null);

  if (!valid) {
    return (
      <>
        <PageHeader title="Order not found" back={<BackLink href={listHref} />} />
        <Panel>
          <EmptyState title="This link is incomplete">Open the order again from your order list.</EmptyState>
        </Panel>
      </>
    );
  }
  if (result.status === 'loading') return <DetailSkeleton />;
  if (result.status === 'error') {
    return (
      <>
        <PageHeader title="Order" back={<BackLink href={listHref} />} />
        <Panel>
          <ErrorState error={result.error} onRetry={result.retry} title="This order could not be loaded" />
        </Panel>
      </>
    );
  }

  const order = result.data;
  if (!order || (merchantId && !order.merchantIds.includes(merchantId))) {
    return (
      <>
        <PageHeader title="Order not found" back={<BackLink href={listHref} />} />
        <Panel>
          <EmptyState title="There is no order here for your store">
            It may have been removed, or it does not include any of your products.
          </EmptyState>
        </Panel>
      </>
    );
  }

  const lines = linesFor(order, merchantId);
  const otherSellerLines = merchantId ? order.lines.length - lines.length : 0;
  const yourTotal = linesTotal(lines);
  // Merchants see and move only their own fulfilment entry; admins act on the whole order.
  const shown = statusFor(order, merchantId);
  const next = nextStatusFor(order, merchantId);
  const canCancel =
    mode === 'admin' ? ADMIN_CANCELLABLE.includes(order.status) : merchantId ? merchantCanCancel(order, merchantId) : false;
  const fulfilmentEntries = mode === 'admin' && order.fulfilment ? Object.entries(order.fulfilment) : [];
  const ownHistory = merchantId ? order.fulfilment?.[merchantId]?.history : undefined;
  const history = ownHistory?.length ? ownHistory : (order.statusHistory ?? []);
  const ship = order.shipping ?? {};
  const address = [ship.line1, ship.line2, ship.city, ship.region, ship.postalCode].filter(Boolean).join(', ');

  return (
    <>
      <PageHeader
        back={<BackLink href={listHref} />}
        title={<span className="tabular">Order {order.orderNumber}</span>}
        description={`Placed ${formatDateTime(order.createdAt)}`}
        actions={
          <>
            <StatusBadge status={shown} label={STATUS_LABEL[shown]} />
            {canCancel ? (
              <Button variant="quiet-danger" icon={<Ban aria-hidden />} onClick={() => setDialog('cancel')}>
                Cancel order
              </Button>
            ) : null}
            {next ? (
              <Button icon={<PackageCheck aria-hidden />} onClick={() => setDialog('advance')}>
                {NEXT_ACTION_LABEL[shown]}
              </Button>
            ) : null}
          </>
        }
      />

      <Panel className="mb-6" bodyClassName="px-4 py-5 sm:px-5">
        <StatusStrip status={shown} />
        {merchantId && order.merchantIds.length > 1 && shown !== order.status ? (
          <p className="mt-3 text-sm text-ink-muted">
            Your part is {STATUS_LABEL[shown].toLowerCase()}. The whole order shows as{' '}
            {STATUS_LABEL[order.status].toLowerCase()} until every seller catches up.
          </p>
        ) : null}
        {fulfilmentEntries.length > 1 ? (
          <ul className="mt-4 grid gap-1.5 text-[0.9375rem] sm:grid-cols-2" aria-label="Fulfilment by seller">
            {fulfilmentEntries.map(([m, e]) => (
              <li key={m} className="flex items-center justify-between gap-3 rounded-md bg-ground px-3 py-1.5">
                <code className="truncate text-sm">{m}</code>
                <StatusBadge status={e.status} label={STATUS_LABEL[e.status] ?? e.status} />
              </li>
            ))}
          </ul>
        ) : null}
        {order.status === 'awaiting_payment' ? (
          <p className="mt-3 text-sm text-ink-muted">
            Wait for the customer&apos;s online payment to clear before preparing this order.
          </p>
        ) : null}
        {order.cancelReason ? (
          <p className="mt-3 text-[0.9375rem]">
            <span className="font-semibold">Cancellation reason:</span> {order.cancelReason}
          </p>
        ) : null}
        {mode === 'admin' && (order.refundRequired || order.paymentReviewRequired) ? (
          <ul className="mt-4 flex flex-col gap-2">
            {order.refundRequired ? (
              <li className="flex items-start gap-2 rounded-lg border border-bad-700/25 bg-bad-50 px-3 py-2.5 text-[0.9375rem] text-bad-700">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  <strong className="font-semibold">Refund required.</strong> This order was paid and then cancelled.
                  Refund the customer through ExpressPay.
                </span>
              </li>
            ) : null}
            {order.paymentReviewRequired ? (
              <li className="flex items-start gap-2 rounded-lg border border-thread-300 bg-thread-50 px-3 py-2.5 text-[0.9375rem] text-thread-800">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  <strong className="font-semibold">Check this payment.</strong> ExpressPay reported a different amount or
                  currency, or the payment arrived after the order closed.
                </span>
              </li>
            ) : null}
          </ul>
        ) : null}
      </Panel>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel
          title={merchantId ? 'Your items in this order' : 'Items'}
          description={
            otherSellerLines > 0
              ? `This order also has ${otherSellerLines} ${otherSellerLines === 1 ? 'item' : 'items'} from other sellers, handled by them.`
              : undefined
          }
        >
          <ul className="divide-y divide-line">
            {lines.map((line, i) => (
              <li key={`${line.productId}-${i}`} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                <Thumb src={line.imageUrl} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{line.name}</p>
                  <p className="text-sm text-ink-muted tabular">
                    {line.quantity} × {formatMoney(line.unitPrice)}
                  </p>
                </div>
                <p className="font-semibold tabular">{formatMoney(line.lineTotal)}</p>
              </li>
            ))}
          </ul>
          <dl className="border-t border-line bg-ground/50 px-4 py-3 text-[0.9375rem] sm:px-5">
            {merchantId ? (
              <div className="flex justify-between gap-4 font-semibold">
                <dt>Your items total</dt>
                <dd className="tabular">{formatMoney(yourTotal)}</dd>
              </div>
            ) : (
              <>
                <div className="flex justify-between gap-4 text-ink-muted">
                  <dt>Subtotal</dt>
                  <dd className="tabular">{formatMoney(order.subtotal)}</dd>
                </div>
                <div className="flex justify-between gap-4 text-ink-muted">
                  <dt>Delivery</dt>
                  <dd className="tabular">{formatMoney(order.shippingFee)}</dd>
                </div>
                {order.discount ? (
                  <div className="flex justify-between gap-4 text-ink-muted">
                    <dt>Discount</dt>
                    <dd className="tabular">−{formatMoney(order.discount)}</dd>
                  </div>
                ) : null}
                <div className="mt-1 flex justify-between gap-4 font-semibold">
                  <dt>Order total</dt>
                  <dd className="tabular">{formatMoney(order.orderTotal)}</dd>
                </div>
              </>
            )}
          </dl>
        </Panel>

        <div className="flex flex-col gap-6">
          <Panel title="Deliver to" bodyClassName="px-4 py-4 sm:px-5">
            <DefinitionList
              items={[
                { label: 'Name', value: ship.fullName || '—' },
                {
                  label: 'Phone',
                  value: ship.phone ? (
                    <a className="font-medium text-brand-700 underline-offset-4 hover:underline" href={`tel:${ship.phone}`}>
                      {ship.phone}
                    </a>
                  ) : (
                    '—'
                  ),
                },
                { label: 'Address', value: address || '—' },
              ]}
            />
          </Panel>
          <Panel title="Payment" bodyClassName="px-4 py-4 sm:px-5">
            <DefinitionList
              items={[
                { label: 'Method', value: PAYMENT_LABEL[order.paymentMethod] ?? humanize(order.paymentMethod) },
                { label: 'Status', value: <StatusBadge status={order.paymentStatus} /> },
              ]}
            />
          </Panel>
          {history.length > 0 ? (
            <Panel title="History" bodyClassName="px-4 py-4 sm:px-5">
              <ol className="flex flex-col gap-3">
                {[...history].reverse().map((h, i) => (
                  <li key={i} className="flex items-baseline justify-between gap-4 text-[0.9375rem]">
                    <span className="font-medium">{STATUS_LABEL[h.status] ?? humanize(h.status)}</span>
                    <span className="text-sm text-ink-muted">{formatDateTime(h.at)}</span>
                  </li>
                ))}
              </ol>
            </Panel>
          ) : null}
        </div>
      </div>

      {next ? (
        <ConfirmDialog
          open={dialog === 'advance'}
          onClose={() => setDialog(null)}
          tone="primary"
          title={`${NEXT_ACTION_LABEL[shown]}?`}
          description={
            <>
              {merchantId ? 'Your part of order' : 'Order'} {order.orderNumber} goes from {STATUS_LABEL[shown].toLowerCase()}{' '}
              to <strong className="font-semibold text-ink">{STATUS_LABEL[next].toLowerCase()}</strong>. Orders only move
              forward, so this cannot be undone.
            </>
          }
          confirmLabel={NEXT_ACTION_LABEL[shown] ?? 'Update'}
          onConfirm={() =>
            mutate(() => updateOrderStatus({ userId: order.userId, orderId: order.id, status: next }), {
              success: `Order ${order.orderNumber} marked ${STATUS_LABEL[next].toLowerCase()}.`,
              error: 'Status not updated.',
            })
          }
        />
      ) : null}
      {canCancel ? (
        <ConfirmDialog
          open={dialog === 'cancel'}
          onClose={() => setDialog(null)}
          title={`Cancel order ${order.orderNumber}?`}
          description="The items go back into stock and the order is closed. This cannot be undone."
          confirmLabel="Cancel order"
          withNote
          noteLabel="Reason"
          onConfirm={(reason) =>
            mutate(() => cancelOrder({ orderId: order.id, userId: order.userId, reason: reason || undefined }), {
              success: `Order ${order.orderNumber} cancelled.`,
              error: 'Order not cancelled.',
            })
          }
        />
      ) : null}
    </>
  );
}
