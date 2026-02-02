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
};

export default function SlotsClient({ initialShiftSlots, employees }: Props) {
  const [shiftSlots, setShiftSlots] = useState<ShiftSlot[]>(initialShiftSlots);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<UUID | null>(null);

  function onAssignClick(slotId: UUID) {
    setSelectedSlotId(slotId);
    setIsAssignModalOpen(true);
    console.log("on Assign Click");
  }

  const selectedSlot = shiftSlots.find((s) => s.id === selectedSlotId);
  const eligibleEmployees = selectedSlot
    ? employees.filter((e) => e.departments.includes(selectedSlot.department))
    : [];

  async function handleAssignConfirm(employeeId: UUID) {
    /* fetch is blocked by CORS / mock limitation. It's here to demonstrate intent
    await fetch("/api/shift-slots/assign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        slotId: selectedSlotId,
        employeeId,
      }),
    }); */

    if (!selectedSlotId) return;
    const updatedShiftSlots = shiftSlots.map((s) => {
      if (s.id === selectedSlotId) {
        return { ...s, employeeId };
      }
      return s;
    });
    setShiftSlots(updatedShiftSlots);
  }

  function handleCloseModal() {
    setIsAssignModalOpen(false);
  }

  return (
    <section>
      <SlotsTable
        shiftSlots={shiftSlots}
        employees={employees}
        onAssignClick={onAssignClick}
      />
      <AssignModal
        isOpen={isAssignModalOpen}
        slotId={selectedSlotId}
        employees={eligibleEmployees}
        onConfirm={handleAssignConfirm}
        onClose={handleCloseModal}
      />
    </section>
  );
}
