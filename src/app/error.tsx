'use client';

import { ErrorState } from '@/components/ui/states';

export default function RootError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <h1 className="px-5 text-2xl font-bold sm:px-6">Something broke on this page</h1>
      <ErrorState error={error} onRetry={reset} title="The page failed to render" />
    </main>
  );
}
