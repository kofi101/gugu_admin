'use client';

import { Check, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog, Dialog } from '@/components/ui/dialog';
import { FilterTabs, Thumb } from '@/components/ui/filters';
import { DefinitionList, PageHeader, Panel } from '@/components/ui/panel';
import { DataView, EmptyState } from '@/components/ui/states';
import { listMerchants, reviewProduct, watchCategories, watchProductsByApproval, watchSubcategories } from '@/lib/data';
import { formatDateTime, formatMoney } from '@/lib/format';
import { mutate } from '@/lib/notify';
import type { Category, Merchant, Product, SubCategory } from '@/lib/types';
import { useAsync, useLive } from '@/lib/use-data';

type Status = 'pending' | 'approved' | 'rejected';

export function ProductApprovals() {
  const [status, setStatus] = useState<Status>('pending');
  const [open, setOpen] = useState<Product | null>(null);
  const [decision, setDecision] = useState<{ product: Product; decision: 'approve' | 'reject' } | null>(null);

  const result = useLive<Product[]>(`approvals:${status}`, (next, fail) => watchProductsByApproval(status, next, fail));
  const merchants = useAsync<Merchant[]>('merchants', listMerchants);
  const categories = useLive<Category[]>('categories', watchCategories);
  const subcategories = useLive<SubCategory[]>('subcategories', watchSubcategories);

  const names = useMemo(() => {
    const m = new Map<string, string>();
    if (merchants.status === 'ready') merchants.data.forEach((x) => m.set(`m:${x.id}`, x.name));
    if (categories.status === 'ready') categories.data.forEach((x) => m.set(`c:${x.id}`, x.name));
    if (subcategories.status === 'ready') subcategories.data.forEach((x) => m.set(`s:${x.id}`, x.name));
    return m;
  }, [merchants, categories, subcategories]);
  const name = (prefix: string, id: string) => names.get(`${prefix}:${id}`) ?? id ?? '—';

  const decide = (product: Product, d: 'approve' | 'reject') => {
    setOpen(null);
    setDecision({ product, decision: d });
  };

  return (
    <>
      <PageHeader
        title="Product approvals"
        description="Check each listing is real, correctly priced and appropriate before shoppers can buy it."
      />
      <FilterTabs
        className="mb-4"
        label="Filter products by approval"
        value={status}
        onChange={setStatus}
        options={[
          { value: 'pending', label: 'To review' },
          { value: 'approved', label: 'Approved' },
          { value: 'rejected', label: 'Rejected' },
        ]}
      />
      <Panel>
        <DataView result={result} errorTitle="Products could not be loaded">
          {(products) =>
            products.length === 0 ? (
              <EmptyState title={status === 'pending' ? 'Nothing to review' : `No ${status} products`}>
                {status === 'pending' ? 'New and edited seller products appear here.' : null}
              </EmptyState>
            ) : (
              <ul className="divide-y divide-line">
                {products.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5 sm:flex-nowrap sm:px-5">
                    <Thumb src={p.imageUrls[0]} className="size-14" />
                    <div className="min-w-0 flex-1 basis-48">
                      <button
                        type="button"
                        onClick={() => setOpen(p)}
                        className="block max-w-full truncate text-left font-semibold text-ink hover:text-brand-700 hover:underline"
                      >
                        {p.name}
                      </button>
                      <p className="truncate text-sm text-ink-muted">
                        {name('m', p.merchantId)}, {name('c', p.categoryId)}
                      </p>
                    </div>
                    <span className="font-semibold tabular">{formatMoney(p.discountPrice || p.price)}</span>
                    <div className="flex w-full justify-end gap-2 sm:w-auto">
                      <Button variant="secondary" size="sm" onClick={() => setOpen(p)}>
                        Review<span className="sr-only"> {p.name}</span>
                      </Button>
                      {status === 'pending' ? (
                        <Button size="sm" icon={<Check aria-hidden />} onClick={() => decide(p, 'approve')}>
                          Approve<span className="sr-only"> {p.name}</span>
                        </Button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )
          }
        </DataView>
      </Panel>

      <Dialog
        open={open !== null}
        onClose={() => setOpen(null)}
        size="lg"
        title={open?.name ?? ''}
        description={open ? `${name('m', open.merchantId)}. Updated ${formatDateTime(open.updatedAt)}` : undefined}
        footer={
          open ? (
            <>
              {open.approvalStatus !== 'rejected' ? (
                <Button variant="secondary" icon={<X aria-hidden />} onClick={() => decide(open, 'reject')}>
                  Reject
                </Button>
              ) : null}
              {open.approvalStatus !== 'approved' ? (
                <Button icon={<Check aria-hidden />} onClick={() => decide(open, 'approve')}>
                  Approve
                </Button>
              ) : null}
            </>
          ) : null
        }
      >
        {open ? (
          <div className="flex flex-col gap-5">
            {open.imageUrls.length ? (
              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {open.imageUrls.map((u, i) => (
                  <li key={u}>
                    <a href={u} target="_blank" rel="noopener noreferrer" className="block">
                      {/* eslint-disable-next-line @next/next/no-img-element -- Storage URLs */}
                      <img src={u} alt={`${open.name}, photo ${i + 1}`} className="aspect-square w-full rounded-lg object-cover ring-1 ring-line" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-bad-700">No photos.</p>
            )}
            <DefinitionList
              items={[
                { label: 'Status', value: <StatusBadge status={open.approvalStatus ?? 'pending'} /> },
                {
                  label: 'Price',
                  value: (
                    <span className="tabular">
                      {formatMoney(open.price)}
                      {open.discountPrice ? `, on sale for ${formatMoney(open.discountPrice)}` : ''}
                    </span>
                  ),
                },
                { label: 'Stock', value: typeof open.stockQuantity === 'number' ? open.stockQuantity : 'Not set' },
                { label: 'Category', value: `${name('c', open.categoryId)} / ${name('s', open.subCategoryId)}` },
                { label: 'Description', value: <span className="whitespace-pre-line">{open.description || '—'}</span> },
                ...(open.highlights?.length
                  ? [{ label: 'Highlights', value: <ul className="list-disc pl-5">{open.highlights.map((h) => <li key={h}>{h}</li>)}</ul> }]
                  : []),
                ...(open.returnPolicy ? [{ label: 'Return policy', value: open.returnPolicy }] : []),
                ...(open.reviewNote ? [{ label: 'Last review note', value: open.reviewNote }] : []),
              ]}
            />
          </div>
        ) : null}
      </Dialog>

      <ConfirmDialog
        open={decision !== null}
        onClose={() => setDecision(null)}
        tone={decision?.decision === 'approve' ? 'primary' : 'danger'}
        title={decision?.decision === 'approve' ? `Approve ${decision.product.name}?` : `Reject ${decision?.product.name ?? ''}?`}
        description={
          decision?.decision === 'approve'
            ? 'It goes live straight away and shoppers can buy it.'
            : 'It is hidden from shoppers. The seller sees your reason and can edit and resubmit.'
        }
        confirmLabel={decision?.decision === 'approve' ? 'Approve and publish' : 'Reject product'}
        withNote
        noteRequired={decision?.decision === 'reject'}
        noteLabel={decision?.decision === 'reject' ? 'Reason for the seller' : 'Note (optional)'}
        onConfirm={async (note) => {
          if (!decision) return;
          const { product, decision: d } = decision;
          await mutate(() => reviewProduct({ productId: product.id, decision: d, note: note || undefined }), {
            success: d === 'approve' ? `${product.name} approved and live.` : `${product.name} rejected.`,
            error: 'Decision not saved.',
          });
        }}
      />
    </>
  );
}
