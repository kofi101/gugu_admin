import type { Metadata } from 'next';
import { Wordmark } from '@/components/brand';
import { ButtonLink } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <div aria-hidden className="woven h-2" />
      <div className="px-4 pt-6 sm:px-8">
        <Wordmark area="Seller dashboard" />
      </div>
      <main className="flex flex-1 flex-col items-start justify-center gap-4 px-4 py-10 sm:mx-auto sm:w-full sm:max-w-lg">
        <h1 className="text-3xl font-bold tracking-[-0.02em]">This page does not exist</h1>
        <p className="text-ink-muted">The link may be old, or the page moved in the new dashboard.</p>
        <ButtonLink href="/">Go to your dashboard</ButtonLink>
      </main>
    </div>
  );
}
