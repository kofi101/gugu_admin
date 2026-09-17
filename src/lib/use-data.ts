'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type DataState<T> =
  | { status: 'loading'; data: undefined; error: undefined }
  | { status: 'ready'; data: T; error: undefined }
  | { status: 'error'; data: undefined; error: unknown };

export type DataResult<T> = DataState<T> & { retry: () => void };

const LOADING = { status: 'loading', data: undefined, error: undefined } as const;

type Subscribe<T> = (next: (value: T) => void, fail: (error: unknown) => void) => () => void;

/**
 * Subscribes to a live source (Firestore onSnapshot). Pass `null` to stay
 * idle (e.g. while claims load). `key` must change when the source changes.
 */
export function useLive<T>(key: string | null, subscribe: Subscribe<T> | null): DataResult<T> {
  const [state, setState] = useState<{ key: string | null; attempt: number; value: DataState<T> }>({
    key,
    attempt: 0,
    value: LOADING,
  });
  const [attempt, setAttempt] = useState(0);
  const subscribeRef = useRef(subscribe);
  useEffect(() => {
    subscribeRef.current = subscribe;
  });

  useEffect(() => {
    const sub = subscribeRef.current;
    if (key === null || !sub) return;
    let active = true;
    let unsubscribe: () => void = () => {};
    try {
      unsubscribe = sub(
        (data) => active && setState({ key, attempt, value: { status: 'ready', data, error: undefined } }),
        (error) => active && setState({ key, attempt, value: { status: 'error', data: undefined, error } })
      );
    } catch (error) {
      queueMicrotask(() => {
        if (active) setState({ key, attempt, value: { status: 'error', data: undefined, error } });
      });
    }
    return () => {
      active = false;
      unsubscribe();
    };
  }, [key, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  const current = state.key === key && state.attempt === attempt ? state.value : LOADING;
  return { ...current, retry } as DataResult<T>;
}

/** One-shot async loader with retry. */
export function useAsync<T>(key: string | null, load: (() => Promise<T>) | null): DataResult<T> {
  const subscribe: Subscribe<T> | null = load
    ? (next, fail) => {
        let cancelled = false;
        load().then(
          (v) => !cancelled && next(v),
          (e) => !cancelled && fail(e)
        );
        return () => {
          cancelled = true;
        };
      }
    : null;
  return useLive(key, subscribe);
}
