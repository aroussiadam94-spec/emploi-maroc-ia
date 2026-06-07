/**
 * components/ThemeToggle.tsx
 * A small icon button that switches between dark and light mode.
 *
 * Reads the current theme and the optional toggleTheme function from
 * ThemeContext. When the theme is not switchable (switchable={false} in
 * ThemeProvider) toggleTheme will be undefined and clicking the button does
 * nothing – the button remains in the DOM for layout consistency but is
 * effectively disabled.
 *
 * Animation: Sun and Moon icons are layered on top of each other.
 * Tailwind scale/rotate transitions control which icon is visible.
 */

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function ThemeToggle() {
  // Get the current theme value and the (optional) toggle function.
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}  // undefined when theme is fixed; click is a no-op.
      // Accessible label updates dynamically to describe the opposite action.
      aria-label={isDark ? "Activer le mode clair" : "Activer le mode sombre"}
      className="theme-toggle relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-border bg-card text-foreground shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
      title={isDark ? "Mode clair" : "Mode sombre"}
    >
      {/* Sun icon – visible in dark mode (transition out when switching to light) */}
      <Sun className={`absolute h-4 w-4 transition-all duration-300 ${isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`} />
      {/* Moon icon – visible in light mode (transition out when switching to dark) */}
      <Moon className={`absolute h-4 w-4 transition-all duration-300 ${isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`} />
    </button>
  );
}
