'use client';

import { ArrowLeft, ImagePlus, RotateCw, Trash2 } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import { cn } from '@/lib/cn';
import { checkImage } from '@/lib/upload';

export type PickedImage =
  | { key: string; kind: 'existing'; url: string }
  | { key: string; kind: 'new'; file: File; preview: string; progress: number | null; error: string | null };

let counter = 0;
export const imageKey = () => `img-${Date.now()}-${counter++}`;

export function existingImages(urls: string[]): PickedImage[] {
  return urls.map((url) => ({ key: imageKey(), kind: 'existing', url }));
}

/**
 * Local selection of images with previews. Uploading happens on save so a
 * cancelled form leaves nothing behind in Storage.
 */
export function ImagePicker({
  value,
  onChange,
  onReject,
  max = 8,
  disabled,
  label,
  hint,
  error,
  single,
  onRetry,
}: {
  value: PickedImage[];
  onChange: (next: PickedImage[]) => void;
  onReject: (messages: string[]) => void;
  max?: number;
  disabled?: boolean;
  label: string;
  hint?: string;
  error?: string;
  single?: boolean;
  onRetry?: () => void;
}) {
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const inputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  });

  // Release object URLs on unmount.
  useEffect(
    () => () => {
      valueRef.current.forEach((img) => img.kind === 'new' && URL.revokeObjectURL(img.preview));
    },
    []
  );

  const add = (files: FileList | null) => {
    if (!files?.length) return;
    const rejected: string[] = [];
    const accepted: PickedImage[] = [];
    const room = single ? 1 : max - value.length;
    for (const file of Array.from(files)) {
      const problem = checkImage(file);
      if (problem) rejected.push(problem);
      else if (accepted.length >= room) rejected.push(`You can add up to ${max} images.`);
      else
        accepted.push({ key: imageKey(), kind: 'new', file, preview: URL.createObjectURL(file), progress: null, error: null });
    }
    if (rejected.length) onReject(Array.from(new Set(rejected)));
    if (accepted.length) {
      if (single) {
        value.forEach((img) => img.kind === 'new' && URL.revokeObjectURL(img.preview));
        onChange(accepted);
      } else onChange([...value, ...accepted]);
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const remove = (key: string) => {
    const img = value.find((i) => i.key === key);
    if (img?.kind === 'new') URL.revokeObjectURL(img.preview);
    onChange(value.filter((i) => i.key !== key));
  };

  const makeFirst = (key: string) => {
    const img = value.find((i) => i.key === key);
    if (!img) return;
    onChange([img, ...value.filter((i) => i.key !== key)]);
  };

  const full = single ? false : value.length >= max;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-ink" id={`${inputId}-label`}>
        {label}
      </span>
      {hint ? (
        <p id={hintId} className="-mt-1 text-[0.8125rem] text-ink-muted">
          {hint}
        </p>
      ) : null}
      <ul className={cn('grid gap-3', single ? 'grid-cols-[repeat(auto-fill,minmax(9rem,1fr))]' : 'grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))]')}>
        {value.map((img, i) => {
          const src = img.kind === 'existing' ? img.url : img.preview;
          const uploading = img.kind === 'new' && img.progress !== null && img.progress < 1 && !img.error;
          const failed = img.kind === 'new' && img.error;
          return (
            <li key={img.key} className="group relative">
              <div
                className={cn(
                  'relative aspect-square overflow-hidden rounded-lg bg-ground ring-1 ring-line ring-inset',
                  failed && 'ring-2 ring-bad-700'
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- local previews and Storage URLs */}
                <img src={src} alt="" className={cn('size-full object-cover', uploading && 'opacity-60')} />
                {!single && i === 0 ? (
                  <span className="absolute top-1.5 left-1.5 rounded bg-brand-900 px-1.5 py-0.5 text-xs font-semibold text-white">
                    Cover
                  </span>
                ) : null}
                {img.kind === 'new' && img.progress !== null && !img.error ? (
                  <span className="absolute inset-x-0 bottom-0 h-1.5 bg-white/70">
                    <span
                      className="block h-full bg-brand-700 transition-[width] duration-150"
                      style={{ width: `${Math.round(img.progress * 100)}%` }}
                    />
                  </span>
                ) : null}
              </div>
              {img.kind === 'new' && img.progress !== null && !img.error ? (
                <span className="sr-only" role="status">
                  Uploading {Math.round(img.progress * 100)}%
                </span>
              ) : null}
              {failed ? (
                <p className="mt-1 text-xs font-medium text-bad-700" role="alert">
                  Upload failed
                </p>
              ) : null}
              <div className="mt-1.5 flex gap-1">
                {!single && i > 0 ? (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => makeFirst(img.key)}
                    className="grid size-9 place-items-center rounded-md text-ink-muted ring-1 ring-line ring-inset hover:bg-brand-50 hover:text-ink disabled:opacity-50"
                  >
                    <ArrowLeft className="size-4" aria-hidden />
                    <span className="sr-only">Make image {i + 1} the cover</span>
                  </button>
                ) : null}
                {failed && onRetry ? (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={onRetry}
                    className="grid size-9 place-items-center rounded-md text-ink-muted ring-1 ring-line ring-inset hover:bg-brand-50 hover:text-ink disabled:opacity-50"
                  >
                    <RotateCw className="size-4" aria-hidden />
                    <span className="sr-only">Retry upload</span>
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => remove(img.key)}
                  className="grid size-9 place-items-center rounded-md text-bad-700 ring-1 ring-line ring-inset hover:bg-bad-50 disabled:opacity-50"
                >
                  <Trash2 className="size-4" aria-hidden />
                  <span className="sr-only">Remove image {i + 1}</span>
                </button>
              </div>
            </li>
          );
        })}
        {!full ? (
          <li>
            <label
              htmlFor={inputId}
              className={cn(
                'flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-line-strong bg-surface p-2 text-center text-sm font-semibold text-brand-700 transition-colors hover:border-brand-600 hover:bg-brand-50 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-500',
                disabled && 'pointer-events-none opacity-50',
                error && 'border-bad-700'
              )}
            >
              <ImagePlus className="size-6" aria-hidden />
              {single && value.length ? 'Replace' : 'Add image'}
              <input
                ref={inputRef}
                id={inputId}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple={!single}
                disabled={disabled}
                aria-describedby={[hint ? hintId : '', error ? errorId : ''].filter(Boolean).join(' ') || undefined}
                aria-labelledby={`${inputId}-label`}
                className="sr-only"
                onChange={(e) => add(e.target.files)}
              />
            </label>
          </li>
        ) : null}
      </ul>
      {error ? (
        <p id={errorId} role="alert" className="text-[0.8125rem] font-medium text-bad-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
