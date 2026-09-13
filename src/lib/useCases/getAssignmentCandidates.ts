import { getAssignableEmployeesByDepartmentAndPosition } from "@/lib/db/employees";
import {
  getEmployeeAssignmentsInRange,
  getShiftSlotById,
} from "@/lib/db/shiftSlots";

import { createAssignmentCandidates } from "@/lib/functions/createAssignmentCandidates";

import { getMonday, getWeekdayDate } from "@/lib/functions/dateTimeUtils";

import type { EmployeeAssignmentCandidate } from "@/types/assignment";
import type { UUID } from "@/types/common";

const MINIMUM_REST_HOURS = 11;

const HOUR_IN_MS = 60 * 60 * 1000;
const DAY_IN_MS = 24 * HOUR_IN_MS;
const ROLLING_WINDOW_MS = 7 * DAY_IN_MS;

export async function getAssignmentCandidates(
  slotId: UUID,
): Promise<EmployeeAssignmentCandidate[]> {
  const selectedSlot = await getShiftSlotById(slotId);

  if (!selectedSlot) {
    throw new Error("Shift slot not found.");
  }

  const employees = await getAssignableEmployeesByDepartmentAndPosition({
    department: selectedSlot.department,
    position: selectedSlot.position,
  });

  if (employees.length === 0) {
    return [];
  }

  const employeeIds = employees.map((employee) => employee.id);

  const weekStart = getMonday(selectedSlot.startTime);
  const weekEnd = getWeekdayDate(weekStart, 7);

  // Range needed for calendar-week workload + rest checks.
  const restRangeStart = weekStart.getTime() - MINIMUM_REST_HOURS * HOUR_IN_MS;

  const restRangeEnd = weekEnd.getTime() + MINIMUM_REST_HOURS * HOUR_IN_MS;

  // Any rolling 7-day window affected by assigning this shift
  // must overlap the selected shift.
  const rollingRangeStart =
    selectedSlot.startTime.getTime() - ROLLING_WINDOW_MS;

  const rollingRangeEnd = selectedSlot.endTime.getTime() + ROLLING_WINDOW_MS;

  const rangeStart = new Date(Math.min(restRangeStart, rollingRangeStart));

  const rangeEnd = new Date(Math.max(restRangeEnd, rollingRangeEnd));

  const assignmentSlots = await getEmployeeAssignmentsInRange({
    employeeIds,
    rangeStart,
    rangeEnd,
  });

  return createAssignmentCandidates({
    selectedSlot,
    assignmentSlots,
    employees,
    weekStart,
    weekEnd,
  });
}
