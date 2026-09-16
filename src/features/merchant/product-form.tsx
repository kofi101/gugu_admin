'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { collection, doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { StatusBadge } from '@/components/ui/badge';
import { Button, ButtonLink } from '@/components/ui/button';
import { Field, Input, Select, Textarea } from '@/components/ui/field';
import { ImagePicker, existingImages, type PickedImage } from '@/components/ui/image-picker';
import { Panel } from '@/components/ui/panel';
import { ErrorState, Skeleton } from '@/components/ui/states';
import { useMerchantId } from '@/lib/auth';
import { watchCategories, watchSubcategories } from '@/lib/data';
import { describeError } from '@/lib/errors';
import { firebase } from '@/lib/firebase';
import { formatMoney } from '@/lib/format';
import type { Category, Product, SubCategory } from '@/lib/types';
import { uploadPicked } from '@/lib/upload-picked';
import { useLive } from '@/lib/use-data';

const MONEY = /^\d{1,7}(\.\d{1,2})?$/;

const schema = z
  .object({
    name: z.string().trim().min(3, 'Name must be at least 3 characters.').max(120, 'Keep the name under 120 characters.'),
    description: z.string().trim().max(5000, 'Keep the description under 5,000 characters.'),
    categoryId: z.string().min(1, 'Choose a category.'),
    subCategoryId: z.string().min(1, 'Choose a subcategory.'),
    price: z
      .string()
      .trim()
      .min(1, 'Enter a price.')
      .regex(MONEY, 'Enter an amount like 120 or 120.50.')
      .refine((v) => Number(v) > 0, 'Price must be more than zero.'),
    discountPrice: z
      .string()
      .trim()
      .refine((v) => v === '' || MONEY.test(v), 'Enter an amount like 99 or 99.90, or leave it empty.'),
    stockQuantity: z
      .string()
      .trim()
      .min(1, 'Enter how many you have in stock.')
      .regex(/^\d{1,6}$/, 'Enter a whole number, 0 or more.')
      .refine((v) => Number(v) <= 100000, 'Stock can be at most 100,000.'),
    highlights: z.string().max(2000, 'Keep highlights under 2,000 characters.'),
    returnPolicy: z.string().trim().max(500, 'Keep this under 500 characters.'),
  })
  .superRefine((v, ctx) => {
    if (v.discountPrice === '' || !MONEY.test(v.price) || !MONEY.test(v.discountPrice)) return;
    const sale = Number(v.discountPrice);
    if (sale <= 0) ctx.addIssue({ code: 'custom', path: ['discountPrice'], message: 'Sale price must be more than zero.' });
    else if (sale >= Number(v.price))
      ctx.addIssue({ code: 'custom', path: ['discountPrice'], message: 'Sale price must be lower than the price.' });
  });

type Values = z.infer<typeof schema>;

function defaults(p?: Product): Values {
  return {
    name: p?.name ?? '',
    description: p?.description ?? '',
    categoryId: p?.categoryId ?? '',
    subCategoryId: p?.subCategoryId ?? '',
    price: p ? String(p.price) : '',
    discountPrice: p?.discountPrice ? String(p.discountPrice) : '',
    stockQuantity: typeof p?.stockQuantity === 'number' ? String(p.stockQuantity) : '',
    highlights: (p?.highlights ?? []).join('\n'),
    returnPolicy: p?.returnPolicy ?? '',
  };
}

function toHighlights(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 12);
}

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? '') === JSON.stringify(b ?? '');

/** The contract's content fields: changing any of them requires re-approval. */
function contentChanged(
  p: Product,
  next: { name: string; description: string; categoryId: string; subCategoryId: string; imageUrls: string[]; highlights: string[] }
) {
  return (
    !same(p.name, next.name) ||
    !same(p.description ?? '', next.description) ||
    !same(p.categoryId, next.categoryId) ||
    !same(p.subCategoryId, next.subCategoryId) ||
    !same(p.imageUrls, next.imageUrls) ||
    !same(p.highlights ?? [], next.highlights)
  );
}

export function ProductForm({ product }: { product?: Product }) {
  const merchantId = useMerchantId();
  const router = useRouter();
  const editing = Boolean(product);
  // The id is fixed up front so images upload to their final folder.
  const [productId] = useState(() => product?.id ?? doc(collection(firebase().db, 'products')).id);
  const [images, setImages] = useState<PickedImage[]>(() => existingImages(product?.imageUrls ?? []));
  const [imageError, setImageError] = useState<string | undefined>();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const categories = useLive<Category[]>('categories', watchCategories);
  const subcategories = useLive<SubCategory[]>('subcategories', watchSubcategories);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isDirty },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: defaults(product) });

  const [categoryId, price, discount, wName, wDescription, wSub, wHighlights] = useWatch({
    control,
    name: ['categoryId', 'price', 'discountPrice', 'name', 'description', 'subCategoryId', 'highlights'],
  });
  const willReview =
    !product ||
    contentChanged(product, {
      name: wName.trim(),
      description: wDescription.trim(),
      categoryId,
      subCategoryId: wSub,
      imageUrls: images.map((i) => (i.kind === 'existing' ? i.url : i.key)),
      highlights: toHighlights(wHighlights),
    });
  const subOptions = useMemo(
    () => (subcategories.status === 'ready' ? subcategories.data.filter((s) => s.categoryId === categoryId) : []),
    [subcategories, categoryId]
  );

  const imagesChanged =
    images.some((i) => i.kind === 'new') ||
    images.map((i) => (i.kind === 'existing' ? i.url : '')).join('|') !== (product?.imageUrls ?? []).join('|');

  const onSubmit = async (values: Values) => {
    setSaveError(null);
    if (images.length === 0) {
      setImageError('Add at least one photo of the product.');
      return;
    }
    setImageError(undefined);
    setSaving(true);
    try {
      const imageUrls = await uploadPicked(images, `products/${merchantId}/${productId}`, setImages);
      const content = {
        name: values.name,
        description: values.description,
        categoryId: values.categoryId,
        subCategoryId: values.subCategoryId,
        imageUrls,
        highlights: toHighlights(values.highlights),
      };
      // Price, stock and policy can change on a live product without review.
      const commercial = {
        price: Number(values.price),
        discountPrice: values.discountPrice ? Number(values.discountPrice) : null,
        currency: 'GHS',
        stockQuantity: Number(values.stockQuantity),
        returnPolicy: values.returnPolicy,
        updatedAt: serverTimestamp(),
      };
      // Content edits (and new products) must go back to review, off the shelf, in the same write.
      const review = { approvalStatus: 'pending' as const, isActive: false };
      const ref = doc(firebase().db, 'products', productId);
      const needsReview = !product || contentChanged(product, content);
      if (!product) {
        await setDoc(ref, { ...content, ...commercial, ...review, id: productId, merchantId, createdAt: serverTimestamp() });
      } else if (needsReview) {
        // Removed photos are left in Storage: existing order lines may reference them.
        await updateDoc(ref, { ...content, ...commercial, ...review });
      } else {
        await updateDoc(ref, commercial);
      }
      toast.success(
        !product
          ? 'Product added and sent for approval.'
          : needsReview
            ? 'Changes saved and sent for approval.'
            : 'Price and stock updated.'
      );
      router.push(needsReview ? '/merchant/products?filter=pending' : '/merchant/products');
    } catch (error) {
      const message = describeError(error);
      setSaveError(message);
      toast.error(editing ? `Changes not saved. ${message}` : `Product not added. ${message}`, { duration: 7000 });
    } finally {
      setSaving(false);
    }
  };

  const catalogError = categories.status === 'error' ? categories : subcategories.status === 'error' ? subcategories : null;
  const salePreview = MONEY.test(price) && MONEY.test(discount) && Number(discount) < Number(price) ? Number(discount) : null;

  return (
    <form
      onSubmit={handleSubmit(onSubmit, () => {
        if (images.length === 0) setImageError('Add at least one photo of the product.');
        toast.error('Some details need fixing. Check the highlighted fields.');
      })}
      noValidate
      className="flex flex-col gap-6"
    >
      {product ? (
        <div className="flex items-start gap-3 rounded-[var(--radius-panel)] border border-thread-300 bg-thread-50 px-4 py-3 text-[0.9375rem] text-thread-800">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p aria-live="polite">
            Currently <StatusBadge status={product.approvalStatus ?? 'pending'} />.{' '}
            {willReview && (isDirty || imagesChanged) ? (
              <strong className="font-semibold">
                You changed the name, photos, description, category or highlights. Saving sends the product back to GUGU
                staff for approval and hides it from shoppers until then.
              </strong>
            ) : (
              <>
                Price, sale price, stock and return policy changes apply straight away. Changing the name, photos,
                description, category or highlights sends the product back for approval.
              </>
            )}
            {product.approvalStatus === 'rejected' && product.reviewNote ? (
              <span className="mt-1 block">Reviewer note: {product.reviewNote}</span>
            ) : null}
          </p>
        </div>
      ) : null}

      <Panel title="Photos" bodyClassName="px-4 py-4 sm:px-5">
        <ImagePicker
          label="Product photos"
          hint="Up to 8 JPG, PNG or WebP images, 5 MB each. The first image is the cover."
          value={images}
          onChange={(next) => {
            setImages(next);
            if (next.length) setImageError(undefined);
          }}
          onReject={(messages) => messages.forEach((m) => toast.error(m, { duration: 6000 }))}
          disabled={saving}
          error={imageError}
          onRetry={handleSubmit(onSubmit)}
        />
      </Panel>

      <Panel title="Details" bodyClassName="grid gap-5 px-4 py-4 sm:px-5">
        <Field label="Name" required error={errors.name?.message}>
          {(p) => <Input {...p} {...register('name')} autoComplete="off" />}
        </Field>
        <Field label="Description" error={errors.description?.message} hint="What it is, size, material, what is in the box.">
          {(p) => <Textarea {...p} rows={5} {...register('description')} />}
        </Field>
        {catalogError ? (
          <ErrorState error={catalogError.error} onRetry={catalogError.retry} title="Categories could not be loaded" className="px-0 py-2" />
        ) : categories.status === 'loading' || subcategories.status === 'loading' ? (
          <div className="grid gap-5 sm:grid-cols-2" role="status">
            <span className="sr-only">Loading categories…</span>
            <Skeleton className="h-[4.5rem]" />
            <Skeleton className="h-[4.5rem]" />
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category" required error={errors.categoryId?.message}>
              {(p) => (
                <Select
                  {...p}
                  {...register('categoryId', {
                    onChange: () => setValue('subCategoryId', '', { shouldValidate: false }),
                  })}
                >
                  <option value="">Choose a category</option>
                  {categories.status === 'ready'
                    ? categories.data.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))
                    : null}
                </Select>
              )}
            </Field>
            <Field
              label="Subcategory"
              required
              error={errors.subCategoryId?.message}
              hint={categoryId && subOptions.length === 0 ? 'This category has no subcategories yet. Ask GUGU staff to add one.' : undefined}
            >
              {(p) => (
                <Select {...p} {...register('subCategoryId')} disabled={!categoryId || subOptions.length === 0}>
                  <option value="">{categoryId ? 'Choose a subcategory' : 'Choose a category first'}</option>
                  {subOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>
        )}
      </Panel>

      <Panel title="Price and stock" bodyClassName="grid gap-5 px-4 py-4 sm:grid-cols-3 sm:px-5">
        <Field label="Price (GH₵)" required error={errors.price?.message}>
          {(p) => <Input {...p} inputMode="decimal" placeholder="0.00" className="tabular" {...register('price')} />}
        </Field>
        <Field
          label="Sale price (GH₵)"
          error={errors.discountPrice?.message}
          hint={salePreview !== null ? `Shoppers pay ${formatMoney(salePreview)}` : 'Optional. Must be lower than the price.'}
        >
          {(p) => <Input {...p} inputMode="decimal" placeholder="None" className="tabular" {...register('discountPrice')} />}
        </Field>
        <Field label="In stock" required error={errors.stockQuantity?.message}>
          {(p) => <Input {...p} inputMode="numeric" placeholder="0" className="tabular" {...register('stockQuantity')} />}
        </Field>
      </Panel>

      <Panel title="Extra information" bodyClassName="grid gap-5 px-4 py-4 sm:px-5">
        <Field label="Highlights" hint="One per line, up to 12. Shown as bullet points." error={errors.highlights?.message}>
          {(p) => <Textarea {...p} rows={4} {...register('highlights')} />}
        </Field>
        <Field label="Return policy" hint="For example: Returns accepted within 7 days if unused." error={errors.returnPolicy?.message}>
          {(p) => <Input {...p} {...register('returnPolicy')} />}
        </Field>
      </Panel>

      {saveError ? (
        <p role="alert" className="rounded-lg border border-bad-700/25 bg-bad-50 px-4 py-3 text-[0.9375rem] text-bad-700">
          {saveError}
        </p>
      ) : null}

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-end gap-2 border-t border-line bg-ground/95 px-4 py-3 backdrop-blur-sm sm:mx-0 sm:rounded-[var(--radius-panel)] sm:border sm:bg-surface/95">
        <ButtonLink href="/merchant/products" variant="secondary">
          Cancel
        </ButtonLink>
        <Button type="submit" loading={saving} disabled={editing && !isDirty && !imagesChanged}>
          {saving ? 'Saving…' : !editing ? 'Add product' : willReview ? 'Save and send for approval' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
