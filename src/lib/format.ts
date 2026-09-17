import type { Timestamp } from 'firebase/firestore';

const ghs = new Intl.NumberFormat('en-GH', {
  style: 'currency',
  currency: 'GHS',
});

/** The one currency formatter for the dashboard. */
export function formatMoney(value: number | null | undefined): string {
  return ghs.format(typeof value === 'number' && Number.isFinite(value) ? value : 0);
}

const dateFmt = new Intl.DateTimeFormat('en-GH', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const dateTimeFmt = new Intl.DateTimeFormat('en-GH', {
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
});

type TimeLike = Timestamp | Date | { seconds: number } | string | number | null | undefined;

export function toDate(value: TimeLike): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if ('toDate' in value && typeof value.toDate === 'function') return value.toDate();
  if ('seconds' in value) return new Date(value.seconds * 1000);
  return null;
}

export function formatDate(value: TimeLike): string {
  const d = toDate(value);
  return d ? dateFmt.format(d) : '—';
}

export function formatDateTime(value: TimeLike): string {
  const d = toDate(value);
  return d ? dateTimeFmt.format(d) : '—';
}

export function formatCount(n: number): string {
  return new Intl.NumberFormat('en-GH').format(n);
}

/** Turns ids like `greater_accra` into `Greater Accra`. */
export function titleize(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\p{L}/gu, (c) => c.toUpperCase());
}

export function humanize(value: string | null | undefined): string {
  if (!value) return '—';
  const s = value.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}
