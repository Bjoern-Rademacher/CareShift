"use client";

import { useState } from "react";

import SlotsTable from "@/app/periods/[id]/SlotsTable";
import AssignModal from "@/app/periods/[id]/AssignModal";

import type { ShiftSlot } from "@/types/scheduling";
import type { Employee } from "@/types/employee";
import { UUID } from "@/types/common";

type Props = {
  initialShiftSlots: ShiftSlot[];
  employees: Employee[];
  canAssign: boolean;
};

type AssignedSlotResponse = {
  ok: true;
  assigned: { slotId: UUID; employeeId: UUID };
};

export default function SlotsClient({
  initialShiftSlots,
  employees,
  canAssign,
}: Props) {
  const [shiftSlots, setShiftSlots] = useState<ShiftSlot[]>(initialShiftSlots);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<UUID | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [isSavingAssign, setIsSavingAssign] = useState(false);

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

  const selectedSlot = shiftSlots.find((s) => s.id === selectedSlotId);
  const eligibleEmployees = selectedSlot
    ? employees.filter((e) => e.departments.includes(selectedSlot.department))
    : [];

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

  return (
    <section>
      <SlotsTable
        shiftSlots={shiftSlots}
        employees={employees}
        onAssignClick={onAssignClick}
        canAssign={canAssign}
      />
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
