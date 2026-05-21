import type {
  ShiftSlot,
  SchedulePeriod,
  ValidationError,
} from "@/types/scheduling";

import type { Employee } from "@/types/employee";

export function validateSchedule(
  _period: SchedulePeriod,
  shiftSlots: ShiftSlot[],
  employees: Employee[],
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const slot of shiftSlots) {
    if (slot.employeeId === null) {
      errors.push({
        code: "MISSING_ASSIGNMENT",
        message: `Missing assignment for ${slot.department} ${slot.position} shift at ${slot.startTime}.`,
      });
    }
  }

  const assignedSlots = shiftSlots.filter((slot) => slot.employeeId !== null);

  for (let i = 0; i < assignedSlots.length; i++) {
    for (let j = i + 1; j < assignedSlots.length; j++) {
      const a = assignedSlots[i];
      const b = assignedSlots[j];

      if (a.employeeId !== b.employeeId) continue;

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
