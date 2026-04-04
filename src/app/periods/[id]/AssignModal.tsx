"use client";

import * as ui from "@/ui/classes";

import { UUID } from "@/types/common";
import { Employee } from "@/types/employee";

type Props = {
  employees: Employee[];
  onConfirm: (employeeId: UUID) => void;
  onClose: () => void;
  isSaving: boolean;
  errorMessage: string | null;
};

export default function AssignModal({
  employees,
  onConfirm,
  onClose,
  isSaving,
  errorMessage,
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

        {errorMessage && (
          <div role="alert" className={ui.errorAlert}>
            {errorMessage}
          </div>
        )}

        <ul className="space-y-3 max-h-150 overflow-y-auto pr-1">
          {employees.map((e) => (
            <li key={e.id} className={ui.card}>
              <article className="flex items-start justify-between gap-3">
                <div>
                  <strong className="block">{e.name}</strong>
                  <p className={ui.subtitle}>
                    {e.employeePosition} • {e.departments.join(", ")}
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
