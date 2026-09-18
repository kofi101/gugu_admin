import { FirebaseError } from 'firebase/app';

/** Callable Function error codes (HttpsError message) from the platform contract. */
const FUNCTION_CODES: Record<string, string> = {
  SIGN_IN_REQUIRED: 'Your session has expired. Sign in again.',
  REAUTH_REQUIRED: 'Your account access changed. Signing you out so you can sign in again.',
  ADMIN_ONLY: 'Only GUGU staff can do this. If your role changed recently, sign out and back in.',
  MERCHANT_OR_ADMIN_ONLY: 'Only sellers and GUGU staff can do this. If you were just approved, sign out and back in.',
  NOT_YOUR_ORDER: 'This order does not include any of your products.',
  STATUS_INVALID: 'That order status is not recognised.',
  DECISION_INVALID: 'Choose approve or reject.',
  ROLE_INVALID: 'That role is not recognised.',
  ILLEGAL_TRANSITION: 'The order has already moved on. Refresh to see its current status.',
  ORDER_NOT_CANCELLABLE: 'This order can no longer be cancelled. Only awaiting-payment, placed or processing orders can be.',
  ORDER_NOT_FOUND: 'This order no longer exists.',
  // Not always a review: an applicant may have cancelled it, or re-applied,
  // since this page loaded.
  APPLICATION_NOT_PENDING: 'This application is no longer waiting for a decision. Refresh to see where it stands.',
  APPLICATION_CHANGED: 'The applicant changed this application while you were reading it. Refresh and review what they sent now.',
  APPLICATION_NOT_FOUND: 'This application no longer exists.',
  USER_IS_ADMIN: 'This applicant is GUGU staff and cannot also be a seller.',
  USER_ALREADY_MERCHANT: 'This applicant already manages a store.',
  USER_NOT_FOUND: 'No account exists for this user ID.',
  MERCHANT_NOT_FOUND: 'That store does not exist.',
  PRODUCT_NOT_FOUND: 'This product no longer exists.',
  CANNOT_DEMOTE_SELF: 'You cannot remove your own staff access. Ask another admin.',
  BUSINESS_NAME_MISSING: 'The application has no business name, so no store can be created.',
  MERCHANT_ID_COLLISION: 'A store ID clash happened. Try approving again.',
};

/**
 * What the failed call was doing, which the SDK error alone cannot tell.
 *
 * - `write` — this dashboard wrote a document and the security rules refused
 *   *that document*: a content problem the person can fix, not a sign-in one.
 * - `read`  — a read was refused, which really is an access problem.
 * - `call`  — a Callable Function refused. Its own contract code (ADMIN_ONLY,
 *   NOT_YOUR_ORDER, …) carries the detail; a bare `permission-denied` says only
 *   that the account may not do it. Advice about document content would be
 *   nonsense here: `updateOrderStatus` writes no product text.
 */
export type ErrorContext = 'read' | 'write' | 'call';

/** Why the rules turn down a document write from this dashboard, in the writer's words. */
const WRITE_REJECTED =
  'GUGU did not accept this change. Usually that is a value outside the allowed ' +
  'range, contact details in the text (a phone number, MoMo or WhatsApp), or a ' +
  'field this dashboard does not control. Check the details and try again — ' +
  'signing out will not help.';

const NOT_ALLOWED_TO_SEE = 'Your account is not allowed to see this. If your role changed recently, sign out and back in.';
const NOT_ALLOWED_TO_DO = 'Your account is not allowed to do this. If your role changed recently, sign out and back in.';

/**
 * The contract code a callable threw (e.g. `REAUTH_REQUIRED`). The web SDK
 * appends the HTTP status to the message, as in `REAUTH_REQUIRED [401]`.
 */
export function functionErrorCode(error: unknown): string | null {
  const message = (error as { message?: unknown } | null)?.message;
  if (typeof message !== 'string') return null;
  const match = /^([A-Z][A-Z0-9_]*)(?: \[\d{3}\])?$/.exec(message.trim());
  return match ? match[1] : null;
}

/**
 * Turns SDK errors into sentences that say what happened and what to do.
 * Pass `'write'` when the call was saving a document, so a rules rejection is
 * reported as a rejected change rather than as a sign-in problem, and `'call'`
 * for a Callable Function, whose refusals are about the caller, not the content.
 */
export function describeError(error: unknown, context: ErrorContext = 'read'): string {
  const fnCode = functionErrorCode(error);
  if (fnCode && FUNCTION_CODES[fnCode]) return FUNCTION_CODES[fnCode];
  if (error instanceof FirebaseError) {
    const service = error.code.split('/')[0];
    const code = error.code.replace(/^(auth|firestore|storage|functions)\//, '');
    switch (code) {
      case 'invalid-credential':
      case 'wrong-password':
      case 'user-not-found':
      case 'invalid-email':
        return 'That email and password do not match an account.';
      case 'user-token-expired':
      case 'invalid-user-token':
        return 'Your access changed or your session ended. Sign out and sign in again.';
      case 'too-many-requests':
        return 'Too many attempts. Wait a few minutes, then try again.';
      case 'popup-closed-by-user':
      case 'cancelled-popup-request':
        return 'Google sign-in was closed before it finished.';
      case 'popup-blocked':
        return 'Your browser blocked the Google sign-in window. Allow pop-ups for this site and try again.';
      case 'network-request-failed':
      case 'unavailable':
        return 'Could not reach GUGU. Check your connection and try again.';
      case 'unauthorized':
      case 'permission-denied':
        // storage/unauthorized on an upload: the object rules turned the file
        // down. On a read it is an applicant's document (which may be a PDF),
        // so the photo rules have nothing to say about it.
        if (service === 'storage' && context === 'write')
          return 'GUGU did not accept this file. Photos must be JPG, PNG or WebP and 5 MB or smaller.';
        // A write denial is about what was being written, and signing out never
        // fixes it. A read or a Callable denial really is about who you are.
        if (context === 'write') return WRITE_REJECTED;
        return context === 'call' ? NOT_ALLOWED_TO_DO : NOT_ALLOWED_TO_SEE;
      case 'unauthenticated':
        return 'Your session has expired. Sign in again.';
      case 'not-found':
      case 'object-not-found':
        return 'This record no longer exists.';
      case 'failed-precondition':
        return fnCode || !error.message || error.message.startsWith('Firebase')
          ? 'This change is not allowed in the current state. Refresh and try again.'
          : error.message;
      case 'invalid-argument':
        return fnCode
          ? `Some of the details are invalid (${fnCode}).`
          : error.message || 'Some of the details are invalid.';
      case 'internal':
        return 'GUGU could not finish this. Try again in a moment.';
      case 'quota-exceeded':
        return 'Storage quota exceeded. Contact GUGU support.';
      case 'canceled':
        return 'Upload cancelled.';
      default:
        return fnCode ? `GUGU could not do this (${fnCode}). Try again or contact support.` : error.message || 'Something went wrong. Try again.';
    }
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Try again.';
}
