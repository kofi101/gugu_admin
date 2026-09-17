'use client';

import { getDownloadURL, ref } from 'firebase/storage';
import { Check, FileText, X } from 'lucide-react';
import { useState } from 'react';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/dialog';
import { FilterTabs } from '@/components/ui/filters';
import { DefinitionList, PageHeader, Panel } from '@/components/ui/panel';
import { DataView, EmptyState, ListSkeleton } from '@/components/ui/states';
import { reviewMerchantApplication, watchApplications } from '@/lib/data';
import { describeError } from '@/lib/errors';
import { firebase } from '@/lib/firebase';
import { formatDate, titleize } from '@/lib/format';
import { mutate } from '@/lib/notify';
import type { MerchantApplication } from '@/lib/types';
import { useLive } from '@/lib/use-data';

type Status = MerchantApplication['status'];

function DocumentLink({ value, index }: { value: string; index: number }) {
  const [error, setError] = useState<string | null>(null);
  const label = `Document ${index + 1}`;
  if (/^https?:\/\//.test(value)) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-9 items-center gap-1.5 font-medium text-brand-700 underline-offset-4 hover:underline"
      >
        <FileText className="size-4" aria-hidden />
        {label}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  // A Storage path rather than a download URL: resolve on demand (admin read rule).
  return (
    <span className="inline-flex flex-col">
      <button
        type="button"
        className="inline-flex min-h-9 items-center gap-1.5 font-medium text-brand-700 underline-offset-4 hover:underline"
        onClick={async () => {
          setError(null);
          try {
            const url = await getDownloadURL(ref(firebase().storage, value));
            window.open(url, '_blank', 'noopener,noreferrer');
          } catch (e) {
            setError(describeError(e));
          }
        }}
      >
        <FileText className="size-4" aria-hidden />
        {label}
      </button>
      {error ? <span className="text-sm text-bad-700">{error}</span> : null}
    </span>
  );
}

export function Applications() {
  const [status, setStatus] = useState<Status>('pending');
  const [action, setAction] = useState<{ app: MerchantApplication; decision: 'approve' | 'reject' } | null>(null);
  const result = useLive<MerchantApplication[]>(`applications:${status}`, (next, fail) => watchApplications(status, next, fail));

  return (
    <>
      <PageHeader
        title="Seller applications"
        description="People who asked to sell on GUGU. Approving creates their store and gives their account seller access."
      />
      <FilterTabs
        className="mb-4"
        label="Filter applications"
        value={status}
        onChange={setStatus}
        options={[
          { value: 'pending', label: 'To review' },
          { value: 'approved', label: 'Approved' },
          { value: 'rejected', label: 'Rejected' },
        ]}
      />
      <DataView
        result={result}
        errorTitle="Applications could not be loaded"
        loading={
          <Panel>
            <ListSkeleton rows={3} label="Loading applications" />
          </Panel>
        }
      >
        {(apps) =>
          apps.length === 0 ? (
            <Panel>
              <EmptyState title={status === 'pending' ? 'No applications waiting' : `No ${status} applications`}>
                {status === 'pending' ? 'New Sell on GUGU applications appear here as soon as they are submitted.' : null}
              </EmptyState>
            </Panel>
          ) : (
            <ul className="flex flex-col gap-4">
              {apps.map((app) => (
                <li key={app.uid}>
                  <Panel
                    title={app.businessName || 'Unnamed business'}
                    description={`Applied ${formatDate(app.createdAt)}`}
                    actions={
                      app.status === 'pending' ? (
                        <>
                          <Button variant="secondary" icon={<X aria-hidden />} onClick={() => setAction({ app, decision: 'reject' })}>
                            Reject
                          </Button>
                          <Button icon={<Check aria-hidden />} onClick={() => setAction({ app, decision: 'approve' })}>
                            Approve
                          </Button>
                        </>
                      ) : (
                        <StatusBadge status={app.status} />
                      )
                    }
                    bodyClassName="px-4 py-4 sm:px-5"
                  >
                    <DefinitionList
                      items={[
                        { label: 'Email', value: app.email || '—' },
                        { label: 'Phone', value: app.phone || '—' },
                        { label: 'Location', value: [titleize(app.cityId), titleize(app.regionId)].filter(Boolean).join(', ') || '—' },
                        { label: 'About the business', value: app.description || '—' },
                        {
                          label: 'Documents',
                          value: app.documentUrls?.length ? (
                            <span className="flex flex-wrap gap-x-4">
                              {app.documentUrls.map((d, i) => (
                                <DocumentLink key={d} value={d} index={i} />
                              ))}
                            </span>
                          ) : (
                            'None uploaded'
                          ),
                        },
                        ...(app.merchantId ? [{ label: 'Store ID', value: <code className="text-sm">{app.merchantId}</code> }] : []),
                        ...(app.reviewNote ? [{ label: 'Review note', value: app.reviewNote }] : []),
                        { label: 'Account ID', value: <code className="text-sm break-all">{app.uid}</code> },
                      ]}
                    />
                  </Panel>
                </li>
              ))}
            </ul>
          )
        }
      </DataView>

      <ConfirmDialog
        open={action !== null}
        onClose={() => setAction(null)}
        tone={action?.decision === 'approve' ? 'primary' : 'danger'}
        title={action?.decision === 'approve' ? `Approve ${action.app.businessName}?` : `Reject ${action?.app.businessName ?? ''}?`}
        description={
          action?.decision === 'approve'
            ? 'This creates their GUGU store and gives the account seller access. For security the applicant is signed out everywhere and must sign in again to see the seller dashboard.'
            : 'The applicant keeps a shopper account. Tell them what to fix if they can reapply.'
        }
        confirmLabel={action?.decision === 'approve' ? 'Approve and create store' : 'Reject application'}
        withNote
        noteRequired={action?.decision === 'reject'}
        noteLabel={action?.decision === 'reject' ? 'Reason' : 'Note (optional)'}
        onConfirm={async (note) => {
          if (!action) return;
          const { app, decision } = action;
          await mutate(() => reviewMerchantApplication({ uid: app.uid, decision, note: note || undefined }), {
            success: decision === 'approve' ? `${app.businessName} approved. They have been signed out and must sign in again.` : `${app.businessName} rejected.`,
            error: 'Decision not saved.',
          });
        }}
      />
    </>
  );
}
