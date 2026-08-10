"use client";

// React
import { useEffect } from "react";

// UI
import * as ui from "@/ui/classes";

import EmployeeWorkloadBadge from "@/app/admin/schedules/[id]/components/EmployeeWorkloadBadge";
import {
  SystemErrors,
  ValidationErrors,
} from "@/app/admin/schedules/[id]/components/ErrorComponents";

// Helpers
import { formatTimeOnly } from "@/lib/functions/dateTimeUtils";

// Types
import type { EmployeeAssignmentCandidate } from "@/types/assignment";
import type { UUID } from "@/types/common";
import type { AssignmentValidationError, ShiftSlot } from "@/types/scheduling";

type Props = {
  selectedSlot: ShiftSlot;
  candidates: EmployeeAssignmentCandidate[];

  isLoadingCandidates: boolean;
  candidateLoadError: string | null;

  onConfirm: (employeeId: UUID) => void;
  onClose: () => void;

  isSaving: boolean;

  validationErrors: AssignmentValidationError[];
  closeValidationErrors: () => void;

  systemError: string | null;
  closeSystemError: () => void;
};

function formatPosition(position: ShiftSlot["position"]): string {
  return position
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatSlotDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function getDurationHours(slot: ShiftSlot): number {
  return (
    (new Date(slot.endTime).getTime() - new Date(slot.startTime).getTime()) /
    (60 * 60 * 1000)
  );
}

function getShiftLabel(startTime: string): string {
  const hour = new Date(startTime).getUTCHours();

  if (hour >= 6 && hour < 14) return "☀ Morning";
  if (hour >= 14 && hour < 22) return "☼ Evening";

  return "☾ Night";
}

export default function AssignModal({
  selectedSlot,
  candidates,
  isLoadingCandidates,
  candidateLoadError,
  onConfirm,
  onClose,
  isSaving,
  validationErrors,
  closeValidationErrors,
  systemError,
  closeSystemError,
}: Props) {
  // Prevent the schedule page behind the modal from scrolling.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  function handleClose() {
    if (isSaving) return;

    onClose();
  }

  return (
    <section className={`${ui.overlay} overflow-hidden`} onClick={handleClose}>
      <article
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-modal-title"
        className="flex max-h-[88vh] w-[70vw] max-w-[1000px] flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-950 shadow-2xl max-md:w-[94vw]"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Fixed modal header */}
        <header className="shrink-0 px-5 pt-4">
          <h2
            id="assign-modal-title"
            className="text-xl font-semibold text-slate-100"
          >
            Assign employee
          </h2>

          <div className="mt-3 rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-2.5">
            <p className="font-medium text-slate-100">
              {formatPosition(selectedSlot.position)} #{selectedSlot.slotNumber}
            </p>

            <p className="mt-0.5 text-sm text-slate-400">
              {formatSlotDate(selectedSlot.startTime)}
              <span className="mx-2">•</span>
              {formatTimeOnly(new Date(selectedSlot.startTime))}–
              {formatTimeOnly(new Date(selectedSlot.endTime))}
              <span className="mx-2">•</span>
              {getDurationHours(selectedSlot)}h<span className="mx-2">•</span>
              {getShiftLabel(selectedSlot.startTime)}
            </p>
          </div>
        </header>

        {/* Fixed errors */}
        <div className="shrink-0 px-5 pt-3">
          <ValidationErrors
            title="Assignment not possible"
            errors={validationErrors}
            onClose={closeValidationErrors}
          />

          <SystemErrors message={systemError} onClose={closeSystemError} />
        </div>

        {/* Only this section scrolls */}
        <div className="schedule-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-3">
          {isLoadingCandidates ? (
            <div className="flex h-36 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/50">
              <div className="text-center">
                <div className="mx-auto mb-2 h-5 w-5 animate-spin rounded-full border-2 border-slate-700 border-t-violet-500" />

                <p className="text-sm font-medium text-slate-200">
                  Checking employee availability...
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Loading workload and nearby assignments.
                </p>
              </div>
            </div>
          ) : candidateLoadError ? (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4">
              <p className="font-medium text-red-300">
                Could not load assignment candidates.
              </p>

              <p className="mt-1 text-sm text-red-200/80">
                {candidateLoadError}
              </p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-6 text-center">
              <p className="font-medium text-slate-200">
                No eligible employees found.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                No active employee matches this department and position.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {candidates.map((candidate) => (
                <li key={candidate.employee.id}>
                  <EmployeeWorkloadBadge
                    candidate={candidate}
                    isSaving={isSaving}
                    onAssign={() => onConfirm(candidate.employee.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Fixed modal footer */}
        <footer className="shrink-0 border-t border-slate-800 bg-slate-950 px-5 py-3 text-center">
          <button
            type="button"
            className={ui.button}
            disabled={isSaving}
            onClick={handleClose}
          >
            Close
          </button>
        </footer>
      </article>
    </section>
  );
}
