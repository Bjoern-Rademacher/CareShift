"use client";

import { useSyncExternalStore } from "react";

import { useTheme, type ThemePreference } from "@/app/theme/ThemeProvider";

import * as ui from "@/ui/classes";

const themes: {
  value: ThemePreference;
  label: string;
}[] = [
  {
    value: "system",
    label: "System",
  },
  {
    value: "light",
    label: "Light",
  },
  {
    value: "dark",
    label: "Dark",
  },
];

// No external subscription is needed.
// We only use useSyncExternalStore for its server/client snapshots.
function subscribe() {
  return () => {};
}

export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme();

  // Server and hydration both return false.
  // After hydration, the client snapshot becomes true.
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  return (
    <div
      role="group"
      aria-label="Theme"
      className="inline-flex rounded-control border border-border bg-surface-muted p-1"
    >
      {themes.map(({ value, label }) => {
        // Avoid rendering a selected state until hydration is complete.
        const selected = hydrated && theme === value;

        return (
          <button
            key={value}
            type="button"
            aria-pressed={selected}
            onClick={() => setTheme(value)}
            className={
              ui.segmentedControlButton +
              " " +
              (selected
                ? "bg-selected text-selected-foreground shadow-card"
                : "text-foreground-muted hover:bg-surface-hover hover:text-foreground")
            }
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
