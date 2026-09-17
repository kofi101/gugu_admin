'use client';


import { useId, type ComponentProps, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export const controlClass =
  'block w-full rounded-[var(--radius-control)] border border-line-strong bg-surface px-3 text-[0.9375rem] text-ink placeholder:text-ink-subtle transition-colors duration-150 hover:border-ink-subtle focus-visible:border-brand-600 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand-500 disabled:bg-ground disabled:text-ink-muted aria-[invalid=true]:border-bad-700';

type FieldProps = {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  children: (props: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }) => ReactNode;
};

/** Label + control + hint/error, wired with ids for assistive tech. */
export function Field({ label, hint, error, required, className, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
        {required ? (
          <span className="ml-0.5 text-bad-700" aria-hidden>
            *
          </span>
        ) : null}
      </label>
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
      {hint ? (
        <p id={hintId} className="text-[0.8125rem] text-ink-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-[0.8125rem] font-medium text-bad-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(controlClass, 'min-h-11', className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea className={cn(controlClass, 'min-h-24 py-2.5 leading-relaxed', className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<'select'>) {
  return (
    <select
      className={cn(
        controlClass,
        'min-h-11 appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2716%27%20height=%2716%27%20fill=%27none%27%20stroke=%27%234a626a%27%20stroke-width=%272%27%3E%3Cpath%20d=%27m4%206%204%204%204-4%27/%3E%3C/svg%3E")] bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-9',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Checkbox({ label, className, ...props }: ComponentProps<'input'> & { label: ReactNode }) {
  return (
    <label className={cn('inline-flex min-h-11 cursor-pointer items-center gap-2.5 text-[0.9375rem]', className)}>
      <input type="checkbox" className="size-4.5 accent-brand-700" {...props} />
      {label}
    </label>
  );
}
