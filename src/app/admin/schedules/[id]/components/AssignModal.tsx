"use client";

import * as ui from "@/ui/classes";

import EmployeeWorkloadBadge from "@/app/admin/schedules/[id]/components/EmployeeWorkloadBadge";

import {
  ValidationErrors,
  SystemErrors,
} from "@/app/admin/schedules/[id]/components/ErrorComponents";

import type { UUID } from "@/types/common";
import type { EmployeeAssignmentCandidate } from "@/types/assignment";
import type { AssignmentValidationError } from "@/types/scheduling";

type Props = {
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

export default function AssignModal({
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
  function handleClose() {
    if (isSaving) return;

    onClose();
  }

  return (
    <section className={ui.overlay} onClick={handleClose}>
      <article
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-modal-title"
        className={ui.modal}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="mb-4">
          <h3 id="assign-modal-title" className={ui.title}>
            Assign employee
          </h3>

          <p className={ui.subtitle}>
            Select an available employee for this shift.
          </p>
        </header>

        <ValidationErrors
          title="Assignment not possible"
          errors={validationErrors}
          onClose={closeValidationErrors}
        />

        <SystemErrors message={systemError} onClose={closeSystemError} />

        {isLoadingCandidates ? (
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-8 text-center">
            <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-violet-500" />

            <p className="font-medium text-slate-200">
              Checking employee availability...
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Loading workload and nearby assignments.
            </p>
          </div>
        ) : candidateLoadError ? (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-5">
            <p className="font-medium text-red-300">
              Could not load assignment candidates.
            </p>

            <p className="mt-1 text-sm text-red-200/80">{candidateLoadError}</p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-6 text-center">
            <p className="font-medium text-slate-200">
              No eligible employees found.
            </p>

            <p className="mt-1 text-sm text-slate-400">
              No active employee matches this department and position.
            </p>
          </div>
        ) : (
          <ul className="max-h-150 space-y-3 overflow-y-auto pr-1">
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

        <footer className="mt-5 text-center">
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
