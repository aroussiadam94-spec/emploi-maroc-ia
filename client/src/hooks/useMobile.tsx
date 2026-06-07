/**
 * hooks/useMobile.tsx
 * Reactive hook that returns true when the viewport width is below the
 * mobile breakpoint (768 px by default).
 *
 * Uses the MediaQueryList API so the value updates immediately whenever the
 * browser window is resized across the breakpoint, without polling.
 *
 * Usage:
 *   const isMobile = useIsMobile();
 *   if (isMobile) { ... }
 */

import * as React from "react";

// Pixels at which the layout switches from desktop to mobile.
const MOBILE_BREAKPOINT = 768;

/**
 * Returns true when the current viewport width is strictly less than
 * MOBILE_BREAKPOINT (768 px).
 *
 * The state is initialised to undefined on the server (or before the first
 * paint) and resolved to a boolean after mounting, which avoids hydration
 * mismatches in SSR environments.
 */
export function useIsMobile() {
  // undefined before mount so server and client agree on the initial render.
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    // Create a media query that matches when the viewport is narrower than the breakpoint.
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    // Handler called whenever the media query match state changes.
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Subscribe to future changes (e.g. when the user resizes the window).
    mql.addEventListener("change", onChange);

    // Set the initial value synchronously after mount.
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Cleanup: remove the listener when the component unmounts.
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Coerce undefined → false so callers always receive a boolean.
  return !!isMobile;
}
