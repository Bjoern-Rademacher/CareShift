"use client";

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

export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="group"
      aria-label="Theme"
      className="inline-flex rounded-control border border-border bg-surface-muted p-1"
    >
      {themes.map(({ value, label }) => {
        const selected = theme === value;

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
