"use client";

import * as ui from "@/ui/classes";

import {
  ValidationErrors,
  SystemErrors,
} from "@/app/admin/schedules/[id]/components/ErrorComponents";

import type { UUID } from "@/types/common";
import type { AssignableEmployee } from "@/types/employee";
import type { AssignmentValidationError } from "@/types/scheduling";

type Props = {
  employees: AssignableEmployee[];
  onConfirm: (employeeId: UUID) => void;
  onClose: () => void;
  isSaving: boolean;
  validationErrors: AssignmentValidationError[];
  closeValidationErrors: () => void;
  systemError: string | null;
  closeSystemError: () => void;
};

export default function AssignModal({
  employees,
  onConfirm,
  onClose,
  isSaving,
  validationErrors,
  closeValidationErrors,
  systemError,
  closeSystemError,
}: Props) {
  return (
    <section
      className={ui.overlay}
      onClick={() => {
        if (!isSaving) onClose();
      }}
    >
      <article
        role="dialog"
        aria-modal="true"
        className={ui.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <header>
          <h3 className={ui.title}>Assign employee</h3>
        </header>

        <ValidationErrors
          title="Assignment not Possible"
          errors={validationErrors}
          onClose={closeValidationErrors}
        />

        <SystemErrors message={systemError} onClose={closeSystemError} />

        <ul className="space-y-3 max-h-150 overflow-y-auto pr-1">
          {employees.map((e) => (
            <li key={e.id} className={ui.card}>
              <article className="flex items-start justify-between gap-3">
                <div>
                  <strong className="block">{`${e.firstName} ${e.lastName}`}</strong>
                  <p className={ui.subtitle}>
                    {e.position} • {e.departments.join(", ")}
                  </p>
                </div>

                <button
                  className={ui.buttonPrimary}
                  disabled={isSaving}
                  onClick={() => onConfirm(e.id)}
                >
                  Assign
                </button>
              </article>
            </li>
          ))}
        </ul>

        <footer className={"text-center"}>
          <button
            className={ui.button}
            disabled={isSaving}
            onClick={() => {
              if (!isSaving) onClose();
            }}
          >
            Close
          </button>
        </footer>
      </article>
    </section>
  );
}
