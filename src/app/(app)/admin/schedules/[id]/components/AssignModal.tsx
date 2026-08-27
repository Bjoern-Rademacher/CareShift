"use client";

import { useEffect } from "react";

import * as ui from "@/ui/classes";

import EmployeeWorkloadBadge from "@/app/(app)/admin/schedules/[id]/components/EmployeeWorkloadBadge";
import { ErrorList, ErrorMessage } from "@/lib/components/ErrorComponents";

import { SHIFT_GROUP_DETAILS } from "@/lib/constants/scheduleDisplay";
import { formatTimeOnly } from "@/lib/functions/dateTimeUtils";
import { getPositionLabel } from "@/lib/functions/employeePositions";
import { getShiftGroup } from "@/lib/functions/scheduleUtils";

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
  savingEmployeeId: UUID | null;
  validationErrors: AssignmentValidationError[];
  closeValidationErrors: () => void;
  systemError: string | null;
  closeSystemError: () => void;
};

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

export default function AssignModal({
  selectedSlot,
  candidates,
  isLoadingCandidates,
  candidateLoadError,
  onConfirm,
  onClose,
  savingEmployeeId,
  validationErrors,
  closeValidationErrors,
  systemError,
  closeSystemError,
}: Props) {
  const isSaving = savingEmployeeId !== null;
  const shiftDetails =
    SHIFT_GROUP_DETAILS[getShiftGroup(selectedSlot.startTime)];

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  function handleClose() {
    if (!isSaving) {
      onClose();
    }
  }

  return (
    <section className={`${ui.overlay} overflow-hidden`} onClick={handleClose}>
      <article
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-modal-title"
        className="flex max-h-[88vh] w-[70vw] max-w-[1000px] flex-col overflow-hidden rounded-overlay border border-border bg-surface shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="shrink-0 px-5 pt-4">
          <h2 id="assign-modal-title" className={ui.sectionTitle}>
            Assign employee
          </h2>

          <div className="mt-3 rounded-card border border-border bg-surface-muted px-4 py-2.5">
            <p className={ui.label}>
              {getPositionLabel(selectedSlot.position)} #
              {selectedSlot.slotNumber}
            </p>

            <p className={`${ui.caption} mt-0.5`}>
              {formatSlotDate(selectedSlot.startTime)}
              <span className="mx-2">•</span>
              {formatTimeOnly(new Date(selectedSlot.startTime))}–
              {formatTimeOnly(new Date(selectedSlot.endTime))}
              <span className="mx-2">•</span>
              {getDurationHours(selectedSlot)}h<span className="mx-2">•</span>
              {shiftDetails.symbol} {shiftDetails.label}
            </p>
          </div>
        </header>

        <div className="shrink-0 space-y-2 px-5 pt-3">
          <ErrorList
            title="Assignment not possible"
            errors={validationErrors}
            onClose={closeValidationErrors}
          />

          <ErrorMessage message={systemError} onClose={closeSystemError} />
        </div>

        <div className="schedule-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-3">
          {isLoadingCandidates ? (
            <div className="flex h-36 items-center justify-center rounded-card border border-border bg-surface-muted">
              <div className="text-center">
                <div className="mx-auto mb-2 size-5 animate-spin rounded-full border-2 border-border border-t-primary" />

                <p className={ui.label}>Checking employee availability…</p>

                <p className={`${ui.caption} mt-1`}>
                  Loading workload and nearby assignments.
                </p>
              </div>
            </div>
          ) : candidateLoadError ? (
            <div className="rounded-card border border-danger-border bg-danger-muted p-4">
              <p className="font-medium text-danger">
                Could not load assignment candidates.
              </p>

              <p className="mt-1 text-sm text-danger">{candidateLoadError}</p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="rounded-card border border-border bg-surface-muted p-6 text-center">
              <p className={ui.label}>No eligible employees found.</p>

              <p className={`${ui.caption} mt-1`}>
                No active employee matches this department and position.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {candidates.map((candidate) => (
                <li key={candidate.employee.id}>
                  <EmployeeWorkloadBadge
                    candidate={candidate}
                    savingEmployeeId={savingEmployeeId}
                    onAssign={() => onConfirm(candidate.employee.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="shrink-0 border-t border-border bg-surface px-5 py-3 text-center">
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
