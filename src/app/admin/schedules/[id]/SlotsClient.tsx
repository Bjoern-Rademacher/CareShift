"use client";

import { useState } from "react";

import * as ui from "@/ui/classes";

import SlotsTable from "@/app/admin/schedules/[id]/SlotsTable";
import AssignModal from "@/app/admin/schedules/[id]/AssignModal";
import PublishErrors from "@/app/admin/schedules/[id]/PublishErrors";

import type { ShiftSlot, ValidationError } from "@/types/scheduling";
import type { Employee } from "@/types/employee";
import { UUID } from "@/types/common";

type Props = {
  periodId: UUID;
  initialShiftSlots: ShiftSlot[];
  employees: Employee[];
  canAssign: boolean;
};

type AssignedSlotResponse = {
  ok: true;
  assigned: { slotId: UUID; employeeId: UUID };
};

export default function SlotsClient({
  periodId,
  initialShiftSlots,
  employees,
  canAssign,
}: Props) {
  const [shiftSlots, setShiftSlots] = useState<ShiftSlot[]>(initialShiftSlots);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<UUID | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [isSavingAssign, setIsSavingAssign] = useState(false);
  const [publishErrors, setPublishErrors] = useState<ValidationError[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  const selectedSlot = shiftSlots.find((s) => s.id === selectedSlotId);
  const eligibleEmployees = selectedSlot
    ? employees.filter((e) => e.departments.includes(selectedSlot.department))
    : [];

  function handleCloseModal() {
    setIsAssignModalOpen(false);
    setSelectedSlotId(null);
    setAssignError(null);
    setIsSavingAssign(false);
  }

  function onAssignClick(slotId: UUID) {
    if (!canAssign) return;

    setAssignError(null);
    setSelectedSlotId(slotId);
    setIsAssignModalOpen(true);
  }

  async function assignEmployeeToSlot(
    slotId: UUID,
    employeeId: UUID,
  ): Promise<AssignedSlotResponse> {
    const res = await fetch(`/api/shift-slots/${slotId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Request failed");
    }

    return res.json() as Promise<AssignedSlotResponse>;
  }

  async function handleAssignConfirm(employeeId: UUID) {
    if (!selectedSlotId) {
      setAssignError("No slot selected");
      return;
    }
    if (!employeeId) {
      setAssignError("No employee id");
      return;
    }

    setAssignError(null);
    setIsSavingAssign(true);

    try {
      const res = await assignEmployeeToSlot(selectedSlotId, employeeId);

      setShiftSlots((prev) =>
        prev.map((s) =>
          s.id === res.assigned.slotId
            ? { ...s, employeeId: res.assigned.employeeId }
            : s,
        ),
      );

      handleCloseModal();
    } catch (err) {
      setAssignError(err instanceof Error ? err.message : "Unexpected error");
      setIsSavingAssign(false);
    }
  }

  async function publishPeriod(periodId: UUID) {
    const res = await fetch(`/api/periods/${periodId}/publish`, {
      method: "POST",
    });

    const data = await res.json();

    if (res.status === 400) {
      return data; // expected validation failure
    }

    if (!res.ok) {
      throw new Error(data.error ?? "Publishing failed");
    }

    return data; // success
  }

  async function handlePublishClick() {
    setIsPublishing(true);
    setPublishErrors([]);

    const result = await publishPeriod(periodId);

    if (!result.ok) {
      setPublishErrors(result.errors);
      setIsErrorModalOpen(true);
      setIsPublishing(false);
      return;
    }

    setIsPublishing(false);
  }

  function handleCloseErrorModal() {
    setPublishErrors([]);
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
      <PublishErrors errors={publishErrors} onClose={handleCloseErrorModal} />
      {isAssignModalOpen && selectedSlotId && (
        <AssignModal
          employees={eligibleEmployees}
          onConfirm={handleAssignConfirm}
          onClose={handleCloseModal}
          isSaving={isSavingAssign}
          errorMessage={assignError}
        />
      )}
    </section>
  );
}
