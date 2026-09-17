'use client';

import { Search } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import { controlClass } from './field';

export type FilterOption<T extends string> = { value: T; label: string; count?: number };

/** Segmented filter. Buttons with aria-pressed so screen readers hear the state. */
export function FilterTabs<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div role="group" aria-label={label} className={cn('-mx-1 flex gap-1 overflow-x-auto px-1 pb-1', className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-colors duration-150',
              active
                ? 'bg-brand-900 text-white'
                : 'bg-surface text-ink-muted ring-1 ring-line-strong ring-inset hover:bg-brand-50 hover:text-ink'
            )}
          >
            {o.label}
            {typeof o.count === 'number' ? (
              <span className={cn('tabular text-[0.8125rem]', active ? 'text-brand-200' : 'text-ink-subtle')}>
                {o.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function SearchInput({ className, label, ...props }: ComponentProps<'input'> & { label: string }) {
  return (
    <label className={cn('relative block', className)}>
      <span className="sr-only">{label}</span>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden />
      <input type="search" className={cn(controlClass, 'min-h-10 pl-9')} {...props} />
    </label>
  );
}

export function Thumb({ src, alt = '', className }: { src?: string; alt?: string; className?: string }) {
  return (
    <span
      className={cn(
        'block size-11 shrink-0 overflow-hidden rounded-lg bg-brand-50 ring-1 ring-line ring-inset',
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- static export, Storage URLs
        <img src={src} alt={alt} className="size-full object-cover" loading="lazy" />
      ) : (
        <span aria-hidden className="woven block size-full opacity-25" />
      )}
    </span>
  );
}
