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
  APPLICATION_NOT_PENDING: 'This application has already been reviewed.',
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
 * What the failed call was doing. A `permission-denied` on a write is the rules
 * refusing *that document*, which is a content problem the merchant can fix; on
 * a read it really is an access problem. They need different advice, and the
 * SDK error alone cannot tell them apart.
 */
export type ErrorContext = 'read' | 'write';

/** Why the rules turn down a merchant's document write, in the merchant's words. */
const WRITE_REJECTED =
  'GUGU did not accept this change. Usually that is contact details in the text ' +
  '(a phone number, MoMo or WhatsApp), a value outside the allowed range, or a ' +
  'field this dashboard does not control. Check the details and try again — ' +
  'signing out will not help.';

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
 * Pass `'write'` when the call was saving something, so a rules rejection is
 * reported as a rejected change rather than as a sign-in problem.
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
        // storage/unauthorized: the object rules turned the upload down.
        return service === 'storage'
          ? 'GUGU did not accept this file. Photos must be JPG, PNG or WebP and 5 MB or smaller.'
          : WRITE_REJECTED;
      case 'permission-denied':
        // Only a read denial is really about who you are; a write denial is
        // about what was being written, and signing out never fixes it.
        return context === 'write'
          ? WRITE_REJECTED
          : 'Your account is not allowed to see this. If your role changed recently, sign out and back in.';
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
