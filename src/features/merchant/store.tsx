'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Field, Input, Textarea } from '@/components/ui/field';
import { ImagePicker, existingImages, type PickedImage } from '@/components/ui/image-picker';
import { PageHeader, Panel } from '@/components/ui/panel';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { useMerchantId } from '@/lib/auth';
import { watchMerchant } from '@/lib/data';
import { describeError } from '@/lib/errors';
import { firebase } from '@/lib/firebase';
import { searchTokens } from '@/lib/search-tokens';
import type { Merchant } from '@/lib/types';
import { uploadPicked } from '@/lib/upload-picked';
import { useLive } from '@/lib/use-data';

const schema = z.object({
  name: z.string().trim().min(2, 'Store name must be at least 2 characters.').max(80, 'Keep the name under 80 characters.'),
  tagline: z.string().trim().max(120, 'Keep the tagline under 120 characters.'),
  description: z.string().trim().max(2000, 'Keep the description under 2,000 characters.'),
});
type Values = z.infer<typeof schema>;

function StoreForm({ merchant }: { merchant: Merchant }) {
  const merchantId = useMerchantId();
  const [logo, setLogo] = useState<PickedImage[]>(() => existingImages(merchant.logoUrl ? [merchant.logoUrl] : []));
  const [cover, setCover] = useState<PickedImage[]>(() =>
    existingImages(merchant.coverImageUrl ? [merchant.coverImageUrl] : [])
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: merchant.name ?? '', tagline: merchant.tagline ?? '', description: merchant.description ?? '' },
  });

  const imageDirty =
    logo.some((i) => i.kind === 'new') ||
    cover.some((i) => i.kind === 'new') ||
    (logo[0]?.kind === 'existing' ? logo[0].url : '') !== (merchant.logoUrl ?? '') ||
    (cover[0]?.kind === 'existing' ? cover[0].url : '') !== (merchant.coverImageUrl ?? '');

  const onSubmit = async (values: Values) => {
    setSaving(true);
    setSaveError(null);
    try {
      const folder = `merchants/${merchantId}/branding`;
      const [logoUrl] = await uploadPicked(logo, folder, setLogo);
      const [coverImageUrl] = await uploadPicked(cover, folder, setCover);
      // Only the fields the contract lets a merchant change.
      await updateDoc(doc(firebase().db, 'merchants', merchantId), {
        name: values.name,
        tagline: values.tagline,
        description: values.description,
        logoUrl: logoUrl ?? '',
        coverImageUrl: coverImageUrl ?? '',
        advanceSearchableValues: searchTokens(values.name),
        updatedAt: serverTimestamp(),
      });
      reset(values);
      toast.success('Store profile saved.');
    } catch (error) {
      const message = describeError(error);
      setSaveError(message);
      toast.error(`Store profile not saved. ${message}`, { duration: 7000 });
    } finally {
      setSaving(false);
    }
  };

  const reject = (messages: string[]) => messages.forEach((m) => toast.error(m, { duration: 6000 }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <Panel title="Store details" bodyClassName="grid gap-5 px-4 py-4 sm:px-5">
        <Field label="Store name" required error={errors.name?.message}>
          {(p) => <Input {...p} {...register('name')} autoComplete="organization" />}
        </Field>
        <Field label="Tagline" hint="One short line under your store name." error={errors.tagline?.message}>
          {(p) => <Input {...p} {...register('tagline')} />}
        </Field>
        <Field label="About your store" error={errors.description?.message}>
          {(p) => <Textarea {...p} rows={5} {...register('description')} />}
        </Field>
      </Panel>
      <Panel title="Branding" bodyClassName="grid gap-6 px-4 py-4 sm:grid-cols-2 sm:px-5">
        <ImagePicker
          single
          label="Logo"
          hint="Square works best. JPG, PNG or WebP, up to 5 MB."
          value={logo}
          onChange={setLogo}
          onReject={reject}
          disabled={saving}
        />
        <ImagePicker
          single
          label="Cover image"
          hint="Wide image shown at the top of your store page. Up to 5 MB."
          value={cover}
          onChange={setCover}
          onReject={reject}
          disabled={saving}
        />
      </Panel>
      {saveError ? (
        <p role="alert" className="rounded-lg border border-bad-700/25 bg-bad-50 px-4 py-3 text-[0.9375rem] text-bad-700">
          {saveError}
        </p>
      ) : null}
      <div className="flex justify-end">
        <Button type="submit" loading={saving} disabled={!isDirty && !imageDirty}>
          Save store profile
        </Button>
      </div>
    </form>
  );
}

export function StoreProfile() {
  const merchantId = useMerchantId();
  const result = useLive<Merchant | null>(`merchant:${merchantId}`, (next, fail) => watchMerchant(merchantId, next, fail));
  const [initial, setInitial] = useState<Merchant | null>(null);
  if (!initial && result.status === 'ready' && result.data) setInitial(result.data);

  return (
    <>
      <PageHeader title="Store profile" description="How your store appears to shoppers in the GUGU app and on the web." />
      {result.status === 'error' ? (
        <Panel>
          <ErrorState error={result.error} onRetry={result.retry} title="Your store could not be loaded" />
        </Panel>
      ) : result.status === 'ready' && !result.data ? (
        <Panel>
          <EmptyState title="Your store record is missing">
            Your seller account is approved but has no store record. Contact GUGU support so staff can restore it.
          </EmptyState>
        </Panel>
      ) : initial ? (
        <StoreForm merchant={initial} />
      ) : (
        <div role="status">
          <span className="sr-only">Loading store…</span>
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      )}
    </>
  );
}
