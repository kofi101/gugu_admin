import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { humanize } from '@/lib/format';

export type Tone = 'neutral' | 'brand' | 'pending' | 'ok' | 'bad';

const tones: Record<Tone, string> = {
  neutral: 'bg-ground text-ink-muted ring-line-strong',
  brand: 'bg-brand-50 text-brand-800 ring-brand-200',
  pending: 'bg-thread-50 text-thread-800 ring-thread-300',
  ok: 'bg-ok-50 text-ok-700 ring-[#a9dcbf]',
  bad: 'bg-bad-50 text-bad-700 ring-[#f5b7b1]',
};

const dots: Record<Tone, string> = {
  neutral: 'bg-ink-subtle',
  brand: 'bg-brand-600',
  pending: 'bg-thread-500',
  ok: 'bg-ok-700',
  bad: 'bg-bad-700',
};

export function Badge({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.8125rem] font-semibold whitespace-nowrap ring-1 ring-inset',
        tones[tone],
        className
      )}
    >
      <span aria-hidden className={cn('size-1.5 rounded-full', dots[tone])} />
      {children}
    </span>
  );
}

const statusTones: Record<string, Tone> = {
  awaiting_payment: 'pending',
  placed: 'brand',
  processing: 'brand',
  shipped: 'brand',
  delivered: 'ok',
  cancelled: 'neutral',
  payment_failed: 'bad',
  pending: 'pending',
  approved: 'ok',
  rejected: 'bad',
  paid: 'ok',
  unpaid: 'neutral',
  failed: 'bad',
  show: 'ok',
  hide: 'neutral',
};

export function StatusBadge({ status, label }: { status: string | undefined; label?: string }) {
  const key = status ?? 'unknown';
  return <Badge tone={statusTones[key] ?? 'neutral'}>{label ?? humanize(key)}</Badge>;
}
