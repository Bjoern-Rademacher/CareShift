"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemePreference = "system" | "light" | "dark";

type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
};

// Shared theme state for all components below the provider.
const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_STORAGE_KEY = "careshift-theme";

// Read the saved user preference once when state is initialized.
function getStoredTheme(): ThemePreference {
  if (typeof window === "undefined") {
    return "system";
  }

  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (
    storedTheme === "system" ||
    storedTheme === "light" ||
    storedTheme === "dark"
  ) {
    return storedTheme;
  }

  return "system";
}

// Read the operating system's current light/dark preference.
function getSystemTheme(): ResolvedTheme {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

// Apply the resolved theme class to the root <html> element.
function applyTheme(theme: ResolvedTheme) {
  const root = document.documentElement;

  root.classList.remove("light", "dark");
  root.classList.add(theme);
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  // What the user explicitly selected.
  const [theme, setThemeState] = useState<ThemePreference>(getStoredTheme);

  // Current operating system preference.
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);

  // Keep systemTheme updated when the OS theme changes.
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function handleSystemThemeChange() {
      setSystemTheme(mediaQuery.matches ? "dark" : "light");
    }

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, []);

  // "system" resolves to the OS setting.
  // Explicit light/dark selections override it.
  const resolvedTheme: ResolvedTheme = theme === "system" ? systemTheme : theme;

  // Synchronize React's resolved theme with the DOM.
  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  // Update both React state and persistent user preference.
  function setTheme(nextTheme: ThemePreference) {
    setThemeState(nextTheme);

    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  }

  // Avoid creating a new context object on every render.
  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [theme, resolvedTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// Convenient and safe way for child components to access the theme.
export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider.");
  }

  return context;
}
