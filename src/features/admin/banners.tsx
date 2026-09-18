'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Timestamp, collection, deleteDoc, doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog, Dialog } from '@/components/ui/dialog';
import { Field, Input, Select, Textarea } from '@/components/ui/field';
import { PageHeader, Panel } from '@/components/ui/panel';
import { DataView, EmptyState } from '@/components/ui/states';
import { useSignedIn } from '@/lib/auth';
import { watchBanners } from '@/lib/data';
import { firebase } from '@/lib/firebase';
import { formatDateTime, toDate } from '@/lib/format';
import { mutate } from '@/lib/notify';
import type { Banner } from '@/lib/types';
import { useLive } from '@/lib/use-data';

const HEX = /^#?([0-9a-f]{6}|[0-9a-f]{8})$/i;
const optHex = z.string().trim().refine((v) => v === '' || HEX.test(v), 'Use a colour like #086E8E.');

const schema = z
  .object({
    title: z.string().trim().min(2, 'Enter a title.').max(80, 'Keep the title under 80 characters.'),
    description: z.string().trim().max(200, 'Keep the description under 200 characters.'),
    status: z.enum(['show', 'hide']),
    priority: z.string().trim().regex(/^-?\d{1,4}$/, 'Use a whole number.'),
    prefixType: z.enum(['none', 'builtInIcon', 'image']),
    prefixIconName: z.string().trim().max(40),
    prefixImageUrl: z.string().trim().refine((v) => v === '' || /^https:\/\//.test(v), 'Use an https:// image link.'),
    backgroundColorHex: optHex,
    textColorHex: optHex,
    iconColorHex: optHex,
    actionKind: z.enum(['none', 'inAppRoute', 'externalUrl']),
    actionRoute: z.string().trim().max(200),
    actionUrl: z.string().trim(),
    startAt: z.string(),
    endAt: z.string(),
  })
  .superRefine((v, ctx) => {
    if (v.prefixType === 'builtInIcon' && !v.prefixIconName)
      ctx.addIssue({ code: 'custom', path: ['prefixIconName'], message: 'Enter the icon name the app knows, like truck.' });
    if (v.prefixType === 'image' && !v.prefixImageUrl)
      ctx.addIssue({ code: 'custom', path: ['prefixImageUrl'], message: 'Enter the image link.' });
    if (v.actionKind === 'inAppRoute' && !v.actionRoute.startsWith('/'))
      ctx.addIssue({ code: 'custom', path: ['actionRoute'], message: 'Enter an app route starting with /.' });
    if (v.actionKind === 'externalUrl' && !/^https:\/\/\S+$/.test(v.actionUrl))
      ctx.addIssue({ code: 'custom', path: ['actionUrl'], message: 'Enter a full https:// link.' });
    if (v.startAt && v.endAt && new Date(v.endAt) <= new Date(v.startAt))
      ctx.addIssue({ code: 'custom', path: ['endAt'], message: 'End must be after start.' });
  });
type Values = z.infer<typeof schema>;

const localInput = (ts: Banner['startAt']) => {
  const d = toDate(ts ?? null);
  if (!d) return '';
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
};
const hex = (v: string) => (v ? (v.startsWith('#') ? v : `#${v}`).toUpperCase() : null);

function defaults(b?: Banner): Values {
  return {
    title: b?.title ?? '',
    description: b?.description ?? '',
    status: b?.status ?? 'hide',
    priority: String(b?.priority ?? 0),
    prefixType: b?.prefixType ?? 'none',
    prefixIconName: b?.prefixIconName ?? '',
    prefixImageUrl: b?.prefixImageUrl ?? '',
    backgroundColorHex: b?.backgroundColorHex ?? '',
    textColorHex: b?.textColorHex ?? '',
    iconColorHex: b?.iconColorHex ?? '',
    actionKind: b?.actionKind ?? 'none',
    actionRoute: b?.actionRoute ?? '',
    actionUrl: b?.actionUrl ?? '',
    startAt: localInput(b?.startAt),
    endAt: localInput(b?.endAt),
  };
}

function BannerPreview({ title, description, bg, fg }: { title: string; description: string; bg: string; fg: string }) {
  const background = HEX.test(bg) ? hex(bg)!.slice(0, 7) : '#EEF8FB';
  const color = HEX.test(fg) ? hex(fg)!.slice(0, 7) : '#0F2830';
  return (
    <div aria-hidden className="rounded-lg px-4 py-3" style={{ background, color }}>
      <p className="font-semibold">{title || 'Banner title'}</p>
      {description ? <p className="text-sm opacity-90">{description}</p> : null}
    </div>
  );
}

function BannerDialog({ banner, onClose }: { banner?: Banner; onClose: () => void }) {
  const { user } = useSignedIn();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: defaults(banner) });
  const [title, description, bg, fg, prefixType, actionKind] = useWatch({
    control,
    name: ['title', 'description', 'backgroundColorHex', 'textColorHex', 'prefixType', 'actionKind'],
  });

  const onSubmit = async (v: Values) => {
    const { db } = firebase();
    const data = {
      title: v.title,
      description: v.description || null,
      status: v.status,
      placement: 'homeTop' as const,
      priority: Number(v.priority),
      prefixType: v.prefixType,
      prefixIconName: v.prefixType === 'builtInIcon' ? v.prefixIconName : null,
      prefixImageUrl: v.prefixType === 'image' ? v.prefixImageUrl : null,
      backgroundColorHex: hex(v.backgroundColorHex),
      textColorHex: hex(v.textColorHex),
      iconColorHex: hex(v.iconColorHex),
      actionKind: v.actionKind,
      actionRoute: v.actionKind === 'inAppRoute' ? v.actionRoute : null,
      actionUrl: v.actionKind === 'externalUrl' ? v.actionUrl : null,
      startAt: v.startAt ? Timestamp.fromDate(new Date(v.startAt)) : null,
      endAt: v.endAt ? Timestamp.fromDate(new Date(v.endAt)) : null,
      updatedAt: serverTimestamp(),
    };
    try {
      await mutate(
        async () => {
          if (banner) await updateDoc(doc(db, 'banners', banner.id), data);
          else {
            const ref = doc(collection(db, 'banners'));
            await setDoc(ref, { ...data, id: ref.id, createdById: user.uid, createdAt: serverTimestamp() });
          }
        },
        { success: banner ? 'Banner saved.' : 'Banner added.', error: 'Banner not saved.', context: 'write' }
      );
      onClose();
    } catch {
      /* toast shown */
    }
  };

  return (
    <Dialog
      open
      size="lg"
      onClose={onClose}
      title={banner ? 'Edit banner' : 'Add banner'}
      description="Shown at the top of the GUGU app home screen."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="banner-form" loading={isSubmitting}>
            {banner ? 'Save banner' : 'Add banner'}
          </Button>
        </>
      }
    >
      <form id="banner-form" onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <BannerPreview title={title} description={description} bg={bg} fg={fg} />
        </div>
        <Field label="Title" required error={errors.title?.message} className="sm:col-span-2">
          {(p) => <Input {...p} {...register('title')} />}
        </Field>
        <Field label="Description" error={errors.description?.message} className="sm:col-span-2">
          {(p) => <Textarea {...p} rows={2} {...register('description')} />}
        </Field>
        <Field label="Visibility" error={errors.status?.message}>
          {(p) => (
            <Select {...p} {...register('status')}>
              <option value="show">Show</option>
              <option value="hide">Hide</option>
            </Select>
          )}
        </Field>
        <Field label="Priority" hint="Higher shows first." error={errors.priority?.message}>
          {(p) => <Input {...p} inputMode="numeric" className="tabular" {...register('priority')} />}
        </Field>
        <Field label="Starts" hint="Optional." error={errors.startAt?.message}>
          {(p) => <Input {...p} type="datetime-local" {...register('startAt')} />}
        </Field>
        <Field label="Ends" hint="Optional." error={errors.endAt?.message}>
          {(p) => <Input {...p} type="datetime-local" {...register('endAt')} />}
        </Field>
        <Field label="Leading visual" error={errors.prefixType?.message}>
          {(p) => (
            <Select {...p} {...register('prefixType')}>
              <option value="none">None</option>
              <option value="builtInIcon">App icon</option>
              <option value="image">Image link</option>
            </Select>
          )}
        </Field>
        {prefixType === 'builtInIcon' ? (
          <Field label="Icon name" error={errors.prefixIconName?.message}>
            {(p) => <Input {...p} placeholder="truck" {...register('prefixIconName')} />}
          </Field>
        ) : prefixType === 'image' ? (
          <Field label="Image link" error={errors.prefixImageUrl?.message}>
            {(p) => <Input {...p} type="url" placeholder="https://" {...register('prefixImageUrl')} />}
          </Field>
        ) : (
          <div className="hidden sm:block" />
        )}
        <Field label="Background colour" error={errors.backgroundColorHex?.message}>
          {(p) => <Input {...p} placeholder="#EEF8FB" {...register('backgroundColorHex')} />}
        </Field>
        <Field label="Text colour" error={errors.textColorHex?.message}>
          {(p) => <Input {...p} placeholder="#0F2830" {...register('textColorHex')} />}
        </Field>
        <Field label="Icon colour" error={errors.iconColorHex?.message}>
          {(p) => <Input {...p} placeholder="#086E8E" {...register('iconColorHex')} />}
        </Field>
        <Field label="When tapped" error={errors.actionKind?.message}>
          {(p) => (
            <Select {...p} {...register('actionKind')}>
              <option value="none">Do nothing</option>
              <option value="inAppRoute">Open an app screen</option>
              <option value="externalUrl">Open a web link</option>
            </Select>
          )}
        </Field>
        {actionKind === 'inAppRoute' ? (
          <Field label="App route" error={errors.actionRoute?.message} className="sm:col-span-2">
            {(p) => <Input {...p} placeholder="/categories" {...register('actionRoute')} />}
          </Field>
        ) : null}
        {actionKind === 'externalUrl' ? (
          <Field label="Web link" error={errors.actionUrl?.message} className="sm:col-span-2">
            {(p) => <Input {...p} type="url" placeholder="https://" {...register('actionUrl')} />}
          </Field>
        ) : null}
      </form>
    </Dialog>
  );
}

export function Banners() {
  const result = useLive<Banner[]>('banners', watchBanners);
  const [editing, setEditing] = useState<{ banner?: Banner } | null>(null);
  const [toDelete, setToDelete] = useState<Banner | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const toggle = async (b: Banner) => {
    setToggling(b.id);
    const next = b.status === 'show' ? 'hide' : 'show';
    try {
      await mutate(() => updateDoc(doc(firebase().db, 'banners', b.id), { status: next, updatedAt: serverTimestamp() }), {
        success: next === 'show' ? `${b.title} is showing.` : `${b.title} is hidden.`,
        error: 'Banner not updated.',
        context: 'write',
      });
    } catch {
      /* toast shown */
    } finally {
      setToggling(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Banners"
        description="Promotions at the top of the app home screen."
        actions={
          <Button icon={<Plus aria-hidden />} onClick={() => setEditing({})}>
            Add banner
          </Button>
        }
      />
      <Panel>
        <DataView result={result} errorTitle="Banners could not be loaded">
          {(banners) =>
            banners.length === 0 ? (
              <EmptyState title="No banners">Add one to announce free delivery, a sale or a new category.</EmptyState>
            ) : (
              <ul className="divide-y divide-line">
                {banners.map((b) => (
                  <li key={b.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
                    <div className="min-w-0 sm:w-72">
                      <BannerPreview title={b.title} description={b.description ?? ''} bg={b.backgroundColorHex ?? ''} fg={b.textColorHex ?? ''} />
                    </div>
                    <div className="min-w-0 flex-1 text-sm text-ink-muted">
                      <p>
                        Priority <span className="tabular">{b.priority ?? 0}</span>
                      </p>
                      <p>
                        {b.startAt || b.endAt
                          ? `${b.startAt ? formatDateTime(b.startAt) : 'Now'} to ${b.endAt ? formatDateTime(b.endAt) : 'no end date'}`
                          : 'No schedule'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-2 sm:justify-end">
                      <StatusBadge status={b.status} label={b.status === 'show' ? 'Showing' : 'Hidden'} />
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          loading={toggling === b.id}
                          icon={b.status === 'show' ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
                          onClick={() => toggle(b)}
                        >
                          {b.status === 'show' ? 'Hide' : 'Show'}
                          <span className="sr-only"> {b.title}</span>
                        </Button>
                        <Button variant="ghost" size="sm" icon={<Pencil aria-hidden />} onClick={() => setEditing({ banner: b })}>
                          Edit<span className="sr-only"> {b.title}</span>
                        </Button>
                        <Button variant="quiet-danger" size="sm" icon={<Trash2 aria-hidden />} onClick={() => setToDelete(b)}>
                          <span className="sr-only">Delete {b.title}</span>
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )
          }
        </DataView>
      </Panel>

      {editing ? <BannerDialog key={editing.banner?.id ?? 'new'} banner={editing.banner} onClose={() => setEditing(null)} /> : null}

      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        title={`Delete ${toDelete?.title ?? 'banner'}?`}
        description="It disappears from the app straight away. To pause it instead, hide it. This cannot be undone."
        confirmLabel="Delete banner"
        onConfirm={async () => {
          const b = toDelete;
          if (!b) return;
          await mutate(() => deleteDoc(doc(firebase().db, 'banners', b.id)), {
            success: `${b.title} deleted.`,
            error: 'Banner not deleted.',
            context: 'write',
          });
        }}
      />
    </>
  );
}
