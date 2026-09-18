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
import { formatCount, formatMoney } from '@/lib/format';
import type { Category, Product, SubCategory } from '@/lib/types';
import { uploadPicked } from '@/lib/upload-picked';
import { useLive } from '@/lib/use-data';

/** Limits mirror the product write rules in gugu_2.0/router/platform_contract.md. */
export const PRODUCT_LIMITS = {
  nameMax: 300,
  descriptionMax: 10000,
  priceMin: 0.01,
  priceMax: 10_000_000,
  stockMax: 100_000,
  textMax: 2000,
  listMax: 20,
  /** The contract lowered related products from 20 to 10. */
  relatedMax: 10,
  /** Per-element cap the rules apply to related product ids, and to stored ids. */
  idMax: 128,
  specificationsMax: 50,
} as const;

/** Same pattern as the product rules' noContactInfo(): no off-platform contact or payment details. */
const CONTACT_INFO = /(momo|mobile money|whatsapp|[0-9+][0-9 ()+-]{8,}[0-9])/s;

const CONTACT_MESSAGE =
  'Remove phone numbers, MoMo, mobile money or WhatsApp details. Customers pay and contact you through GUGU.';

/** Defensive: Firestore may hold anything here, and a non-string has no `.toLowerCase()`. */
const hasContactInfo = (v: unknown): boolean => typeof v === 'string' && CONTACT_INFO.test(v.toLowerCase());

/**
 * One reason the product rules would refuse a write to this product.
 *
 * The rules validate the *merged* document, so a value already stored — even in
 * a field this form never shows — refuses every later write, including the
 * Hide/Show toggle that never touches it.
 */
export type WriteBlocker = {
  /** Reads after "because …", in the merchant's words. */
  reason: string;
  /** The stored field at fault. */
  field: string;
  /** True when saving this form writes a value that clears it. */
  fixable: boolean;
};

/** Fields the form rewrites only as part of a content edit (which forces re-approval). */
const CONTENT_FIELDS = ['name', 'description', 'categoryId', 'subCategoryId', 'imageUrls', 'highlights'];

/**
 * What the rules see. The parsed Product is sanitised for rendering (a stored
 * number in `supportNote` is dropped rather than rendered), but the rules still
 * read the stored value, so the checks below must too.
 */
const storedValue = (p: Product, key: string): unknown =>
  p.stored ? p.stored[key] : (p as unknown as Record<string, unknown>)[key];

/** Rules treat a missing value and an explicit null the same: neither is checked. */
const isUnset = (v: unknown) => v === undefined || v === null;

const count = formatCount;

/** A bounded, contact-checked text field: returnPolicy and supportNote. */
function textBlockers(p: Product, field: string, label: string): WriteBlocker[] {
  const v = storedValue(p, field);
  if (isUnset(v)) return [];
  if (typeof v !== 'string') return [{ field, fixable: true, reason: `its ${label} is not saved as text` }];
  const out: WriteBlocker[] = [];
  if (v.length > PRODUCT_LIMITS.textMax)
    out.push({ field, fixable: true, reason: `its ${label} is longer than ${count(PRODUCT_LIMITS.textMax)} characters` });
  if (hasContactInfo(v)) out.push({ field, fixable: true, reason: `its ${label} has contact details in it` });
  return out;
}

/** A list the rules only count: imageUrls and highlights. */
function listBlockers(p: Product, field: string, label: string): WriteBlocker[] {
  const v = storedValue(p, field);
  if (isUnset(v)) return [];
  if (!Array.isArray(v)) return [{ field, fixable: true, reason: `its ${label} are not saved as a list` }];
  return v.length > PRODUCT_LIMITS.listMax
    ? [{ field, fixable: true, reason: `it has ${count(v.length)} ${label} and GUGU allows ${PRODUCT_LIMITS.listMax}` }]
    : [];
}

/**
 * The compliant `relatedProductIds` to write back, or null when the stored value
 * already passes. Returned rather than assumed, because the stored value may not
 * be a list at all — slicing a string produced a shorter string, which the rules
 * rejected just the same.
 */
export function relatedProductIdsFix(p: Product): string[] | null {
  const v = storedValue(p, 'relatedProductIds');
  if (isUnset(v)) return null;
  const ok =
    Array.isArray(v) &&
    v.length <= PRODUCT_LIMITS.relatedMax &&
    v.every((x) => typeof x === 'string' && x.length <= PRODUCT_LIMITS.idMax);
  if (ok) return null;
  // Keep whatever is usable, in order, up to the cap; drop the rest.
  const usable = Array.isArray(v)
    ? v.filter((x): x is string => typeof x === 'string' && x.length <= PRODUCT_LIMITS.idMax)
    : [];
  return usable.slice(0, PRODUCT_LIMITS.relatedMax);
}

/**
 * Every reason the product rules would refuse a write to this product, checked
 * against the stored document the way `productValuesOk()` in
 * gugu_2.0/firestore.rules does. `fixable` says whether saving this form clears
 * it; the rest need GUGU staff, and the banner says so rather than promising a
 * fix the form cannot deliver.
 */
export function productWriteBlockers(p: Product): WriteBlocker[] {
  const out: WriteBlocker[] = [];

  const name = storedValue(p, 'name');
  if (typeof name !== 'string' || name.length === 0)
    out.push({ field: 'name', fixable: true, reason: 'it has no name' });
  else if (name.length > PRODUCT_LIMITS.nameMax)
    out.push({ field: 'name', fixable: true, reason: `its name is longer than ${PRODUCT_LIMITS.nameMax} characters` });

  const description = storedValue(p, 'description');
  if (!isUnset(description)) {
    if (typeof description !== 'string')
      out.push({ field: 'description', fixable: true, reason: 'its description is not saved as text' });
    else if (description.length > PRODUCT_LIMITS.descriptionMax)
      out.push({
        field: 'description',
        fixable: true,
        reason: `its description is longer than ${count(PRODUCT_LIMITS.descriptionMax)} characters`,
      });
  }

  const price = storedValue(p, 'price');
  const priceOk =
    typeof price === 'number' && Number.isFinite(price) && price >= PRODUCT_LIMITS.priceMin && price <= PRODUCT_LIMITS.priceMax;
  if (!priceOk)
    out.push({
      field: 'price',
      fixable: true,
      reason: `its price is not between ${formatMoney(PRODUCT_LIMITS.priceMin)} and ${formatMoney(PRODUCT_LIMITS.priceMax)}`,
    });

  const discount = storedValue(p, 'discountPrice');
  if (!isUnset(discount) && discount !== 0) {
    const discountOk =
      typeof discount === 'number' &&
      Number.isFinite(discount) &&
      discount >= PRODUCT_LIMITS.priceMin &&
      typeof price === 'number' &&
      discount < price;
    if (!discountOk)
      out.push({ field: 'discountPrice', fixable: true, reason: 'its sale price is not below its price' });
  }

  const currency = storedValue(p, 'currency');
  if (!isUnset(currency) && currency !== 'GHS')
    out.push({ field: 'currency', fixable: true, reason: 'its currency is not GHS' });

  const stock = storedValue(p, 'stockQuantity');
  if (!isUnset(stock) && !(Number.isInteger(stock) && (stock as number) >= 0 && (stock as number) <= PRODUCT_LIMITS.stockMax))
    out.push({
      field: 'stockQuantity',
      fixable: true,
      reason: `its stock is not a whole number between 0 and ${count(PRODUCT_LIMITS.stockMax)}`,
    });

  for (const [field, label] of [
    ['categoryId', 'category'],
    ['subCategoryId', 'subcategory'],
  ] as const) {
    const v = storedValue(p, field);
    if (!isUnset(v) && !(typeof v === 'string' && v.length <= PRODUCT_LIMITS.idMax))
      out.push({ field, fixable: true, reason: `its ${label} is not saved as GUGU expects` });
  }

  out.push(...listBlockers(p, 'imageUrls', 'photos'));
  out.push(...listBlockers(p, 'highlights', 'highlights'));
  out.push(...textBlockers(p, 'returnPolicy', 'return policy'));
  out.push(...textBlockers(p, 'supportNote', 'support note'));

  const related = storedValue(p, 'relatedProductIds');
  if (relatedProductIdsFix(p) !== null) {
    out.push({
      field: 'relatedProductIds',
      fixable: true,
      reason: Array.isArray(related)
        ? `it links to ${count(related.length)} related products and GUGU now allows ${PRODUCT_LIMITS.relatedMax}`
        : 'its related products are not saved as a list',
    });
  }

  // Not editable here: the form never writes these, so saving cannot clear them.
  const specs = storedValue(p, 'specifications');
  if (!isUnset(specs)) {
    if (typeof specs !== 'object' || Array.isArray(specs))
      out.push({ field: 'specifications', fixable: false, reason: 'its specifications are not saved as a table' });
    else if (Object.keys(specs as object).length > PRODUCT_LIMITS.specificationsMax)
      out.push({
        field: 'specifications',
        fixable: false,
        reason: `it has ${count(Object.keys(specs as object).length)} specifications and GUGU allows ${PRODUCT_LIMITS.specificationsMax}`,
      });
  }

  const storedId = storedValue(p, 'id');
  if (!isUnset(storedId) && !(typeof storedId === 'string' && storedId.length <= PRODUCT_LIMITS.idMax))
    out.push({ field: 'id', fixable: false, reason: 'its stored product ID is not saved as GUGU expects' });

  return out;
}

/** The blocker reasons, for a sentence that follows "because …". */
export const blockerReasons = (blockers: WriteBlocker[]) => blockers.map((b) => b.reason).join(', and ');

/** Merchant-facing names for the stored fields this form cannot edit. */
const FIELD_LABEL: Record<string, string> = {
  specifications: 'the specifications table',
  id: 'the stored product ID',
};

const listPhrase = (items: string[]) =>
  items.length < 2 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} or ${items[items.length - 1]}`;

const MONEY = /^\d{1,8}(\.\d{1,2})?$/;
const highlightCount = (v: string) => v.split('\n').filter((l) => l.trim()).length;

const schema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Enter a product name.')
      .max(PRODUCT_LIMITS.nameMax, 'Keep the name to 300 characters or fewer.'),
    description: z.string().trim().max(PRODUCT_LIMITS.descriptionMax, 'Keep the description to 10,000 characters or fewer.'),
    categoryId: z.string().min(1, 'Choose a category.'),
    subCategoryId: z.string().min(1, 'Choose a subcategory.'),
    price: z
      .string()
      .trim()
      .min(1, 'Enter a price.')
      .regex(MONEY, 'Enter an amount like 120 or 120.50.')
      .refine((v) => Number(v) >= PRODUCT_LIMITS.priceMin, 'Price must be at least GH₵0.01.')
      .refine((v) => Number(v) <= PRODUCT_LIMITS.priceMax, 'Price can be at most GH₵10,000,000.'),
    discountPrice: z
      .string()
      .trim()
      .refine((v) => v === '' || MONEY.test(v), 'Enter an amount like 99 or 99.90, or leave it empty.'),
    stockQuantity: z
      .string()
      .trim()
      .min(1, 'Enter how many you have in stock.')
      .regex(/^\d{1,6}$/, 'Enter a whole number, 0 or more.')
      .refine((v) => Number(v) <= PRODUCT_LIMITS.stockMax, 'Stock can be at most 100,000.'),
    highlights: z
      .string()
      .refine((v) => highlightCount(v) <= PRODUCT_LIMITS.listMax, 'Use at most 20 highlights.'),
    returnPolicy: z
      .string()
      .trim()
      .max(PRODUCT_LIMITS.textMax, 'Keep this to 2,000 characters or fewer.')
      .refine((v) => !CONTACT_INFO.test(v.toLowerCase()), CONTACT_MESSAGE),
    supportNote: z
      .string()
      .trim()
      .max(PRODUCT_LIMITS.textMax, 'Keep this to 2,000 characters or fewer.')
      .refine((v) => !CONTACT_INFO.test(v.toLowerCase()), CONTACT_MESSAGE),
  })
  .superRefine((v, ctx) => {
    // discountPrice: empty or 0 means no sale; otherwise 0.01 <= sale < price.
    if (v.discountPrice === '' || !MONEY.test(v.price) || !MONEY.test(v.discountPrice)) return;
    const sale = Number(v.discountPrice);
    if (sale === 0) return;
    if (sale < PRODUCT_LIMITS.priceMin)
      ctx.addIssue({ code: 'custom', path: ['discountPrice'], message: 'Sale price must be at least GH₵0.01, or 0 for no sale.' });
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
    supportNote: p?.supportNote ?? '',
  };
}

function toHighlights(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, PRODUCT_LIMITS.listMax);
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
  const blockers = useMemo(() => (product ? productWriteBlockers(product) : []), [product]);
  const fixable = blockers.filter((b) => b.fixable);
  const unfixable = blockers.filter((b) => !b.fixable);
  // A stored related-products list the rules refuse is repaired by this save;
  // there is nothing for the merchant to type first.
  const relatedFix = product ? relatedProductIdsFix(product) : null;
  // Content fields are only written as part of a content edit, so a blocker in
  // one of them has to force that write — otherwise saving leaves it in place.
  const contentBlocked = fixable.some((b) => CONTENT_FIELDS.includes(b.field));

  const willReview =
    !product ||
    contentBlocked ||
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
      // Sliced: a stored list already over the cap must come back under it, and
      // the picker only stops *new* images past the cap.
      const imageUrls = (await uploadPicked(images, `products/${merchantId}/${productId}`, setImages)).slice(
        0,
        PRODUCT_LIMITS.listMax
      );
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
        discountPrice: values.discountPrice && Number(values.discountPrice) > 0 ? Number(values.discountPrice) : null,
        currency: 'GHS',
        stockQuantity: Number(values.stockQuantity),
        returnPolicy: values.returnPolicy,
        supportNote: values.supportNote,
        // The rules check the merged document, so a list this form does not
        // otherwise touch would refuse the save. Repair it in the same write.
        ...(relatedFix ? { relatedProductIds: relatedFix } : {}),
        updatedAt: serverTimestamp(),
      };
      // Content edits (and new products) must go back to review, off the shelf, in the same write.
      const review = { approvalStatus: 'pending' as const, isActive: false };
      const ref = doc(firebase().db, 'products', productId);
      const needsReview = !product || contentChanged(product, content) || contentBlocked;
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
      const message = describeError(error, 'write');
      setSaveError(message);
      toast.error(editing ? `Changes not saved. ${message}` : `Product not added. ${message}`, { duration: 7000 });
    } finally {
      setSaving(false);
    }
  };

  const unfixableFields = Array.from(new Set(unfixable.map((b) => FIELD_LABEL[b.field] ?? b.field)));
  // What the save does to `relatedProductIds` on its own, so the banner can promise it.
  const relatedNote = !relatedFix
    ? null
    : relatedFix.length
      ? `keeps the first ${relatedFix.length} related ${relatedFix.length === 1 ? 'product' : 'products'} and drops the rest`
      : 'clears the related products GUGU could not read';
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
      {product && blockers.length ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-[var(--radius-panel)] border border-bad-700/25 bg-bad-50 px-4 py-3 text-[0.9375rem] text-bad-700"
        >
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>
            <strong className="font-semibold">GUGU will refuse any change to this product until it is fixed</strong>{' '}
            because {blockerReasons([...fixable, ...unfixable])}. That includes hiding or showing it.
            {fixable.length ? (
              <>
                {' '}
                Fix the fields below and save — that clears {unfixable.length ? 'those' : 'it'}.
                {relatedNote ? ` Saving also ${relatedNote}.` : ''}
              </>
            ) : null}
            {unfixable.length ? (
              <>
                {' '}
                This dashboard cannot edit {listPhrase(unfixableFields)}, so saving will not clear{' '}
                {unfixable.length === 1 ? 'that' : 'those'}. Contact GUGU support, quote this product&apos;s name, and
                ask staff to correct it.
              </>
            ) : null}
          </p>
        </div>
      ) : null}

      {product ? (
        <div className="flex items-start gap-3 rounded-[var(--radius-panel)] border border-thread-300 bg-thread-50 px-4 py-3 text-[0.9375rem] text-thread-800">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p aria-live="polite">
            Currently <StatusBadge status={product.approvalStatus ?? 'pending'} />.{' '}
            {contentBlocked ? (
              <strong className="font-semibold">
                Saving rewrites the details GUGU rejected, so the product goes back to GUGU staff for approval and is
                hidden from shoppers until then.
              </strong>
            ) : willReview && (isDirty || imagesChanged) ? (
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
          hint="Up to 20 JPG, PNG or WebP images, 5 MB each. The first image is the cover."
          max={PRODUCT_LIMITS.listMax}
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
          hint={salePreview !== null ? `Shoppers pay ${formatMoney(salePreview)}` : 'Optional. Lower than the price; leave empty or 0 for no sale.'}
        >
          {(p) => <Input {...p} inputMode="decimal" placeholder="None" className="tabular" {...register('discountPrice')} />}
        </Field>
        <Field label="In stock" required error={errors.stockQuantity?.message}>
          {(p) => <Input {...p} inputMode="numeric" placeholder="0" className="tabular" {...register('stockQuantity')} />}
        </Field>
      </Panel>

      <Panel title="Extra information" bodyClassName="grid gap-5 px-4 py-4 sm:px-5">
        <Field label="Highlights" hint="One per line, up to 20. Shown as bullet points." error={errors.highlights?.message}>
          {(p) => <Textarea {...p} rows={4} {...register('highlights')} />}
        </Field>
        <Field label="Return policy" hint="For example: Returns accepted within 7 days if unused." error={errors.returnPolicy?.message}>
          {(p) => <Input {...p} {...register('returnPolicy')} />}
        </Field>
        <Field
          label="Support note"
          hint="Shown to shoppers who need help with this product. No phone numbers, MoMo or WhatsApp — GUGU handles contact."
          error={errors.supportNote?.message}
        >
          {(p) => <Textarea {...p} rows={3} {...register('supportNote')} />}
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
        {/* Blockers this form repairs by itself are fixed by saving, with nothing to type first. */}
        <Button type="submit" loading={saving} disabled={editing && !isDirty && !imagesChanged && !fixable.length}>
          {saving ? 'Saving…' : !editing ? 'Add product' : willReview ? 'Save and send for approval' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
