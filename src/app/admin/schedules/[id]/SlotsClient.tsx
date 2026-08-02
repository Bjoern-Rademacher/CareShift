"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import * as ui from "@/ui/classes";

import SlotsTable from "@/app/admin/schedules/[id]/SlotsTable";
import AssignModal from "@/app/admin/schedules/[id]/AssignModal";
import {
  ValidationErrors,
  SystemErrors,
} from "@/app/admin/schedules/[id]/ErrorComponents";

import type {
  SchedulePeriod,
  ShiftSlot,
  PublishValidationError,
} from "@/types/scheduling";
import type { AssignmentValidationError } from "@/types/scheduling";
import type { AssignableEmployee } from "@/types/employee";
import type { UUID } from "@/types/common";

type Props = {
  periodId: UUID;
  shiftSlots: ShiftSlot[];
  employees: AssignableEmployee[];
  canAssign: boolean;
};

type AssignEmployeeResponse =
  | {
      ok: true;
      assigned: {
        slotId: UUID;
        employeeId: UUID;
      };
    }
  | {
      ok: false;
      errors: AssignmentValidationError[];
    }
  | {
      ok: false;
      error: string;
    };

type PublishPeriodResponse =
  | {
      ok: true;
      period: SchedulePeriod;
    }
  | {
      ok: false;
      errors: PublishValidationError[];
    };

export default function SlotsClient({
  periodId,
  shiftSlots,
  employees,
  canAssign,
}: Props) {
  const router = useRouter();

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<UUID | null>(null);
  const [isSavingAssign, setIsSavingAssign] = useState(false);

  const [publishErrors, setPublishErrors] = useState<PublishValidationError[]>(
    [],
  );
  const [publishSystemError, setPublishSystemError] = useState<string | null>(
    null,
  );
  const [assignmentValidationErrors, setAssignmentValidationErrors] = useState<
    AssignmentValidationError[]
  >([]);
  const [assignSystemError, setAssignSystemError] = useState<string | null>(
    null,
  );
  const [isPublishing, setIsPublishing] = useState(false);

  const selectedSlot = shiftSlots.find((s) => s.id === selectedSlotId);

  const eligibleEmployees = selectedSlot
    ? employees.filter(
        (employee) =>
          employee.departments.includes(selectedSlot.department) &&
          employee.position === selectedSlot.position,
      )
    : [];

  function handleCloseModal() {
    setIsAssignModalOpen(false);
    setSelectedSlotId(null);
    setAssignmentValidationErrors([]);
    setIsSavingAssign(false);
  }

  function onAssignClick(slotId: UUID) {
    if (!canAssign) return;

    setAssignmentValidationErrors([]);
    setSelectedSlotId(slotId);
    setIsAssignModalOpen(true);
  }

  async function assignEmployeeRequest(
    slotId: UUID,
    employeeId: UUID,
  ): Promise<AssignEmployeeResponse> {
    const res = await fetch(`/api/shift-slots/${slotId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ employeeId }),
    });

    const data = await res.json();

    // Expected business-rule failure.
    if (res.status === 409) {
      return data;
    }

    // Invalid request, missing resource, or unexpected system failure.
    if (!res.ok) {
      throw new Error(data.error ?? "Assignment failed.");
    }

    return data;
  }

  async function handleAssignConfirm(employeeId: UUID) {
    if (!selectedSlotId) {
      setAssignmentValidationErrors([
        {
          code: "NO_SLOT_SELECTED",
          message: "No slot selected.",
        },
      ]);
      return;
    }

    setAssignmentValidationErrors([]);
    setAssignSystemError(null);
    setIsSavingAssign(true);

    try {
      const result = await assignEmployeeRequest(selectedSlotId, employeeId);

      // Keep the modal open when assignment rules reject the request.
      if (!result.ok) {
        if ("errors" in result) {
          setAssignmentValidationErrors(result.errors);
          return;
        }
      }

      // Close only after a successful assignment.
      handleCloseModal();
      router.refresh();
    } catch (err) {
      // Keep the modal open for request or system failures.
      setAssignSystemError(
        err instanceof Error ? err.message : "Unexpected error",
      );
    } finally {
      setIsSavingAssign(false);
    }
  }

  async function publishPeriod(periodId: UUID): Promise<PublishPeriodResponse> {
    const res = await fetch(`/api/periods/${periodId}/publish`, {
      method: "POST",
    });

    const data = await res.json();

    // Expected business validation failure.
    if (res.status === 409) {
      return data;
    }

    // Unexpected server or network failure.
    if (!res.ok) {
      throw new Error(data.error ?? "Publishing failed.");
    }

    return data;
  }

  async function handlePublishClick() {
    setIsPublishing(true);
    setPublishErrors([]);
    setPublishSystemError(null);

    try {
      const result = await publishPeriod(periodId);

      // Schedule violates publishing rules.
      if (!result.ok) {
        setPublishErrors(result.errors);
        return;
      }

      // Reload the published state from the database.
      router.refresh();
    } catch (error) {
      // Publishing failed for a technical or unexpected reason.
      setPublishSystemError(
        error instanceof Error ? error.message : "Publishing failed.",
      );
    } finally {
      setIsPublishing(false);
    }
  }

  function handleCloseErrorModal() {
    setPublishErrors([]);
    setPublishSystemError(null);
  }

  return (
    <section>
      <SlotsTable
        shiftSlots={shiftSlots}
        employees={employees}
        onAssignClick={onAssignClick}
        canAssign={canAssign}
      />

      {canAssign && (
        <button onClick={handlePublishClick} className={ui.button}>
          {isPublishing ? "Publishing..." : "Publish Schedule"}
        </button>
      )}

      <ValidationErrors
        title={"Cannot publish schedule."}
        errors={publishErrors}
        onClose={handleCloseErrorModal}
      />
      <SystemErrors
        message={publishSystemError}
        onClose={handleCloseErrorModal}
      />

      {isAssignModalOpen && selectedSlotId && (
        <AssignModal
          employees={eligibleEmployees}
          onConfirm={handleAssignConfirm}
          onClose={handleCloseModal}
          isSaving={isSavingAssign}
          validationErrors={assignmentValidationErrors}
          closeValidationErrors={() => setAssignmentValidationErrors([])}
          systemError={assignSystemError}
          closeSystemError={() => setAssignSystemError(null)}
        />
      )}
    </section>
  );
}
