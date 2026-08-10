// Page spacing
export const page = "space-y-6";

// Application shell
export const appFrame =
  "mx-auto w-full max-w-[1600px] rounded-overlay border border-border " +
  "bg-surface shadow-card";

// Page widths inside the shell
export const frameNarrow = "mx-auto w-full max-w-md";

export const frameDefault = "mx-auto w-full max-w-5xl";

export const frameWide = "w-full";

// Structural grouping
export const section = "space-y-3";

export const card =
  "rounded-card border border-border bg-surface p-4 shadow-card " +
  "transition-colors duration-fast hover:bg-surface-hover";

// Typography
export const pageTitle = "text-xl font-semibold tracking-tight text-foreground";

export const sectionTitle = "text-base font-semibold text-foreground";

export const cardTitle = "text-sm font-semibold text-foreground";

export const bodyText = "text-sm text-foreground";

export const bodyMuted = "text-sm text-foreground-muted";

export const label = "text-sm font-medium text-foreground";

export const caption = "text-xs text-foreground-subtle";

// Temporary backwards-compatible aliases
export const title = pageTitle;

export const subtitle = bodyMuted;

// Tables
export const table = "w-full border-collapse text-sm";

export const th =
  "border-b border-border p-2 text-left font-semibold text-foreground-muted";

export const td = "border-b border-border p-2 align-top text-foreground";

export const rowHover =
  "transition-colors duration-fast hover:bg-surface-hover";

// Buttons
export const button =
  "rounded-control border border-border bg-surface px-3 py-1.5 " +
  "text-sm font-medium text-foreground transition-colors duration-fast " +
  "hover:border-border-strong hover:bg-surface-hover " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
  "disabled:border-disabled-border disabled:bg-disabled-surface " +
  "disabled:text-disabled-foreground";

export const buttonPrimary =
  "rounded-control border border-primary bg-primary px-3 py-1.5 " +
  "text-sm font-medium text-primary-foreground transition-colors duration-fast " +
  "hover:border-primary-hover hover:bg-primary-hover " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
  "disabled:border-disabled-border disabled:bg-disabled-surface " +
  "disabled:text-disabled-foreground";

export const buttonGhost =
  "rounded-control px-3 py-1.5 text-sm font-medium text-foreground-muted " +
  "transition-colors duration-fast hover:bg-surface-hover hover:text-foreground " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
  "disabled:text-disabled-foreground";

export const segmentedControlButton =
  "rounded-control px-2.5 py-1 text-xs font-medium " +
  "transition-colors duration-fast " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

// Inputs / selects
export const input =
  "w-full rounded-control border border-border bg-surface px-3 py-2 text-sm " +
  "text-foreground placeholder:text-foreground-subtle transition-colors duration-fast " +
  "hover:border-border-strong " +
  "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
  "disabled:border-disabled-border disabled:bg-disabled-surface disabled:text-disabled-foreground";

export const inputCompact =
  "w-auto rounded-control border border-border bg-surface px-3 py-2 text-sm " +
  "text-foreground placeholder:text-foreground-subtle transition-colors duration-fast " +
  "hover:border-border-strong " +
  "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
  "disabled:border-disabled-border disabled:bg-disabled-surface disabled:text-disabled-foreground";

export const select =
  "rounded-control border border-border bg-surface px-3 py-2 text-sm text-foreground " +
  "transition-colors duration-fast hover:border-border-strong " +
  "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
  "disabled:border-disabled-border disabled:bg-disabled-surface disabled:text-disabled-foreground";

// Badges / status chips
export const badge =
  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium";

export const badgeNeutral =
  "border-border bg-surface-muted text-foreground-muted";

export const badgeSuccess =
  "border-success-border bg-success-muted text-success";

export const badgeWarning =
  "border-warning-border bg-warning-muted text-warning";

export const badgeDanger = "border-danger-border bg-danger-muted text-danger";

// Temporary backwards-compatible aliases
export const badgeGray = badgeNeutral;

export const badgeGreen = badgeSuccess;

export const badgeRed = badgeDanger;

// Modal / overlay
export const overlay =
  "fixed inset-0 flex items-center justify-center bg-black/60";

export const modal =
  "w-full max-w-md space-y-4 rounded-overlay border border-border " +
  "bg-surface p-5 shadow-overlay";

// Alerts / feedback
export const alertSuccess =
  "rounded-card border border-success-border bg-success-muted px-3 py-2 " +
  "text-sm text-success";

export const alertWarning =
  "rounded-card border border-warning-border bg-warning-muted px-3 py-2 " +
  "text-sm text-warning";

export const alertDanger =
  "rounded-card border border-danger-border bg-danger-muted px-3 py-2 " +
  "text-sm text-danger";

// Temporary backwards-compatible aliases
export const successAlert = alertSuccess;

export const errorAlert = alertDanger;
