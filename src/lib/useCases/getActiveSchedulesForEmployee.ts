import { getShiftSlotsByEmployee } from "@/lib/db/shiftSlots";

import type { ISODateString, UUID } from "@/types/common";
import type { ShiftSlot } from "@/types/scheduling";

import { EmployeeActiveSchedule } from "@/types/employee";

export type ScheduleVisibility = "PUBLISHED_ONLY" | "INCLUDE_UNPUBLISHED";

function toISODateString(date: Date): ISODateString {
  return date.toISOString() as ISODateString;
}

export async function getActiveSchedulesForEmployee(
  employeeId: UUID,
  visibility: ScheduleVisibility,
): Promise<EmployeeActiveSchedule[]> {
  const shiftSlots = await getShiftSlotsByEmployee(employeeId, visibility);

  const now = new Date();

  const activeShiftSlots = shiftSlots.filter(
    (slot) => slot.period.endDate > now,
  );

  const schedulesByPeriod = new Map<UUID, EmployeeActiveSchedule>();

  for (const slot of activeShiftSlots) {
    const existingSchedule = schedulesByPeriod.get(slot.period.id);

    const shiftSlot: ShiftSlot = {
      id: slot.id,
      periodId: slot.periodId,
      employeeId: slot.employeeId,
      department: slot.department,
      position: slot.position,
      slotNumber: slot.slotNumber,
      startTime: toISODateString(slot.startTime),
      endTime: toISODateString(slot.endTime),
    };

    if (existingSchedule) {
      existingSchedule.shiftSlots.push(shiftSlot);
      continue;
    }

    schedulesByPeriod.set(slot.period.id, {
      period: {
        id: slot.period.id,
        department: slot.period.department,
        startDate: toISODateString(slot.period.startDate),
        endDate: toISODateString(slot.period.endDate),
        status: slot.period.status,
      },
      shiftSlots: [shiftSlot],
    });
  }

  return Array.from(schedulesByPeriod.values()).sort(
    (first, second) =>
      new Date(first.period.startDate).getTime() -
      new Date(second.period.startDate).getTime(),
  );
}
