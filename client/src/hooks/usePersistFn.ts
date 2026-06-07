/**
 * hooks/usePersistFn.ts
 * A stable function wrapper that always calls the latest version of a callback
 * without the need to declare it in a useCallback dependency array.
 *
 * This is a common alternative to useCallback when the function itself is not
 * used as a dependency of other hooks but you still need a stable reference
 * (e.g. for event handlers passed as props or stored in refs).
 *
 * The implementation uses two refs:
 *   fnRef      – always holds the latest version of the function.
 *   persistFn  – a permanent wrapper that forwards calls to fnRef.current.
 */

import { useRef } from "react";

// Generic function type – accepts any arguments and returns anything.
type noop = (...args: any[]) => any;

/**
 * usePersistFn instead of useCallback to reduce cognitive load.
 *
 * Returns a stable function reference whose identity never changes between
 * renders. Every call delegates to the most-recently-received `fn` so the
 * wrapper always has access to the latest closure values.
 *
 * @template T – The specific function signature to preserve.
 * @param fn   – The callback to wrap.
 * @returns      A permanently stable reference to a wrapper around `fn`.
 */
export function usePersistFn<T extends noop>(fn: T) {
  // Keep a ref to the latest function so the wrapper never stales.
  const fnRef = useRef<T>(fn);
  fnRef.current = fn; // Update on every render so the ref is always fresh.

  // Create the persistent wrapper only once (null check acts as lazy init).
  const persistFn = useRef<T>(null);
  if (!persistFn.current) {
    persistFn.current = function (this: unknown, ...args) {
      // Delegate to the current version of the function using the correct `this`.
      return fnRef.current!.apply(this, args);
    } as T;
  }

  return persistFn.current!;
}
