import type { Timestamp } from 'firebase/firestore';

/** Field shapes follow gugu_2.0/router/platform_contract.md. */

export type Role = 'customer' | 'merchant' | 'admin';

export type OrderStatus =
  | 'awaiting_payment'
  | 'placed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'payment_failed';

/**
 * What a stored `status` field may actually hold. Firestore is not typed, so a
 * legacy or newer-than-this-build value arrives as a plain string. Those are
 * kept verbatim and rendered through `statusLabel()`; they are never cast to
 * `OrderStatus`, because code that switches on the known set would then be
 * silently wrong (and `STATUS_LABEL[status]` would be `undefined`).
 */
export type OrderStatusValue = OrderStatus | (string & {});

export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed';
export type PaymentMethod = 'cash_on_delivery' | 'mobile_money_on_delivery' | 'expresspay';

export type OrderLine = {
  productId: string;
  merchantId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  currency: string;
  imageUrl?: string;
};

export type Order = {
  id: string;
  /** users/{userId}/orders/{id} */
  userId: string;
  orderNumber: string;
  status: OrderStatusValue;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  lines: OrderLine[];
  merchantIds: string[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  orderTotal: number;
  currency: 'GHS';
  shipping?: {
    fullName?: string;
    line1?: string;
    line2?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    phone?: string;
  };
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  statusHistory?: { status: OrderStatusValue; at?: Timestamp; by?: string }[];
  /** Per-merchant fulfilment; the order status is the least-advanced entry. */
  fulfilment?: Record<
    string,
    {
      /**
       * Absent when the stored entry carries no usable status. That is not the
       * same as `placed`: nothing has been recorded for this seller, so the
       * dashboard offers no next step for it.
       */
      status?: OrderStatusValue;
      deliveredAt?: Timestamp;
      history?: { status: OrderStatusValue; at?: Timestamp; by?: string }[];
    }
  >;
  /** Merchants whose undelivered parts were cancelled; delivered parts are kept. */
  cancelledMerchantIds?: string[];
  /** GHS owed back to the customer for cancelled parts of a paid order. */
  refundAmount?: number;
  /** GHS of cancelled lines (+ shipping if nothing was delivered); cash due on delivery = orderTotal - cancelledAmount. */
  cancelledAmount?: number;
  /** A merchant marked delivery within minutes of placement: admin review. */
  suspiciousFulfilment?: boolean;
  /* Server bookkeeping, read-only. */
  shippingOptionId?: string | null;
  cancelReason?: string;
  paymentReviewRequired?: boolean;
  refundRequired?: boolean;
};

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type Product = {
  id: string;
  merchantId: string;
  categoryId: string;
  subCategoryId: string;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number | null;
  currency: string;
  imageUrls: string[];
  isActive: boolean;
  rating?: number;
  reviewCount?: number;
  soldCount?: number;
  stockQuantity?: number;
  highlights?: string[];
  returnPolicy?: string;
  supportNote?: string;
  /** Contract cap: 10 ids. Older products may carry more and must be trimmed to save. */
  relatedProductIds?: string[];
  approvalStatus?: ApprovalStatus;
  reviewNote?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  /**
   * The document exactly as Firestore stored it, set by `toProduct`. The fields
   * above are sanitised for rendering, but the product rules validate the merged
   * *stored* document, so the write-blocker check reads this. Parse-time only:
   * it is never written back.
   */
  stored?: Record<string, unknown>;
};

export type Merchant = {
  id: string;
  name: string;
  tagline?: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  isActive?: boolean;
  rating?: number;
  productCount?: number;
  ownerUid?: string;
};

export type MerchantApplication = {
  uid: string;
  businessName: string;
  phone?: string;
  email?: string;
  regionId?: string;
  cityId?: string;
  description?: string;
  documentUrls?: string[];
  status: 'pending' | 'approved' | 'rejected';
  reviewNote?: string | null;
  merchantId?: string;
  createdAt?: Timestamp;
  reviewedAt?: Timestamp;
};

export type Category = { id: string; name: string; sortOrder?: number | null };
export type SubCategory = { id: string; categoryId: string; name: string };

export type Banner = {
  id: string;
  title: string;
  description?: string;
  status: 'show' | 'hide';
  placement: 'homeTop';
  priority: number;
  prefixType: 'none' | 'builtInIcon' | 'image';
  prefixIconName?: string;
  prefixImageUrl?: string;
  backgroundColorHex?: string;
  textColorHex?: string;
  iconColorHex?: string;
  actionKind: 'none' | 'inAppRoute' | 'externalUrl';
  actionRoute?: string;
  actionUrl?: string;
  startAt?: Timestamp | null;
  endAt?: Timestamp | null;
  createdById?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type UserProfile = {
  uid: string;
  email?: string;
  displayName?: string;
  phone?: string;
  role?: Role;
  merchantId?: string;
  createdAt?: Timestamp;
  lastLoginAt?: Timestamp;
};
