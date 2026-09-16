import type { Order, OrderLine, OrderStatus } from './types';

export const ORDER_STATUSES: OrderStatus[] = [
  'awaiting_payment',
  'placed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'payment_failed',
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  awaiting_payment: 'Awaiting payment',
  placed: 'Placed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  payment_failed: 'Payment failed',
};

export function historyLabel(status: string): string {
  if (status === 'partially_cancelled') return 'Partly cancelled';
  return STATUS_LABEL[status as OrderStatus] ?? status;
}

/** The fulfilment path shown as a woven strip. */
export const FULFILMENT_STEPS: OrderStatus[] = ['placed', 'processing', 'shipped', 'delivered'];

/** Forward-only transitions a merchant or admin may request via updateOrderStatus. */
export const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  placed: 'processing',
  processing: 'shipped',
  shipped: 'delivered',
};

export const NEXT_ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  placed: 'Start processing',
  processing: 'Mark as shipped',
  shipped: 'Mark as delivered',
};

export const ADMIN_CANCELLABLE: OrderStatus[] = ['awaiting_payment', 'placed', 'processing', 'shipped'];

const FULFILLING: OrderStatus[] = ['placed', 'processing', 'shipped'];

/**
 * The status a merchant sees: its own `fulfilment[merchantId]` entry while the
 * order is in fulfilment or delivered, otherwise the order status (awaiting
 * payment, cancelled, payment failed).
 */
export function statusFor(order: Order, merchantId: string | null): OrderStatus {
  if (!merchantId) return order.status;
  if (!FULFILLING.includes(order.status) && order.status !== 'delivered') return order.status;
  return order.fulfilment?.[merchantId]?.status ?? order.status;
}

/** Next step this viewer may request, or null. Only offered while the order is in fulfilment. */
export function nextStatusFor(order: Order, merchantId: string | null): OrderStatus | null {
  if (!FULFILLING.includes(order.status)) return null;
  return NEXT_STATUS[statusFor(order, merchantId)] ?? null;
}

/** Merchants may cancel placed/processing orders that contain only their own lines. */
export function merchantCanCancel(order: Order, merchantId: string): boolean {
  return (
    (order.status === 'placed' || order.status === 'processing') &&
    order.merchantIds.length === 1 &&
    order.merchantIds[0] === merchantId
  );
}

export type CancelPreview = {
  /** Merchants whose parts will be cancelled (everything not yet delivered). */
  merchantIds: string[];
  lines: OrderLine[];
  /** Delivered parts that stay as they are. */
  keptMerchantIds: string[];
  /** What becomes refundable if the order was paid; null when unpaid. */
  refund: number | null;
};

/** Mirrors the backend cancel: undelivered parts are cancelled, delivered parts are kept. */
export function cancelPreview(order: Order): CancelPreview {
  if (order.status === 'awaiting_payment') {
    return { merchantIds: order.merchantIds, lines: order.lines, keptMerchantIds: [], refund: null };
  }
  const entries = order.fulfilment ?? {};
  const merchantIds = order.merchantIds.filter((m) => {
    const s = entries[m]?.status;
    return s !== 'delivered' && s !== 'cancelled';
  });
  const keptMerchantIds = order.merchantIds.filter((m) => entries[m]?.status === 'delivered');
  const lines = order.lines.filter((l) => merchantIds.includes(l.merchantId));
  const refund =
    order.paymentStatus === 'paid'
      ? linesTotal(lines) + (keptMerchantIds.length === 0 ? Number(order.shippingFee) || 0 : 0)
      : null;
  return { merchantIds, lines, keptMerchantIds, refund };
}

export function linesFor(order: Order, merchantId: string | null): OrderLine[] {
  return merchantId ? order.lines.filter((l) => l.merchantId === merchantId) : order.lines;
}

export function linesTotal(lines: OrderLine[]): number {
  return Math.round(lines.reduce((sum, l) => sum + (Number(l.lineTotal) || Number(l.unitPrice) * Number(l.quantity) || 0), 0) * 100) / 100;
}

/**
 * Revenue counts money actually earned: paid orders, or (for a merchant) orders
 * where its own lines were delivered on a pay-on-delivery order.
 */
export function isRevenue(order: Order, merchantId: string | null = null): boolean {
  if (order.status === 'cancelled' || order.status === 'payment_failed') return false;
  if (statusFor(order, merchantId) === 'cancelled') return false;
  return order.paymentStatus === 'paid' || statusFor(order, merchantId) === 'delivered';
}

export function unitsFor(lines: OrderLine[]): number {
  return lines.reduce((n, l) => n + (Number(l.quantity) || 0), 0);
}
