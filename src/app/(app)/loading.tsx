import * as ui from "@/ui/classes";

const SKELETON_ROWS = ["first", "second", "third"];

export default function AppLoading() {
  return (
    <div
      className={`${ui.page} motion-safe:animate-pulse`}
      role="status"
      aria-label="Loading page"
      aria-live="polite"
    >
      <span className="sr-only">Loading page…</span>

      <div
        aria-hidden="true"
        className="
          rounded-card border border-border
          bg-surface p-5 shadow-card
        "
      >
        <div className="flex items-center gap-4">
          <div className="size-11 shrink-0 rounded-control bg-surface-muted" />

          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-5 w-44 max-w-full rounded bg-surface-muted" />

            <div className="h-3 w-80 max-w-full rounded bg-surface-muted" />
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="
          rounded-card border border-border
          bg-surface shadow-card
        "
      >
        <div className="border-b border-border px-4 py-3">
          <div className="h-4 w-36 rounded bg-surface-muted" />

          <div className="mt-2 h-3 w-64 max-w-full rounded bg-surface-muted" />
        </div>

        <div className="space-y-3 p-4">
          {SKELETON_ROWS.map((row) => (
            <div
              key={row}
              className="
                grid items-center gap-4 rounded-control
                border border-border px-4 py-4
                sm:grid-cols-[minmax(0,1fr)_minmax(8rem,0.7fr)_auto]
              "
            >
              <div className="space-y-2">
                <div className="h-3 w-36 max-w-full rounded bg-surface-muted" />

                <div className="h-3 w-20 rounded bg-surface-muted" />
              </div>

              <div className="h-3 w-32 max-w-full rounded bg-surface-muted" />

              <div className="h-6 w-20 rounded-full bg-surface-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
