'use client';

import { getDownloadURL, ref } from 'firebase/storage';
import { AlertTriangle, Check, FileText, RotateCw, X } from 'lucide-react';
import { useState } from 'react';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/dialog';
import { FilterTabs } from '@/components/ui/filters';
import { DefinitionList, PageHeader, Panel } from '@/components/ui/panel';
import { DataView, EmptyState, ListSkeleton } from '@/components/ui/states';
import {
  APPLICATION_EMPTY_TITLE,
  APPLICATION_FILTER_LABEL,
  APPLICATION_STATUSES,
  applicationStatusLabel,
  canReview,
  reviewDecisionStatus,
} from '@/lib/applications';
import {
  APPLICATION_REVIEW_LIMIT,
  listApplicationReviews,
  reviewMerchantApplication,
  watchApplications,
} from '@/lib/data';
import { describeError } from '@/lib/errors';
import { firebase } from '@/lib/firebase';
import { formatDate, formatDateTime, titleize, toDate } from '@/lib/format';
import { mutate } from '@/lib/notify';
import type { MerchantApplication, MerchantApplicationReview } from '@/lib/types';
import { useAsync, useLive } from '@/lib/use-data';

type Status = MerchantApplication['status'];

/** Second line of each empty list, where there is something useful to say. */
const EMPTY_BODY: Record<Status, string | null> = {
  pending: 'New Sell on GUGU applications appear here as soon as they are submitted.',
  approved: null,
  rejected: null,
  withdrawn:
    'People who cancelled their own application before GUGU decided on it. There is nothing to approve or reject here — if they apply again, the application comes back under To review.',
};

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

/** What the applicant sent at the time of one past decision, in one line. */
function SubmittedThen({ review, current }: { review: MerchantApplicationReview; current: MerchantApplication }) {
  const sub = review.submission ?? {};
  const name = sub.businessName?.trim();
  const sentAt = toDate(sub.submittedAt);
  const where = [titleize(sub.cityId), titleize(sub.regionId)].filter(Boolean).join(', ');
  const contact = [sub.email, sub.phone, where].filter(Boolean).join(' · ');
  // The whole point of keeping the submission with the decision: a re-applicant
  // may have changed the business name, and the reviewer reading a fresh
  // `pending` application has no other way to see that this rejection was about
  // the same person.
  const renamed = Boolean(name) && Boolean(current.businessName) && name !== current.businessName;
  const docs = sub.documentUrls ?? [];

  return (
    <div className="mt-2 text-sm text-ink-muted">
      <p>
        {sentAt ? `Sent ${formatDate(sentAt)} as ` : 'Sent as '}
        <span className="font-medium text-ink">{name || 'Unnamed business'}</span>
        {contact ? ` — ${contact}` : null}
      </p>
      {renamed ? (
        <p className="mt-0.5">
          This application is under a different name:{' '}
          <span className="font-medium text-ink">{current.businessName}</span>.
        </p>
      ) : null}
      {docs.length ? (
        <span className="mt-0.5 flex flex-wrap items-center gap-x-4">
          <span>Documents sent then:</span>
          {docs.map((d, i) => (
            <DocumentLink key={d} value={d} index={i} />
          ))}
        </span>
      ) : null}
    </div>
  );
}

/**
 * Every decision GUGU has recorded about this applicant.
 *
 * An applicant may overwrite a rejected application with a fresh one, and the
 * replace carries away the note, the reviewer and the date — so without this a
 * second reviewer sees a spotless `pending` application with no sign the person
 * was turned down before, or why. The rows come from a subcollection the
 * applicant cannot write (gugu_2.0 `firestore.rules`).
 *
 * Nothing is rendered for a first-time applicant, which is most of them; the
 * reviewer only sees this block when there is something to know.
 */
function DecisionHistory({ app }: { app: MerchantApplication }) {
  const result = useAsync<MerchantApplicationReview[]>(`application-reviews:${app.uid}`, () =>
    listApplicationReviews(app.uid)
  );

  // Silent while it loads: a spinner on every row would be the clutter this
  // block exists to avoid, and there is nothing to say yet.
  if (result.status === 'loading') return null;
  if (result.status === 'error') {
    // Said out loud rather than swallowed. An empty block and a failed read look
    // identical on screen, and reading "no history" into a read the rules just
    // refused is exactly the mistake this feature exists to prevent.
    return (
      <div role="alert" className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-4 text-sm">
        <span className="flex items-center gap-1.5 font-semibold text-bad-700">
          <AlertTriangle className="size-4" aria-hidden />
          Earlier decisions could not be loaded
        </span>
        <span className="text-ink-muted">{describeError(result.error)}</span>
        <Button variant="ghost" size="sm" icon={<RotateCw aria-hidden />} onClick={result.retry}>
          Try again
        </Button>
      </div>
    );
  }

  const reviews = result.data;
  if (reviews.length === 0) return null;

  return (
    <div className="mt-4 border-t border-line pt-4">
      <h3 className="text-sm font-semibold text-ink">
        Decision history
        <span className="ml-2 font-normal text-ink-muted">
          {reviews.length === 1 ? 'One decision' : `${reviews.length} decisions`} recorded for this account
          {/* On a pending application every recorded decision is about an
              earlier submission, which is the fact the reviewer is here for. */}
          {canReview(app.status) ? ', all of them before this application' : ''}
        </span>
      </h3>
      <ol className="mt-3 flex flex-col gap-2.5">
        {reviews.map((r) => {
          const decided = reviewDecisionStatus(r.decision);
          return (
            <li key={r.id} className="rounded-lg border border-line bg-ground px-3 py-2.5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <StatusBadge status={decided} label={applicationStatusLabel(decided)} />
                <span className="text-sm text-ink-muted">{formatDateTime(r.reviewedAt)}</span>
                {r.reviewedBy ? (
                  <span className="text-sm text-ink-muted">
                    by <code className="text-[0.8125rem] break-all">{r.reviewedBy}</code>
                  </span>
                ) : null}
              </div>
              <p className="mt-1.5 text-[0.9375rem]">
                {r.note ?? <span className="text-ink-muted">No note recorded.</span>}
              </p>
              <SubmittedThen review={r} current={app} />
            </li>
          );
        })}
      </ol>
      {reviews.length >= APPLICATION_REVIEW_LIMIT ? (
        <p className="mt-2 text-[0.8125rem] text-ink-muted">
          The most recent {APPLICATION_REVIEW_LIMIT} decisions. Older ones are not shown here.
        </p>
      ) : null}
    </div>
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
        options={APPLICATION_STATUSES.map((s) => ({ value: s, label: APPLICATION_FILTER_LABEL[s] }))}
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
              <EmptyState title={APPLICATION_EMPTY_TITLE[status]}>{EMPTY_BODY[status]}</EmptyState>
            </Panel>
          ) : (
            <ul className="flex flex-col gap-4">
              {apps.map((app) => (
                <li key={app.uid}>
                  <Panel
                    title={app.businessName || 'Unnamed business'}
                    description={`Applied ${formatDate(app.createdAt)}`}
                    actions={
                      canReview(app.status) ? (
                        <>
                          <Button variant="secondary" icon={<X aria-hidden />} onClick={() => setAction({ app, decision: 'reject' })}>
                            Reject
                          </Button>
                          <Button icon={<Check aria-hidden />} onClick={() => setAction({ app, decision: 'approve' })}>
                            Approve
                          </Button>
                        </>
                      ) : (
                        <StatusBadge status={app.status} label={applicationStatusLabel(app.status)} />
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
                    <DecisionHistory app={app} />
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
