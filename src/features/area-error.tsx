'use client';

import { PageHeader, Panel } from '@/components/ui/panel';
import { ErrorState } from '@/components/ui/states';

export function AreaError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <>
      <PageHeader title="Something went wrong" />
      <Panel>
        <ErrorState error={error} onRetry={reset} title="This page failed to render" />
      </Panel>
    </>
  );
}
