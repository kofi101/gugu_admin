import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { FULFILMENT_STEPS, STATUS_LABEL, statusLabel } from '@/lib/orders';
import type { OrderStatusValue } from '@/lib/types';

/**
 * Fulfilment progress as a woven strip: each finished step is a filled band,
 * the current one carries the gold weft.
 */
export function StatusStrip({ status, ownPart }: { status: OrderStatusValue | undefined; ownPart?: boolean }) {
  // -1 for anything off the fulfilment path, including a status this build does
  // not know and an entry that records no status at all.
  const index = status ? (FULFILMENT_STEPS as string[]).indexOf(status) : -1;
  const offPath = index === -1;
  return (
    <div>
      <ol className="grid grid-cols-4 gap-1" aria-label="Fulfilment progress">
        {FULFILMENT_STEPS.map((step, i) => {
          const done = !offPath && i < index;
          const current = !offPath && i === index;
          return (
            <li key={step} className="flex min-w-0 flex-col gap-2" aria-current={current ? 'step' : undefined}>
              <span
                aria-hidden
                className={cn(
                  'relative h-2.5 overflow-hidden rounded-[3px]',
                  done && 'bg-brand-700',
                  current && 'bg-brand-900',
                  !done && !current && 'bg-line'
                )}
              >
                {current ? <span className="absolute inset-y-0 right-0 w-1/5 bg-thread-500" /> : null}
              </span>
              <span
                className={cn(
                  'flex items-center gap-1 truncate text-[0.8125rem]',
                  done || current ? 'font-semibold text-ink' : 'text-ink-subtle'
                )}
              >
                {done ? <Check className="size-3.5 shrink-0 text-brand-700" aria-hidden /> : null}
                {STATUS_LABEL[step]}
                {offPath ? null : (
                  <span className="sr-only">{done ? ' (done)' : current ? ' (current)' : ' (to do)'}</span>
                )}
              </span>
            </li>
          );
        })}
      </ol>
      {offPath ? (
        <p className="mt-3 text-sm text-ink-muted">
          {status ? (
            <>
              {ownPart ? 'Your part of this order is' : 'This order is'}{' '}
              <strong className="font-semibold text-ink">{statusLabel(status).toLowerCase()}</strong> and is not in
              fulfilment.
            </>
          ) : (
            <>
              {ownPart ? 'Your part of this order has' : 'This order has'}{' '}
              <strong className="font-semibold text-ink">no recorded status</strong>, so there is no next step to take.
              Contact GUGU support if it should be moving.
            </>
          )}
        </p>
      ) : null}
    </div>
  );
}
