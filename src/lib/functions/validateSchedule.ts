import type { ValidatableShiftSlot, ValidationError } from "@/types/scheduling";

import type { AssignableEmployee } from "@/types/employee";

export function validateSchedule(
  shiftSlots: ValidatableShiftSlot[],
  employees: AssignableEmployee[],
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Rule 1: Every generated shift slot must be assigned before publishing.
  for (const slot of shiftSlots) {
    if (slot.employeeId === null) {
      errors.push({
        code: "MISSING_ASSIGNMENT",
        message: `Missing assignment for ${slot.department} ${slot.position} shift at ${slot.startTime.toISOString()}.`,
      });
    }
  }

  // Only assigned slots can create employee conflicts.
  const assignedSlots = shiftSlots.filter((slot) => slot.employeeId !== null);

  // Rule 2: The same employee must not be assigned to overlapping shifts.
  for (let i = 0; i < assignedSlots.length; i++) {
    for (let j = i + 1; j < assignedSlots.length; j++) {
      const a = assignedSlots[i];
      const b = assignedSlots[j];

      // Different employees cannot conflict with each other.
      if (a.employeeId !== b.employeeId) continue;

      // Two shifts overlap if each starts before the other one ends.
      const overlaps =
        a.startTime.getTime() < b.endTime.getTime() &&
        b.startTime.getTime() < a.endTime.getTime();

      if (!overlaps) continue;

      const employee = employees.find(
        (employee) => employee.id === a.employeeId,
      );

      const employeeName = employee
        ? `${employee.firstName} ${employee.lastName}`
        : "Employee";

      errors.push({
        code: "DOUBLE_ASSIGNMENT",
        message: `${employeeName} is assigned to overlapping shifts: ${a.startTime.toISOString()} and ${b.startTime.toISOString()}.`,
      });
    }
  }

  return errors;
}
