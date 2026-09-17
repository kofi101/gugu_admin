'use client';

import toast from 'react-hot-toast';
import { describeError } from './errors';

/**
 * Wraps a mutation: success toast on resolve, readable error toast on reject.
 * Re-throws so callers can keep dialogs/forms open.
 */
export async function mutate<T>(
  action: () => Promise<T>,
  messages: { success: string; error?: string }
): Promise<T> {
  try {
    const result = await action();
    toast.success(messages.success);
    return result;
  } catch (error) {
    const detail = describeError(error);
    toast.error(messages.error ? `${messages.error} ${detail}` : detail, { duration: 7000 });
    throw error;
  }
}
