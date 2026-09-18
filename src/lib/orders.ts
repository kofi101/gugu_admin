import { humanize } from './format';
import type { Order, OrderLine, OrderStatus, OrderStatusValue } from './types';

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

/** True only for the seven statuses this build understands. */
export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === 'string' && (ORDER_STATUSES as string[]).includes(value);
}

/**
 * Total label lookup. A legacy or unexpected value reads back as itself
 * ("Awaiting pickup") instead of throwing on `STATUS_LABEL[status].toLowerCase()`.
 */
export function statusLabel(status: OrderStatusValue | null | undefined): string {
  if (typeof status !== 'string' || !status) return 'Unknown';
  return isOrderStatus(status) ? STATUS_LABEL[status] : humanize(status);
}

export function historyLabel(status: OrderStatusValue): string {
  if (status === 'partially_cancelled') return 'Partly cancelled';
  return statusLabel(status);
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

/** The order as a whole is being fulfilled (an unknown status never is). */
export function isFulfilling(status: OrderStatusValue): boolean {
  return (FULFILLING as string[]).includes(status);
}

/** The step this status may move to, or null. Unknown values never move. */
export function nextStatus(status: OrderStatusValue): OrderStatus | null {
  return isOrderStatus(status) ? (NEXT_STATUS[status] ?? null) : null;
}

/** Button text for `nextStatus`, or null when there is no next step. */
export function nextActionLabel(status: OrderStatusValue): string | null {
  return isOrderStatus(status) ? (NEXT_ACTION_LABEL[status] ?? null) : null;
}

/** Admins may cancel an order that has not been delivered or closed. */
export function adminCanCancel(order: Order): boolean {
  return (ADMIN_CANCELLABLE as string[]).includes(order.status);
}

/**
 * The status a merchant sees: its own `fulfilment[merchantId]` entry while the
 * order is in fulfilment or delivered, otherwise the order status (awaiting
 * payment, cancelled, payment failed).
 */
export function statusFor(order: Order, merchantId: string | null): OrderStatusValue {
  if (!merchantId) return order.status;
  if (!isFulfilling(order.status) && order.status !== 'delivered') return order.status;
  return order.fulfilment?.[merchantId]?.status ?? order.status;
}

/** Next step this viewer may request, or null. Only offered while the order is in fulfilment. */
export function nextStatusFor(order: Order, merchantId: string | null): OrderStatus | null {
  if (!isFulfilling(order.status)) return null;
  return nextStatus(statusFor(order, merchantId));
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
  /** GHS removed from what the customer owes. */
  cancelledAmount: number;
};

/** Mirrors the backend cancel: undelivered parts are cancelled, delivered parts are kept. */
export function cancelPreview(order: Order): CancelPreview {
  if (order.status === 'awaiting_payment') {
    return {
      merchantIds: order.merchantIds,
      lines: order.lines,
      keptMerchantIds: [],
      refund: null,
      cancelledAmount: Number(order.orderTotal) || 0,
    };
  }
  const entries = order.fulfilment ?? {};
  const merchantIds = order.merchantIds.filter((m) => {
    const s = entries[m]?.status;
    return s !== 'delivered' && s !== 'cancelled';
  });
  const keptMerchantIds = order.merchantIds.filter((m) => entries[m]?.status === 'delivered');
  const lines = order.lines.filter((l) => merchantIds.includes(l.merchantId));
  // Same amount the backend adds to cancelledAmount (and refundAmount when paid).
  const cancelledAmount = round2(linesTotal(lines) + (keptMerchantIds.length === 0 ? Number(order.shippingFee) || 0 : 0));
  const refund = order.paymentStatus === 'paid' ? cancelledAmount : null;
  return { merchantIds, lines, keptMerchantIds, refund, cancelledAmount };
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
  // A merchant has earned only what it delivered; cancelled parts never count.
  return statusFor(order, merchantId) === 'delivered';
}

export const ON_DELIVERY = ['cash_on_delivery', 'mobile_money_on_delivery'];

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Cash the rider collects on an on-delivery order: orderTotal - cancelledAmount (null for online payment). */
export function cashDue(order: Order, extraCancelled = 0): number | null {
  if (!ON_DELIVERY.includes(order.paymentMethod)) return null;
  return Math.max(0, round2((Number(order.orderTotal) || 0) - (Number(order.cancelledAmount) || 0) - extraCancelled));
}

export function unitsFor(lines: OrderLine[]): number {
  return lines.reduce((n, l) => n + (Number(l.quantity) || 0), 0);
}
