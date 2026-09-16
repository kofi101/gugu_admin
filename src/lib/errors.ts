import { FirebaseError } from 'firebase/app';

/** Turns SDK errors into sentences that say what happened and what to do. */
export function describeError(error: unknown): string {
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
        return error.message || 'Some of the details are invalid.';
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
