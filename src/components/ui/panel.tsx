import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** A sewn strip: the page's content container, edge-seamed rather than floating. */
export function Panel({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
  as: Tag = 'section',
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  as?: 'section' | 'div';
}) {
  return (
    <Tag
      className={cn(
        'overflow-hidden rounded-[var(--radius-panel)] border border-line bg-surface shadow-[var(--shadow-panel)]',
        className
      )}
    >
      {title || actions ? (
        <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line px-4 py-3.5 sm:px-5">
          <div className="min-w-0">
            {title ? <h2 className="text-base font-semibold text-ink">{title}</h2> : null}
            {description ? <p className="mt-0.5 text-sm text-ink-muted">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}
      <div className={bodyClassName}>{children}</div>
    </Tag>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {back ? <div className="mb-3">{back}</div> : null}
        <h1 className="text-[1.625rem] leading-tight font-bold tracking-[-0.02em] text-balance text-ink sm:text-[1.875rem]">
          {title}
        </h1>
        {description ? <p className="mt-1.5 max-w-2xl text-[0.9375rem] text-ink-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function DefinitionList({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-[minmax(8rem,auto)_1fr]">
      {items.map((item) => (
        <div key={item.label} className="contents">
          <dt className="text-sm text-ink-muted">{item.label}</dt>
          <dd className="-mt-2.5 text-[0.9375rem] break-words text-ink sm:mt-0">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
