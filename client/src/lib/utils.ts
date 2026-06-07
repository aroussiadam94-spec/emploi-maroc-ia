/**
 * lib/utils.ts
 * Shared utility helpers for the client.
 *
 * cn() is the standard class-name composition helper used throughout the
 * component tree. It combines clsx (conditional class logic) with
 * tailwind-merge (deduplication of conflicting Tailwind utilities) so that
 * class strings are always safe and predictable.
 *
 * Usage:
 *   cn("px-4 py-2", isActive && "bg-primary", "py-3") // → "px-4 py-3 bg-primary"
 *   (tailwind-merge resolves the py-2 vs py-3 conflict in favour of the last value)
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names with Tailwind conflict resolution.
 * @param inputs – Any mix of strings, arrays, or conditional objects supported by clsx.
 * @returns       A single deduplicated class-name string safe to use in JSX.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
