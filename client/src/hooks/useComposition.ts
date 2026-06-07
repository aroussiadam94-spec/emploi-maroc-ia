/**
 * hooks/useComposition.ts
 * Handles CJK (Chinese, Japanese, Korean) Input Method Editor (IME) composition
 * events to prevent premature form submission while characters are still being
 * composed.
 *
 * Problem this solves:
 *   On some browsers (notably Safari) the compositionend event fires before
 *   the subsequent keydown event. Without this hook, pressing Enter to confirm
 *   a CJK character would also trigger form submission.
 *
 * Solution:
 *   Track the composition state with a ref, and during composition suppress
 *   the Escape and Enter keys using a two-level setTimeout to account for
 *   Safari's event ordering quirk.
 *
 * Usage:
 *   const { onCompositionStart, onCompositionEnd, onKeyDown, isComposing } =
 *     useComposition({ onKeyDown: handleKeyDown });
 *
 *   <textarea
 *     onCompositionStart={onCompositionStart}
 *     onCompositionEnd={onCompositionEnd}
 *     onKeyDown={onKeyDown}
 *   />
 */

import { useRef } from "react";
import { usePersistFn } from "./usePersistFn";

// Return type of the hook – spread these handlers onto the input/textarea element.
export interface UseCompositionReturn<
  T extends HTMLInputElement | HTMLTextAreaElement,
> {
  onCompositionStart: React.CompositionEventHandler<T>;
  onCompositionEnd: React.CompositionEventHandler<T>;
  onKeyDown: React.KeyboardEventHandler<T>;
  /** Returns true while an IME composition session is active. */
  isComposing: () => boolean;
}

// Optional callbacks the parent component can provide to be called alongside
// the composition-aware handlers.
export interface UseCompositionOptions<
  T extends HTMLInputElement | HTMLTextAreaElement,
> {
  onKeyDown?: React.KeyboardEventHandler<T>;
  onCompositionStart?: React.CompositionEventHandler<T>;
  onCompositionEnd?: React.CompositionEventHandler<T>;
}

type TimerResponse = ReturnType<typeof setTimeout>;

/**
 * @template T – The element type (HTMLInputElement or HTMLTextAreaElement).
 * @param options – Optional event handlers to forward after composition logic.
 */
export function useComposition<
  T extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement,
>(options: UseCompositionOptions<T> = {}): UseCompositionReturn<T> {
  const {
    onKeyDown: originalOnKeyDown,
    onCompositionStart: originalOnCompositionStart,
    onCompositionEnd: originalOnCompositionEnd,
  } = options;

  // Ref that tracks whether an IME composition session is currently active.
  const c = useRef(false);
  // Two timer refs used to defer the compositionEnd flag to after the keydown
  // event fires, working around Safari's out-of-order event dispatch.
  const timer = useRef<TimerResponse | null>(null);
  const timer2 = useRef<TimerResponse | null>(null);

  // Called when the user starts composing a character via IME.
  const onCompositionStart = usePersistFn((e: React.CompositionEvent<T>) => {
    // Cancel any pending end timers in case composition restarts immediately.
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (timer2.current) {
      clearTimeout(timer2.current);
      timer2.current = null;
    }
    // Mark composition as active.
    c.current = true;
    originalOnCompositionStart?.(e);
  });

  // Called when the IME session ends (the character has been committed).
  const onCompositionEnd = usePersistFn((e: React.CompositionEvent<T>) => {
    // 使用两层 setTimeout 来处理 Safari 浏览器中 compositionEnd 先于 onKeyDown 触发的问题
    // Two nested timeouts ensure the compositionEnd flag is cleared AFTER
    // any pending keydown event (Safari fires compositionEnd before keydown).
    timer.current = setTimeout(() => {
      timer2.current = setTimeout(() => {
        c.current = false;
      });
    });
    originalOnCompositionEnd?.(e);
  });

  // Wraps the parent's keydown handler to suppress unwanted key events during IME.
  const onKeyDown = usePersistFn((e: React.KeyboardEvent<T>) => {
    // 在 composition 状态下，阻止 ESC 和 Enter（非 shift+Enter）事件的冒泡
    // During composition, prevent Escape and plain Enter from bubbling so they
    // don't trigger form submission or close dialogs prematurely.
    if (
      c.current &&
      (e.key === "Escape" || (e.key === "Enter" && !e.shiftKey))
    ) {
      e.stopPropagation();
      return;
    }
    // Forward all other key events to the parent handler.
    originalOnKeyDown?.(e);
  });

  // Stable predicate the parent can call to check composition state.
  const isComposing = usePersistFn(() => {
    return c.current;
  });

  return {
    onCompositionStart,
    onCompositionEnd,
    onKeyDown,
    isComposing,
  };
}
