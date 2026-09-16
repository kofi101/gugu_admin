'use client';

import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
  type DocumentData,
  type DocumentSnapshot,
  type QueryConstraint,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { functionErrorCode } from './errors';
import { firebase } from './firebase';
import type {
  Banner,
  Category,
  Merchant,
  MerchantApplication,
  Order,
  OrderStatus,
  Product,
  Role,
  SubCategory,
  UserProfile,
} from './types';

type Snap = DocumentSnapshot<DocumentData>;

const num = (v: unknown, fallback = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);
const str = (v: unknown) => (typeof v === 'string' ? v : undefined);
const strList = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

export function toProduct(snap: Snap): Product {
  const d = snap.data() ?? {};
  return {
    ...(d as Partial<Product>),
    id: snap.id,
    merchantId: str(d.merchantId) ?? '',
    categoryId: str(d.categoryId) ?? '',
    subCategoryId: str(d.subCategoryId) ?? '',
    name: str(d.name) ?? 'Untitled product',
    price: num(d.price),
    discountPrice: typeof d.discountPrice === 'number' ? d.discountPrice : null,
    currency: str(d.currency) ?? 'GHS',
    imageUrls: strList(d.imageUrls),
    isActive: d.isActive === true,
    stockQuantity: typeof d.stockQuantity === 'number' ? d.stockQuantity : undefined,
    highlights: strList(d.highlights),
  };
}

export function toOrder(snap: Snap): Order {
  const d = snap.data() ?? {};
  return {
    ...(d as Partial<Order>),
    id: snap.id,
    userId: str(d.userId) ?? snap.ref.parent.parent?.id ?? '',
    orderNumber: str(d.orderNumber) ?? snap.id,
    status: (str(d.status) ?? 'placed') as OrderStatus,
    paymentMethod: (str(d.paymentMethod) ?? 'cash_on_delivery') as Order['paymentMethod'],
    paymentStatus: (str(d.paymentStatus) ?? 'unpaid') as Order['paymentStatus'],
    lines: Array.isArray(d.lines) ? d.lines : [],
    merchantIds: strList(d.merchantIds),
    subtotal: num(d.subtotal),
    shippingFee: num(d.shippingFee),
    discount: num(d.discount),
    orderTotal: num(d.orderTotal),
    currency: 'GHS',
    statusHistory: Array.isArray(d.statusHistory) ? d.statusHistory : [],
  };
}

const withId = <T,>(snap: Snap) => ({ ...(snap.data() as T), id: snap.id }) as T;

type Next<T> = (value: T) => void;
type Fail = (error: unknown) => void;

/* ---------- Merchant scope (merchantId always from token claims) ---------- */

export function watchMerchantProducts(merchantId: string, next: Next<Product[]>, fail: Fail) {
  const q = query(collection(firebase().db, 'products'), where('merchantId', '==', merchantId));
  return onSnapshot(
    q,
    (s) =>
      next(
        s.docs
          .map(toProduct)
          .sort((a, b) => (b.updatedAt?.toMillis() ?? 0) - (a.updatedAt?.toMillis() ?? 0))
      ),
    fail
  );
}

export function watchMerchantOrders(merchantId: string, next: Next<Order[]>, fail: Fail, max = 250) {
  const q = query(
    collectionGroup(firebase().db, 'orders'),
    where('merchantIds', 'array-contains', merchantId),
    orderBy('createdAt', 'desc'),
    limit(max)
  );
  return onSnapshot(q, (s) => next(s.docs.map(toOrder)), fail);
}

export function watchOrder(userId: string, orderId: string, next: Next<Order | null>, fail: Fail) {
  return onSnapshot(
    doc(firebase().db, 'users', userId, 'orders', orderId),
    (s) => next(s.exists() ? toOrder(s) : null),
    fail
  );
}

export function watchProduct(productId: string, next: Next<Product | null>, fail: Fail) {
  return onSnapshot(
    doc(firebase().db, 'products', productId),
    (s) => next(s.exists() ? toProduct(s) : null),
    fail
  );
}

export function watchMerchant(merchantId: string, next: Next<Merchant | null>, fail: Fail) {
  return onSnapshot(
    doc(firebase().db, 'merchants', merchantId),
    (s) => next(s.exists() ? withId<Merchant>(s) : null),
    fail
  );
}

/* ---------- Catalog ---------- */

export function watchCategories(next: Next<Category[]>, fail: Fail) {
  return onSnapshot(
    collection(firebase().db, 'categories'),
    (s) =>
      next(
        s.docs
          .map((d) => withId<Category>(d))
          .sort((a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999) || a.name.localeCompare(b.name))
      ),
    fail
  );
}

export function watchSubcategories(next: Next<SubCategory[]>, fail: Fail) {
  return onSnapshot(
    collection(firebase().db, 'subcategories'),
    (s) => next(s.docs.map((d) => withId<SubCategory>(d)).sort((a, b) => a.name.localeCompare(b.name))),
    fail
  );
}

export function watchBanners(next: Next<Banner[]>, fail: Fail) {
  return onSnapshot(
    collection(firebase().db, 'banners'),
    (s) => next(s.docs.map((d) => withId<Banner>(d)).sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))),
    fail
  );
}

/* ---------- Admin ---------- */

export function watchApplications(status: MerchantApplication['status'], next: Next<MerchantApplication[]>, fail: Fail) {
  const q = query(collection(firebase().db, 'merchant_applications'), where('status', '==', status), limit(200));
  return onSnapshot(
    q,
    (s) =>
      next(
        s.docs
          .map((d) => ({ ...(d.data() as MerchantApplication), uid: d.id }))
          .sort((a, b) => (a.createdAt?.toMillis() ?? 0) - (b.createdAt?.toMillis() ?? 0))
      ),
    fail
  );
}

export function watchProductsByApproval(status: 'pending' | 'approved' | 'rejected', next: Next<Product[]>, fail: Fail) {
  const q = query(collection(firebase().db, 'products'), where('approvalStatus', '==', status), limit(200));
  return onSnapshot(
    q,
    (s) =>
      next(
        s.docs
          .map(toProduct)
          .sort((a, b) => (a.updatedAt?.toMillis() ?? 0) - (b.updatedAt?.toMillis() ?? 0))
      ),
    fail
  );
}

export function watchAllOrders(status: OrderStatus | 'all', next: Next<Order[]>, fail: Fail, max = 200) {
  const constraints: QueryConstraint[] = [];
  if (status !== 'all') constraints.push(where('status', '==', status));
  constraints.push(orderBy('createdAt', 'desc'), limit(max));
  const q = query(collectionGroup(firebase().db, 'orders'), ...constraints);
  return onSnapshot(q, (s) => next(s.docs.map(toOrder)), fail);
}

export async function listMerchants(): Promise<Merchant[]> {
  const s = await getDocs(query(collection(firebase().db, 'merchants'), limit(500)));
  return s.docs.map((d) => withId<Merchant>(d)).sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
}

export async function findUsers(term: string): Promise<UserProfile[]> {
  const { db } = firebase();
  const t = term.trim();
  if (!t) return [];
  if (t.includes('@')) {
    const variants = Array.from(new Set([t, t.toLowerCase()]));
    const s = await getDocs(query(collection(db, 'users'), where('email', 'in', variants), limit(20)));
    return s.docs.map((d) => ({ ...(d.data() as UserProfile), uid: d.id }));
  }
  const snap = await getDoc(doc(db, 'users', t));
  return snap.exists() ? [{ ...(snap.data() as UserProfile), uid: snap.id }] : [];
}

export async function getMerchantName(merchantId: string): Promise<string | null> {
  const snap = await getDoc(doc(firebase().db, 'merchants', merchantId));
  return snap.exists() ? (str(snap.data().name) ?? null) : null;
}

/* ---------- Callable Functions (contract names) ---------- */

export const REAUTH_EVENT = 'gugu:reauth-required';

function callable<I, O>(name: string) {
  return async (input: I): Promise<O> => {
    const fn = httpsCallable<I, O>(firebase().functions, name);
    try {
      const res = await fn(input);
      return res.data;
    } catch (error) {
      // Claims changed after this token was issued: the session must be renewed.
      if (functionErrorCode(error) === 'REAUTH_REQUIRED' && typeof window !== 'undefined') {
        window.dispatchEvent(new Event(REAUTH_EVENT));
      }
      throw error;
    }
  };
}

export const updateOrderStatus = callable<
  { userId: string; orderId: string; status: OrderStatus; merchantId?: string },
  { status: OrderStatus; fulfilmentStatus?: OrderStatus }
>(
  'updateOrderStatus'
);
export const cancelOrder = callable<{ orderId: string; reason?: string; userId?: string }, { status: OrderStatus }>(
  'cancelOrder'
);
export const reviewMerchantApplication = callable<
  { uid: string; decision: 'approve' | 'reject'; note?: string },
  { merchantId?: string }
>('reviewMerchantApplication');
export const reviewProduct = callable<
  { productId: string; decision: 'approve' | 'reject'; note?: string },
  { approvalStatus: string }
>('reviewProduct');
export const setUserRole = callable<{ uid: string; role: Role; merchantId?: string }, { ok: boolean }>('setUserRole');
