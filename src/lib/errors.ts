import { FirebaseError } from 'firebase/app';

/** Callable Function error codes (HttpsError message) from the platform contract. */
const FUNCTION_CODES: Record<string, string> = {
  SIGN_IN_REQUIRED: 'Your session has expired. Sign in again.',
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

/** Turns SDK errors into sentences that say what happened and what to do. */
export function describeError(error: unknown): string {
  if (error instanceof FirebaseError && FUNCTION_CODES[error.message]) return FUNCTION_CODES[error.message];
  if (error instanceof FirebaseError) {
    const code = error.code.replace(/^(auth|firestore|storage|functions)\//, '');
    switch (code) {
      case 'invalid-credential':
      case 'wrong-password':
      case 'user-not-found':
      case 'invalid-email':
        return 'That email and password do not match an account.';
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
      case 'permission-denied':
      case 'unauthorized':
        return 'Your account is not allowed to do this. If your role changed recently, sign out and back in.';
      case 'unauthenticated':
        return 'Your session has expired. Sign in again.';
      case 'not-found':
      case 'object-not-found':
        return 'This record no longer exists.';
      case 'failed-precondition':
        return error.message && !error.message.startsWith('Firebase')
          ? error.message
          : 'This change is not allowed in the current state. Refresh and try again.';
      case 'invalid-argument':
        return /^[A-Z_]+$/.test(error.message)
          ? `Some of the details are invalid (${error.message}).`
          : error.message || 'Some of the details are invalid.';
      case 'internal':
        return 'GUGU could not finish this. Try again in a moment.';
      case 'quota-exceeded':
        return 'Storage quota exceeded. Contact GUGU support.';
      case 'canceled':
        return 'Upload cancelled.';
      default:
        return error.message || 'Something went wrong. Try again.';
    }
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Try again.';
}
