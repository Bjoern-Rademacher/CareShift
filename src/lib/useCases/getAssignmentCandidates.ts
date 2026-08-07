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

  /*
   * Workload is calculated for:
   * [Monday 00:00, next Monday 00:00)
   */
  const weekStart = getMonday(selectedSlot.startTime);
  const weekEnd = getWeekdayDate(weekStart, 7);

  /*
   * Extend the query beyond the week boundaries so rest periods
   * against the previous and next shift can also be checked.
   */
  const rangeStart = new Date(
    weekStart.getTime() - MINIMUM_REST_HOURS * HOUR_IN_MS,
  );

  const rangeEnd = new Date(
    weekEnd.getTime() + MINIMUM_REST_HOURS * HOUR_IN_MS,
  );

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
