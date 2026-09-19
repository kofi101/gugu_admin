import { humanize } from './format';
import type { MerchantApplicationStatus } from './types';

/** Every status a merchant application can hold. */
export const APPLICATION_STATUSES: MerchantApplicationStatus[] = ['pending', 'approved', 'rejected', 'withdrawn'];

/** True only for the four statuses this build understands. */
export function isApplicationStatus(value: unknown): value is MerchantApplicationStatus {
  return typeof value === 'string' && (APPLICATION_STATUSES as string[]).includes(value);
}

/**
 * The words staff see for a stored status.
 *
 * `withdrawn` is the applicant's own doing, not a decision GUGU made: the
 * storefront's button says "Cancel application" and its screen says
 * "Application cancelled". Staff see the applicant's word plus who acted, so it
 * cannot be read as the outcome of a review — which is what "Rejected" means.
 */
export const APPLICATION_STATUS_LABEL: Record<MerchantApplicationStatus, string> = {
  pending: 'Waiting for review',
  approved: 'Approved',
  rejected: 'Rejected',
  withdrawn: 'Cancelled by applicant',
};

/**
 * Filter tab text. Shorter than the badge because the tabs sit side by side —
 * "Cancelled" next to "Rejected" is already the distinction — and each row then
 * carries the longer badge.
 */
export const APPLICATION_FILTER_LABEL: Record<MerchantApplicationStatus, string> = {
  pending: 'To review',
  approved: 'Approved',
  rejected: 'Rejected',
  withdrawn: 'Cancelled',
};

/** Empty-list heading per filter. Never built from the stored word, which would read "No withdrawn applications". */
export const APPLICATION_EMPTY_TITLE: Record<MerchantApplicationStatus, string> = {
  pending: 'No applications waiting',
  approved: 'No approved applications',
  rejected: 'No rejected applications',
  withdrawn: 'No cancelled applications',
};

/**
 * Label lookup. A stored value this build does not know reads back as itself
 * ("Deferred") rather than borrowing another status's word.
 */
export function applicationStatusLabel(status: string | null | undefined): string {
  return isApplicationStatus(status) ? APPLICATION_STATUS_LABEL[status] : humanize(status);
}

/**
 * Whether approve/reject may be offered for this application.
 *
 * `reviewMerchantApplication` (gugu_2.0 `functions/src/admin.js`) refuses
 * anything whose stored status is not `pending` with APPLICATION_NOT_PENDING —
 * including one the applicant cancelled — so anything else is read-only here.
 */
export function canReview(status: string | null | undefined): boolean {
  return status === 'pending';
}

/**
 * The status word a recorded decision amounts to.
 *
 * `merchant_applications/{uid}/reviews` stores the verb the admin used
 * (`approve` / `reject`); staff read outcomes, in the same words the badge on a
 * decided application uses. Anything else is passed through for
 * `applicationStatusLabel` to echo rather than guessed at — the one thing a
 * KYC trail must never do is describe a decision as the opposite one.
 */
export function reviewDecisionStatus(decision: string | null | undefined): string {
  if (decision === 'approve') return 'approved';
  if (decision === 'reject') return 'rejected';
  return typeof decision === 'string' && decision.trim() ? decision.trim() : 'unknown';
}
