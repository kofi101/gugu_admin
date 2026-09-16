import { Skeleton } from '@/components/ui/states';

export function AreaLoading() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-3 h-4 w-80 max-w-full" />
      <Skeleton className="mt-8 h-72 w-full rounded-xl" />
    </div>
  );
}
