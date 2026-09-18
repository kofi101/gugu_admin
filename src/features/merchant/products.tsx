'use client';

import { deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ArrowLeft, Eye, EyeOff, PackagePlus, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { Button, ButtonLink } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/dialog';
import { FilterTabs, SearchInput, Thumb } from '@/components/ui/filters';
import { PageHeader, Panel } from '@/components/ui/panel';
import { DataView, EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { useMerchantId } from '@/lib/auth';
import { watchMerchantProducts, watchProduct } from '@/lib/data';
import { firebase } from '@/lib/firebase';
import { formatMoney } from '@/lib/format';
import { mutate } from '@/lib/notify';
import type { Product } from '@/lib/types';
import { useLive } from '@/lib/use-data';
import { LOW_STOCK } from './overview';
import { ProductForm, blockerReasons, productWriteBlockers } from './product-form';

type Filter = 'all' | 'live' | 'pending' | 'rejected' | 'hidden';

const FILTERS: [Filter, string, (p: Product) => boolean][] = [
  ['all', 'All', () => true],
  ['live', 'Live', (p) => p.approvalStatus === 'approved' && p.isActive],
  ['pending', 'Awaiting approval', (p) => (p.approvalStatus ?? 'pending') === 'pending'],
  ['rejected', 'Needs changes', (p) => p.approvalStatus === 'rejected'],
  ['hidden', 'Hidden', (p) => p.approvalStatus === 'approved' && !p.isActive],
];

function ApprovalBadge({ product }: { product: Product }) {
  const s = product.approvalStatus ?? 'pending';
  if (s === 'approved') return product.isActive ? <Badge tone="ok">Live</Badge> : <Badge tone="neutral">Hidden</Badge>;
  if (s === 'rejected') return <StatusBadge status="rejected" label="Needs changes" />;
  return <StatusBadge status="pending" label="Awaiting approval" />;
}

function StockText({ qty }: { qty?: number }) {
  if (typeof qty !== 'number') return <span className="text-ink-subtle">Stock not set</span>;
  if (qty === 0) return <span className="font-semibold text-bad-700">Sold out</span>;
  if (qty <= LOW_STOCK) return <span className="font-semibold text-thread-800">{qty} left</span>;
  return <span>{qty} in stock</span>;
}

export function MerchantProducts() {
  const merchantId = useMerchantId();
  const router = useRouter();
  const params = useSearchParams();
  const f = params.get('filter');
  const filter: Filter = FILTERS.some(([k]) => k === f) ? (f as Filter) : 'all';
  const [term, setTerm] = useState('');
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const result = useLive<Product[]>(`m-products:${merchantId}`, (next, fail) => watchMerchantProducts(merchantId, next, fail));

  const toggleVisibility = async (p: Product) => {
    // The rules validate the merged document, so a value stored elsewhere on the
    // product refuses this write too. Say which one, instead of letting the
    // rejection come back as a vague permission error.
    const blockers = productWriteBlockers(p);
    if (blockers.length) {
      // Only point at Edit for what saving there actually repairs.
      const next = blockers.some((b) => b.fixable)
        ? 'Open Edit to fix it.'
        : 'This dashboard cannot fix it — contact GUGU support.';
      toast.error(
        `${p.name} cannot be ${p.isActive ? 'hidden' : 'shown'} because ${blockerReasons(blockers)}. ${next}`,
        { duration: 9000 }
      );
      return;
    }
    setToggling(p.id);
    try {
      await mutate(
        () => updateDoc(doc(firebase().db, 'products', p.id), { isActive: !p.isActive, updatedAt: serverTimestamp() }),
        {
          success: p.isActive ? `${p.name} is hidden from shoppers.` : `${p.name} is visible to shoppers.`,
          error: 'Visibility not changed.',
          context: 'write',
        }
      );
    } catch {
      /* toast shown */
    } finally {
      setToggling(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Products"
        description="Everything you sell on GUGU. New and edited products are checked by GUGU staff before they go live."
        actions={
          <ButtonLink href="/merchant/products/new" icon={<PackagePlus aria-hidden />}>
            Add product
          </ButtonLink>
        }
      />
      <Panel>
        <div className="flex flex-col gap-3 border-b border-line px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <FilterTabs
            label="Filter products"
            value={filter}
            onChange={(v) => router.replace(`/merchant/products?filter=${v}`, { scroll: false })}
            options={FILTERS.map(([value, label, test]) => ({
              value,
              label,
              count: result.status === 'ready' ? result.data.filter(test).length : undefined,
            }))}
          />
          <SearchInput
            label="Search products by name"
            placeholder="Search by name"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="lg:w-64"
          />
        </div>
        <DataView result={result} errorTitle="Your products could not be loaded">
          {(products) => {
            if (products.length === 0) {
              return (
                <EmptyState
                  title="You have not added any products"
                  action={
                    <ButtonLink href="/merchant/products/new" icon={<PackagePlus aria-hidden />}>
                      Add your first product
                    </ButtonLink>
                  }
                >
                  Add photos, a price and stock. GUGU staff approve it, then shoppers can buy it in the app and on the web.
                </EmptyState>
              );
            }
            const test = FILTERS.find(([k]) => k === filter)![2];
            const q = term.trim().toLowerCase();
            const visible = products.filter((p) => test(p) && (!q || p.name.toLowerCase().includes(q)));
            if (visible.length === 0) return <EmptyState title="No products match">Try another filter or search.</EmptyState>;
            return (
              <ul className="divide-y divide-line">
                {visible.map((p) => {
                  const onSale = typeof p.discountPrice === 'number' && p.discountPrice > 0 && p.discountPrice < p.price;
                  return (
                    <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5 sm:flex-nowrap sm:px-5">
                      <Thumb src={p.imageUrls[0]} className="size-14" />
                      <div className="min-w-0 flex-1 basis-40">
                        <Link
                          href={`/merchant/products/edit?id=${encodeURIComponent(p.id)}`}
                          className="block truncate font-semibold text-ink hover:text-brand-700 hover:underline"
                        >
                          {p.name}
                        </Link>
                        <p className="mt-0.5 text-sm text-ink-muted tabular">
                          {onSale ? (
                            <>
                              <span className="font-semibold text-ink">{formatMoney(p.discountPrice)}</span>{' '}
                              <s className="text-ink-subtle">{formatMoney(p.price)}</s>
                            </>
                          ) : (
                            <span className="font-semibold text-ink">{formatMoney(p.price)}</span>
                          )}
                          <span aria-hidden className="mx-2 text-line-strong">|</span>
                          <StockText qty={p.stockQuantity} />
                        </p>
                        {p.approvalStatus === 'rejected' && p.reviewNote ? (
                          <p className="mt-1 text-sm text-bad-700">Reviewer: {p.reviewNote}</p>
                        ) : null}
                      </div>
                      <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
                        <ApprovalBadge product={p} />
                        <div className="flex items-center gap-1">
                          {p.approvalStatus === 'approved' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              loading={toggling === p.id}
                              icon={p.isActive ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
                              onClick={() => toggleVisibility(p)}
                            >
                              {p.isActive ? 'Hide' : 'Show'}
                              <span className="sr-only"> {p.name}</span>
                            </Button>
                          ) : null}
                          <ButtonLink
                            href={`/merchant/products/edit?id=${encodeURIComponent(p.id)}`}
                            variant="ghost"
                            size="sm"
                            icon={<Pencil aria-hidden />}
                          >
                            Edit<span className="sr-only"> {p.name}</span>
                          </ButtonLink>
                          <Button variant="quiet-danger" size="sm" icon={<Trash2 aria-hidden />} onClick={() => setToDelete(p)}>
                            <span className="sr-only sm:not-sr-only">Delete</span>
                            <span className="sr-only"> {p.name}</span>
                          </Button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            );
          }}
        </DataView>
      </Panel>

      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        title={`Delete ${toDelete?.name ?? 'product'}?`}
        description="Shoppers will no longer see or buy it. Past orders keep their details. This cannot be undone."
        confirmLabel="Delete product"
        onConfirm={async () => {
          const p = toDelete;
          if (!p) return;
          // Photos stay in Storage: past order lines still reference them.
          await mutate(() => deleteDoc(doc(firebase().db, 'products', p.id)), {
            success: `${p.name} deleted.`,
            error: 'Product not deleted.',
            context: 'write',
          });
        }}
      />
    </>
  );
}

function BackToProducts() {
  return (
    <Link href="/merchant/products" className="inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
      <ArrowLeft className="size-4" aria-hidden />
      Products
    </Link>
  );
}

export function NewProduct() {
  return (
    <>
      <PageHeader
        back={<BackToProducts />}
        title="Add a product"
        description="GUGU staff review new products before shoppers can see them. You can keep editing while it waits."
      />
      <ProductForm />
    </>
  );
}

export function EditProduct() {
  const merchantId = useMerchantId();
  const id = useSearchParams().get('id') ?? '';
  const result = useLive<Product | null>(id ? `product:${id}` : null, (next, fail) => watchProduct(id, next, fail));
  // Freeze the first loaded version so live updates do not reset the form
  // mid-edit. The frozen copy is tagged with the id it came from: this route is
  // not remounted when only `?id=` changes, so without the tag the form would
  // keep showing — and saving over — the product opened first.
  const [frozen, setFrozen] = useState<{ id: string; product: Product } | null>(null);
  if (result.status === 'ready' && result.data && frozen?.id !== id) setFrozen({ id, product: result.data });
  const initial = frozen?.id === id ? frozen.product : null;

  const header = (title: string) => <PageHeader back={<BackToProducts />} title={title} />;

  if (!id || (result.status === 'ready' && (!result.data || result.data.merchantId !== merchantId))) {
    return (
      <>
        {header('Product not found')}
        <Panel>
          <EmptyState title="This product is not in your store">It may have been deleted. Go back to your products.</EmptyState>
        </Panel>
      </>
    );
  }
  if (result.status === 'error') {
    return (
      <>
        {header('Edit product')}
        <Panel>
          <ErrorState error={result.error} onRetry={result.retry} title="This product could not be loaded" />
        </Panel>
      </>
    );
  }
  if (!initial) {
    return (
      <div role="status">
        <span className="sr-only">Loading product…</span>
        {header('Edit product')}
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="mt-6 h-72 w-full rounded-xl" />
      </div>
    );
  }
  return (
    <>
      {header(`Edit ${initial.name}`)}
      {/* Keyed on the id so the form's own state (save target, images) is rebuilt per product. */}
      <ProductForm key={initial.id} product={initial} />
    </>
  );
}
