'use client';

import { AlertTriangle, RotateCw } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { describeError } from '@/lib/errors';
import type { DataResult } from '@/lib/use-data';
import { Button } from './button';

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-shimmer rounded-md bg-line/70', className)} />;
}

/** Row-shaped placeholder that mirrors a list while it loads. */
export function ListSkeleton({ rows = 5, label = 'Loading' }: { rows?: number; label?: string }) {
  return (
    <div role="status" aria-live="polite" className="divide-y divide-line">
      <span className="sr-only">{label}…</span>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5 sm:px-5">
          <Skeleton className="size-11 shrink-0 rounded-lg" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="hidden h-6 w-20 rounded-full sm:block" />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({
  error,
  onRetry,
  title = 'This could not be loaded',
  className,
}: {
  error: unknown;
  onRetry?: () => void;
  title?: string;
  className?: string;
}) {
  return (
    <div role="alert" className={cn('flex flex-col items-start gap-3 px-5 py-8 sm:px-6', className)}>
      <div className="flex items-center gap-2 font-semibold text-bad-700">
        <AlertTriangle className="size-5" aria-hidden />
        {title}
      </div>
      <p className="max-w-prose text-[0.9375rem] text-ink-muted">{describeError(error)}</p>
      {onRetry ? (
        <Button variant="secondary" size="sm" icon={<RotateCw aria-hidden />} onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  children,
  action,
  icon,
  className,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-start gap-2 px-5 py-10 sm:px-6', className)}>
      {icon ? <div className="mb-1 text-brand-700 [&_svg]:size-6">{icon}</div> : null}
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      {children ? <div className="max-w-prose text-[0.9375rem] text-ink-muted">{children}</div> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

/** Renders loading / error+retry / ready for a data result. */
export function DataView<T>({
  result,
  loading,
  errorTitle,
  children,
}: {
  result: DataResult<T>;
  loading?: ReactNode;
  errorTitle?: string;
  children: (data: T) => ReactNode;
}) {
  if (result.status === 'loading') return <>{loading ?? <ListSkeleton />}</>;
  if (result.status === 'error')
    return <ErrorState error={result.error} onRetry={result.retry} title={errorTitle} />;
  return <>{children(result.data)}</>;
}
