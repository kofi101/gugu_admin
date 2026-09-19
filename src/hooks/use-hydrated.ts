'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * False in the server-rendered HTML, true once React has hydrated.
 *
 * Used to keep a form from submitting before its onSubmit handler exists. This
 * site is a static export, so the HTML can sit in front of a visitor on a slow
 * connection for a while before the JavaScript arrives — long enough to click.
 * `useSyncExternalStore` is how to know that without setting state in an effect,
 * which this repo's lint rules forbid.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
