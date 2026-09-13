import type { AssignableEmployee } from "@/types/employee";

import type {
  scheduleValidationError,
  ValidatableShiftSlot,
} from "@/types/scheduling";

import {
  checkEmployeeOverlaps,
  checkEmployeeRestPeriods,
  checkEmployeeWeeklyHours,
  checkMissingAssignments,
} from "@/lib/validation/publishRules";

export function validateSchedule(
  shiftSlots: ValidatableShiftSlot[],
  employees: AssignableEmployee[],
): scheduleValidationError[] {
  return [
    ...checkMissingAssignments(shiftSlots),
    ...checkEmployeeOverlaps(shiftSlots, employees),
    ...checkEmployeeRestPeriods(shiftSlots, employees),
    ...checkEmployeeWeeklyHours(shiftSlots, employees),
  ];
}
