'use client';

import toast from 'react-hot-toast';
import { describeError, type ErrorContext } from './errors';

/**
 * Wraps a mutation: success toast on resolve, readable error toast on reject.
 * Re-throws so callers can keep dialogs/forms open.
 *
 * `context` defaults to `'call'`, which is what most mutations are. Pass
 * `'write'` when the action writes a Firestore document directly, so a rules
 * rejection is explained as rejected content — advice that would be wrong for a
 * Callable such as `updateOrderStatus`.
 */
export async function mutate<T>(
  action: () => Promise<T>,
  messages: { success: string; error?: string; context?: ErrorContext }
): Promise<T> {
  try {
    const result = await action();
    toast.success(messages.success);
    return result;
  } catch (error) {
    const detail = describeError(error, messages.context ?? 'call');
    toast.error(messages.error ? `${messages.error} ${detail}` : detail, { duration: 7000 });
    throw error;
  }
}
