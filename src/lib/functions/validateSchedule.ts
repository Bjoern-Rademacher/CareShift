import type { ShiftSlot, Schedule, ValidationError } from "@/types/scheduling";

import type { Employee } from "@/types/employee";

export function validateSchedule(
  _period: Schedule,
  shiftSlots: ShiftSlot[],
  employees: Employee[],
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Rule 1: every generated shift slot must be assigned before publishing
  for (const slot of shiftSlots) {
    if (slot.employeeId === null) {
      errors.push({
        code: "MISSING_ASSIGNMENT",
        message: `Missing assignment for ${slot.department} ${slot.position} shift at ${slot.startTime}.`,
      });
    }
  }

  // Only assigned slots can create employee conflicts
  const assignedSlots = shiftSlots.filter((slot) => slot.employeeId !== null);

  // Rule 2: the same employee must not be assigned to overlapping shifts
  for (let i = 0; i < assignedSlots.length; i++) {
    for (let j = i + 1; j < assignedSlots.length; j++) {
      const a = assignedSlots[i];
      const b = assignedSlots[j];

      // Different employees cannot conflict with each other
      if (a.employeeId !== b.employeeId) continue;

      // ISO timestamps can be compared directly because they use the same format
      const overlaps = a.startTime < b.endTime && b.startTime < a.endTime;

      if (overlaps) {
        const employee = employees.find((e) => e.id === a.employeeId);

        errors.push({
          code: "DOUBLE_ASSIGNMENT",
          message: `${
            employee?.name ?? "Employee"
          } is assigned to overlapping shifts: ${a.startTime} and ${b.startTime}.`,
        });
      }
    }
  }

  return errors;
}
