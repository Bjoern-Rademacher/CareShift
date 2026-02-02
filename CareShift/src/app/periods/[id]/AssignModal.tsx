"use client";

import * as ui from "@/app/periods/uiCLasses";

import { UUID } from "@/types/common";
import { Employee } from "@/types/employee";

type Props = {
  isOpen: boolean;
  slotId: UUID | null;
  employees: Employee[];
  onConfirm: (employeeId: UUID) => void;
  onClose: () => void;
};

export default function AssignModal({
  isOpen,
  slotId,
  employees,
  onConfirm,
  onClose,
}: Props) {
  if (!isOpen || !slotId) return null;

  return (
    <section className={ui.overlay} onClick={onClose}>
      <article
        role="dialog"
        aria-modal="true"
        className={ui.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <header>
          <h3 className={ui.title}>Assign employee</h3>
        </header>

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
                  onClick={() => onConfirm(e.id)}
                >
                  Assign
                </button>
              </article>
            </li>
          ))}
        </ul>

        <footer>
          <button className={ui.button} onClick={onClose}>
            Close
          </button>
        </footer>
      </article>
    </section>
  );
}
