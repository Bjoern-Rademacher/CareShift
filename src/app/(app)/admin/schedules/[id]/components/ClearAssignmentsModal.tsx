"use client";

import { AlertTriangle } from "lucide-react";

import * as ui from "@/ui/classes";

import { ErrorMessage } from "@/lib/components/ErrorComponents";

type Props = {
  assignedCount: number;
  isSubmitting: boolean;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
  onClearError: () => void;
};

export default function ClearAssignmentsModal({
  assignedCount,
  isSubmitting,
  error,
  onConfirm,
  onClose,
  onClearError,
}: Props) {
  function handleClose() {
    if (!isSubmitting) {
      onClose();
    }
  }

  return (
    <div className={ui.overlay} onClick={handleClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="clear-assignments-title"
        className="
          w-full max-w-lg rounded-overlay
          border-2 border-warning/50 bg-surface
          p-5 shadow-overlay
        "
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <span
            aria-hidden="true"
            className="
              grid size-11 shrink-0 place-items-center
              rounded-control border border-warning/30
              bg-warning-muted text-warning
            "
          >
            <AlertTriangle className="size-5" />
          </span>

          <div className="min-w-0">
            <h2
              id="clear-assignments-title"
              className="
                text-xl font-semibold tracking-tight
                text-foreground
              "
            >
              Clear all assignments?
            </h2>

            <p className="mt-3 text-sm font-semibold text-warning">
              {assignedCount} employee{" "}
              {assignedCount === 1 ? "assignment" : "assignments"} will be
              removed.
            </p>

            <p className={`${ui.bodyMuted} mt-2`}>
              The schedule and its shift slots will remain in place, but every
              assigned employee will be removed.
            </p>

            <p className={`${ui.caption} mt-2`}>
              Employees must be assigned again before the schedule can be
              validated and published.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <ErrorMessage message={error} onClose={onClearError} />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            className={ui.button}
            disabled={isSubmitting}
            onClick={handleClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className={ui.buttonPrimary}
            disabled={isSubmitting}
            onClick={onConfirm}
          >
            {isSubmitting ? "Clearing…" : "Clear Assignments"}
          </button>
        </div>
      </section>
    </div>
  );
}
