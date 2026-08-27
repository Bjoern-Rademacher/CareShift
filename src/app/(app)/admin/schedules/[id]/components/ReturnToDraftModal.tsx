"use client";

import { AlertTriangle } from "lucide-react";

import * as ui from "@/ui/classes";

import { ErrorMessage } from "@/lib/components/ErrorComponents";

import type { PeriodStatus } from "@/types/scheduling";

type ReopenableStatus = Exclude<PeriodStatus, "DRAFT">;

type Props = {
  status: ReopenableStatus;
  isSubmitting: boolean;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
  onClearError: () => void;
};

export default function ReturnToDraftModal({
  status,
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
        aria-labelledby="return-to-draft-title"
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
              id="return-to-draft-title"
              className="
                text-xl font-semibold tracking-tight
                text-foreground
              "
            >
              Return schedule to draft?
            </h2>

            <p className="mt-3 text-sm font-semibold text-warning">
              {status === "PUBLISHED"
                ? "This will unpublish the schedule"
                : "This will clear the schedule’s validation."}
            </p>

            <p className={`${ui.bodyMuted} mt-2`}>
              Employees and display users cannot access draft schedules. This
              schedule will remain hidden until it is validated and published
              again.
            </p>

            <p className={`${ui.caption} mt-2`}>
              Existing shift assignments will remain unchanged.
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
            {isSubmitting ? "Returning…" : "Return to Draft"}
          </button>
        </div>
      </section>
    </div>
  );
}
