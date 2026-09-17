'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { ConfirmDialog, Dialog } from '@/components/ui/dialog';
import { Field, Input } from '@/components/ui/field';
import { PageHeader, Panel } from '@/components/ui/panel';
import { DataView, EmptyState } from '@/components/ui/states';
import { watchCategories, watchSubcategories } from '@/lib/data';
import { describeError } from '@/lib/errors';
import { firebase } from '@/lib/firebase';
import { mutate } from '@/lib/notify';
import type { Category, SubCategory } from '@/lib/types';
import { useLive } from '@/lib/use-data';
import { cn } from '@/lib/cn';

function slug(name: string) {
  return (
    name
      .toLowerCase()
      .normalize('NFKD')
      .replace(/\p{M}/gu, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 40) || 'item'
  );
}

async function freeId(col: 'categories' | 'subcategories', name: string) {
  const { db } = firebase();
  const base = slug(name);
  if (!(await getDoc(doc(db, col, base))).exists()) return base;
  return `${base}_${Math.random().toString(36).slice(2, 6)}`;
}

const schema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(60, 'Keep names under 60 characters.'),
  sortOrder: z
    .string()
    .trim()
    .refine((v) => v === '' || /^\d{1,4}$/.test(v), 'Use a whole number, or leave empty.'),
});
type Values = z.infer<typeof schema>;

type Editing =
  | { kind: 'category'; item?: Category }
  | { kind: 'subcategory'; categoryId: string; item?: SubCategory };

function NameDialog({ editing, onClose }: { editing: Editing; onClose: () => void }) {
  const isCategory = editing.kind === 'category';
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: editing.item?.name ?? '',
      sortOrder: isCategory && editing.item?.sortOrder != null ? String(editing.item.sortOrder) : '',
    },
  });

  const onSubmit = async (v: Values) => {
    const { db } = firebase();
    const label = isCategory ? 'Category' : 'Subcategory';
    try {
      await mutate(
        async () => {
          if (editing.kind === 'category') {
            const data = { name: v.name, sortOrder: v.sortOrder === '' ? null : Number(v.sortOrder) };
            if (editing.item) await updateDoc(doc(db, 'categories', editing.item.id), data);
            else {
              const id = await freeId('categories', v.name);
              await setDoc(doc(db, 'categories', id), { id, ...data });
            }
          } else if (editing.item) {
            await updateDoc(doc(db, 'subcategories', editing.item.id), { name: v.name });
          } else {
            const id = await freeId('subcategories', v.name);
            await setDoc(doc(db, 'subcategories', id), { id, categoryId: editing.categoryId, name: v.name });
          }
        },
        { success: editing.item ? `${label} renamed to ${v.name}.` : `${label} ${v.name} added.`, error: `${label} not saved.` }
      );
      onClose();
    } catch {
      /* toast shown; keep dialog open */
    }
  };

  const title = `${editing.item ? 'Edit' : 'Add'} ${isCategory ? 'category' : 'subcategory'}`;
  return (
    <Dialog
      open
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="catalog-form" loading={isSubmitting}>
            {editing.item ? 'Save' : 'Add'}
          </Button>
        </>
      }
    >
      <form id="catalog-form" onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <Field label="Name" required error={errors.name?.message}>
          {(p) => <Input {...p} data-autofocus {...register('name')} />}
        </Field>
        {isCategory ? (
          <Field label="Position" hint="Lower numbers show first in the app. Leave empty to sort by name." error={errors.sortOrder?.message}>
            {(p) => <Input {...p} inputMode="numeric" className="tabular" {...register('sortOrder')} />}
          </Field>
        ) : null}
      </form>
    </Dialog>
  );
}

export function Catalog() {
  const categories = useLive<Category[]>('categories', watchCategories);
  const subcategories = useLive<SubCategory[]>('subcategories', watchSubcategories);
  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [toDelete, setToDelete] = useState<{ kind: 'categories' | 'subcategories'; id: string; name: string } | null>(null);

  const activeId = selected ?? (categories.status === 'ready' ? (categories.data[0]?.id ?? null) : null);
  const active = categories.status === 'ready' ? categories.data.find((c) => c.id === activeId) : undefined;

  return (
    <>
      <PageHeader
        title="Categories"
        description="The shelves shoppers browse and sellers file products under."
        actions={
          <Button icon={<Plus aria-hidden />} onClick={() => setEditing({ kind: 'category' })}>
            Add category
          </Button>
        }
      />
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Panel title="Categories">
          <DataView result={categories} errorTitle="Categories could not be loaded">
            {(cats) =>
              cats.length === 0 ? (
                <EmptyState title="No categories yet">Add the first category so sellers can list products.</EmptyState>
              ) : (
                <ul className="divide-y divide-line">
                  {cats.map((c) => {
                    const count = subcategories.status === 'ready' ? subcategories.data.filter((s) => s.categoryId === c.id).length : null;
                    const isActive = c.id === activeId;
                    return (
                      <li key={c.id} className={cn('flex items-center gap-2 pr-2', isActive && 'bg-brand-50')}>
                        <button
                          type="button"
                          aria-pressed={isActive}
                          onClick={() => setSelected(c.id)}
                          className="flex min-h-12 min-w-0 flex-1 items-center justify-between gap-3 px-4 text-left focus-visible:-outline-offset-2 sm:px-5"
                        >
                          <span className={cn('truncate', isActive ? 'font-semibold text-brand-900' : 'font-medium')}>{c.name}</span>
                          <span className="shrink-0 text-sm text-ink-muted tabular">
                            {count === null ? '' : `${count} ${count === 1 ? 'subcategory' : 'subcategories'}`}
                          </span>
                        </button>
                        <Button variant="ghost" size="sm" onClick={() => setEditing({ kind: 'category', item: c })} icon={<Pencil aria-hidden />}>
                          <span className="sr-only">Edit {c.name}</span>
                        </Button>
                        <Button
                          variant="quiet-danger"
                          size="sm"
                          onClick={() => setToDelete({ kind: 'categories', id: c.id, name: c.name })}
                          icon={<Trash2 aria-hidden />}
                        >
                          <span className="sr-only">Delete {c.name}</span>
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )
            }
          </DataView>
        </Panel>

        <Panel
          title={active ? `Subcategories in ${active.name}` : 'Subcategories'}
          actions={
            active ? (
              <Button
                variant="secondary"
                size="sm"
                icon={<Plus aria-hidden />}
                onClick={() => setEditing({ kind: 'subcategory', categoryId: active.id })}
              >
                Add subcategory
              </Button>
            ) : null
          }
        >
          <DataView result={subcategories} errorTitle="Subcategories could not be loaded">
            {(subs) => {
              if (!active) return <EmptyState title="Choose a category">Its subcategories appear here.</EmptyState>;
              const list = subs.filter((s) => s.categoryId === active.id);
              if (list.length === 0)
                return (
                  <EmptyState title={`${active.name} has no subcategories`}>
                    Sellers need at least one subcategory to list products here.
                  </EmptyState>
                );
              return (
                <ul className="divide-y divide-line">
                  {list.map((s) => (
                    <li key={s.id} className="flex min-h-12 items-center gap-2 pr-2 pl-4 sm:pl-5">
                      <span className="flex-1 truncate font-medium">{s.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditing({ kind: 'subcategory', categoryId: active.id, item: s })}
                        icon={<Pencil aria-hidden />}
                      >
                        <span className="sr-only">Edit {s.name}</span>
                      </Button>
                      <Button
                        variant="quiet-danger"
                        size="sm"
                        onClick={() => setToDelete({ kind: 'subcategories', id: s.id, name: s.name })}
                        icon={<Trash2 aria-hidden />}
                      >
                        <span className="sr-only">Delete {s.name}</span>
                      </Button>
                    </li>
                  ))}
                </ul>
              );
            }}
          </DataView>
        </Panel>
      </div>

      {editing ? <NameDialog key={JSON.stringify(editing)} editing={editing} onClose={() => setEditing(null)} /> : null}

      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        title={`Delete ${toDelete?.name ?? ''}?`}
        description="Only empty categories can be deleted. Products filed under it must be moved first. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={async () => {
          if (!toDelete) return;
          const { db } = firebase();
          const field = toDelete.kind === 'categories' ? 'categoryId' : 'subCategoryId';
          try {
            const [products, subs] = await Promise.all([
              getCountFromServer(query(collection(db, 'products'), where(field, '==', toDelete.id))),
              toDelete.kind === 'categories'
                ? getCountFromServer(query(collection(db, 'subcategories'), where('categoryId', '==', toDelete.id)))
                : null,
            ]);
            const productCount = products.data().count;
            const subCount = subs?.data().count ?? 0;
            if (productCount > 0 || subCount > 0) {
              const parts = [
                productCount ? `${productCount} ${productCount === 1 ? 'product' : 'products'}` : '',
                subCount ? `${subCount} ${subCount === 1 ? 'subcategory' : 'subcategories'}` : '',
              ].filter(Boolean);
              toast.error(`${toDelete.name} still has ${parts.join(' and ')}. Move or delete them first.`, { duration: 7000 });
              throw new Error('not empty');
            }
          } catch (e) {
            if (e instanceof Error && e.message === 'not empty') throw e;
            toast.error(describeError(e));
            throw e;
          }
          await mutate(() => deleteDoc(doc(db, toDelete.kind, toDelete.id)), {
            success: `${toDelete.name} deleted.`,
            error: 'Not deleted.',
          });
          if (toDelete.id === selected) setSelected(null);
        }}
      />
    </>
  );
}
