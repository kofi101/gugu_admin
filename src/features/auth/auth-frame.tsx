import type { ReactNode } from 'react';
import { Wordmark } from '@/components/brand';

/** Sign-in family layout: a woven brand column beside a quiet form. */
export function AuthFrame({ title, intro, children }: { title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-brand-900 p-10 text-white lg:flex">
        <Wordmark area="Seller dashboard" inverse />
        <div className="max-w-sm">
          <p className="text-[2rem] leading-[1.15] font-bold tracking-[-0.02em] text-balance">
            List it, get it approved, get it delivered.
          </p>
          <p className="mt-4 text-[1.0625rem] leading-relaxed text-brand-100">
            Manage your products, orders and store for shoppers across Ghana on the GUGU app and web.
          </p>
        </div>
        <p className="text-sm text-brand-200">GUGU staff and approved sellers only.</p>
        <div aria-hidden className="woven absolute inset-x-0 bottom-0 h-3" />
      </aside>
      <main className="flex flex-col">
        <div aria-hidden className="woven h-2 lg:hidden" />
        <div className="px-4 pt-6 sm:px-8 lg:hidden">
          <Wordmark area="Seller dashboard" />
        </div>
        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-[25rem]">
            <h1 className="text-[1.75rem] leading-tight font-bold tracking-[-0.02em]">{title}</h1>
            {intro ? <div className="mt-2 text-[0.9375rem] text-ink-muted">{intro}</div> : null}
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
