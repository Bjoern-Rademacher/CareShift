import { getWeekday } from "@/lib/functions/dateTimeUtils";
import { getShiftGroup } from "@/lib/functions/scheduleUtils";

import type { AssignmentFilter, ScheduleFilters } from "@/types/view";
import type { ShiftSlot } from "@/types/scheduling";

function matchesAssignmentFilter(
  slot: ShiftSlot,
  assignment: AssignmentFilter,
): boolean {
  if (assignment === "ASSIGNED") {
    return slot.employeeId !== null;
  }

  if (assignment === "UNASSIGNED") {
    return slot.employeeId === null;
  }

  return true;
}

export function filterSchedule(
  shiftSlots: ShiftSlot[],
  filters: ScheduleFilters,
): ShiftSlot[] {
  return shiftSlots.filter((slot) => {
    const weekday = getWeekday(new Date(slot.startTime));
    const shiftGroup = getShiftGroup(slot.startTime);

    return (
      filters.weekdays.includes(weekday) &&
      filters.shiftGroups.includes(shiftGroup) &&
      matchesAssignmentFilter(slot, filters.assignment)
    );
  });
}
