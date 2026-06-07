/**
 * client/src/contexts/ThemeContext.tsx
 * Global theme context that controls the dark/light mode for the entire app.
 *
 * Usage:
 *   • Wrap the app with <ThemeProvider defaultTheme="dark" switchable={false}>
 *   • Read or toggle the theme anywhere with the useTheme() hook.
 *
 * When switchable={false} the theme is fixed to defaultTheme and no toggle
 * function is exposed. When switchable={true} the chosen theme is persisted
 * to localStorage so it survives page reloads.
 */

import React, { createContext, useContext, useEffect, useState } from "react";

// The two supported theme values.
type Theme = "light" | "dark";

// Shape of the value provided by ThemeContext.
interface ThemeContextType {
  theme: Theme;
  toggleTheme?: () => void; // undefined when switchable={false}
  switchable: boolean;
}

// Create the context with undefined as the default so consumers can detect
// whether they are inside a provider.
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Props accepted by ThemeProvider.
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;   // Starting theme (default: "light").
  switchable?: boolean;   // Whether the user can toggle between themes.
}

/**
 * Provides theme state to the subtree.
 * Applies the theme by adding/removing the "dark" class on <html> so that
 * Tailwind's dark-mode utilities work correctly throughout the app.
 */
export function ThemeProvider({
  children,
  defaultTheme = "light",
  switchable = false,
}: ThemeProviderProps) {
  // Initialise from localStorage when switchable, otherwise use the prop value.
  const [theme, setTheme] = useState<Theme>(() => {
    if (switchable) {
      const stored = localStorage.getItem("theme");
      return (stored as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  // Sync the theme class on the document root and persist to localStorage
  // whenever the theme or the switchable flag changes.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Only write to localStorage when the user is allowed to switch themes.
    if (switchable) {
      localStorage.setItem("theme", theme);
    }
  }, [theme, switchable]);

  // Expose a toggle function only when the theme is user-switchable.
  const toggleTheme = switchable
    ? () => {
        setTheme(prev => (prev === "light" ? "dark" : "light"));
      }
    : undefined;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, switchable }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook that returns the current theme and the optional toggle function.
 * Must be called inside a ThemeProvider; throws otherwise.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
