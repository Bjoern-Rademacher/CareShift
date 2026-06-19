import type { ISODateString, UUID } from "@/types/common";
import type { ShiftSlot } from "@/types/scheduling";
import { DbShiftSlot } from "@/types/scheduling";

export function toUiShiftSlot(slot: DbShiftSlot): ShiftSlot {
  return {
    id: slot.id as UUID,
    periodId: slot.periodId as UUID,
    employeeId: slot.employeeId as UUID | null,
    department: slot.department,
    position: slot.position,
    startTime: slot.startTime.toISOString() as ISODateString,
    endTime: slot.endTime.toISOString() as ISODateString,
  };
}

export function toUiShiftSlots(slots: DbShiftSlot[]): ShiftSlot[] {
  return slots.map(toUiShiftSlot);
}
