import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'quiet-danger';
type Size = 'sm' | 'md';

const base =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] font-semibold whitespace-nowrap transition-[background-color,border-color,color,box-shadow] duration-150 disabled:cursor-not-allowed disabled:opacity-55 [&_svg]:size-4 [&_svg]:shrink-0';

const variants: Record<Variant, string> = {
  primary:
    'bg-brand-700 text-white shadow-[0_1px_0_rgb(4_47_61/0.25)] hover:bg-brand-800 active:bg-brand-900',
  secondary:
    'border border-line-strong bg-surface text-ink hover:border-brand-600 hover:bg-brand-50 active:bg-brand-100',
  ghost: 'text-ink-muted hover:bg-brand-50 hover:text-ink active:bg-brand-100',
  danger: 'bg-bad-700 text-white hover:bg-[#921c13] active:bg-[#7a170f]',
  'quiet-danger': 'text-bad-700 hover:bg-bad-50',
};

const sizes: Record<Size, string> = {
  sm: 'min-h-9 px-3 text-sm',
  md: 'min-h-11 px-4 text-[0.9375rem]',
};

type Common = { variant?: Variant; size?: Size; icon?: ReactNode };

export function buttonClass({ variant = 'primary', size = 'md' }: Common = {}, className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant,
  size,
  icon,
  loading,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ComponentProps<'button'> & Common & { loading?: boolean }) {
  return (
    <button
      type={type}
      className={buttonClass({ variant, size }, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Loader2 className="animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  icon,
  className,
  children,
  ...rest
}: ComponentProps<typeof Link> & Common) {
  return (
    <Link className={buttonClass({ variant, size }, className)} {...rest}>
      {icon}
      {children}
    </Link>
  );
}
