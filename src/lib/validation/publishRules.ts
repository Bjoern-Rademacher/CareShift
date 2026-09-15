import {
  getRestHours,
  getShiftDurationHours,
  MAXIMUM_WEEKLY_HOURS,
  MINIMUM_REST_HOURS,
  shiftsOverlap,
} from "@/lib/validation/sharedRules";

import type { AssignableEmployee } from "@/types/employee";
import type {
  scheduleValidationError,
  ValidatableShiftSlot,
} from "@/types/scheduling";

function getEmployeeName(
  employeeId: string,
  employees: AssignableEmployee[],
): string {
  const employee = employees.find((employee) => employee.id === employeeId);

  return employee ? `${employee.firstName} ${employee.lastName}` : "Employee";
}

function groupSlotsByEmployee(
  shiftSlots: ValidatableShiftSlot[],
): Map<string, ValidatableShiftSlot[]> {
  const slotsByEmployee = new Map<string, ValidatableShiftSlot[]>();

  for (const slot of shiftSlots) {
    if (slot.employeeId === null) {
      continue;
    }

    const employeeSlots = slotsByEmployee.get(slot.employeeId) ?? [];

    employeeSlots.push(slot);
    slotsByEmployee.set(slot.employeeId, employeeSlots);
  }

  return slotsByEmployee;
}

export function checkMissingAssignments(
  shiftSlots: ValidatableShiftSlot[],
): scheduleValidationError[] {
  const errors: scheduleValidationError[] = [];

  // Every generated slot must be assigned before publishing.
  for (const slot of shiftSlots) {
    if (slot.employeeId !== null) {
      continue;
    }

    errors.push({
      code: "MISSING_ASSIGNMENT",
      message:
        `Missing assignment for ${slot.department} ` +
        `${slot.position} shift at ${slot.startTime.toISOString()}.`,
    });
  }

  return errors;
}

export function checkEmployeeOverlaps(
  shiftSlots: ValidatableShiftSlot[],
  employees: AssignableEmployee[],
): scheduleValidationError[] {
  const errors: scheduleValidationError[] = [];
  const slotsByEmployee = groupSlotsByEmployee(shiftSlots);

  for (const [employeeId, employeeSlots] of slotsByEmployee) {
    const sortedSlots = [...employeeSlots].sort(
      (firstSlot, secondSlot) =>
        firstSlot.startTime.getTime() - secondSlot.startTime.getTime(),
    );

    // Compare each slot with every later slot for the same employee.
    for (let firstIndex = 0; firstIndex < sortedSlots.length; firstIndex++) {
      for (
        let secondIndex = firstIndex + 1;
        secondIndex < sortedSlots.length;
        secondIndex++
      ) {
        const firstSlot = sortedSlots[firstIndex];
        const secondSlot = sortedSlots[secondIndex];

        if (!shiftsOverlap(firstSlot, secondSlot)) {
          continue;
        }

        const employeeName = getEmployeeName(employeeId, employees);

        errors.push({
          code: "DOUBLE_ASSIGNMENT",
          message:
            `${employeeName} is assigned to overlapping shifts at ` +
            `${firstSlot.startTime.toISOString()} and ` +
            `${secondSlot.startTime.toISOString()}.`,
        });
      }
    }
  }

  return errors;
}

export function checkEmployeeRestPeriods(
  shiftSlots: ValidatableShiftSlot[],
  employees: AssignableEmployee[],
): scheduleValidationError[] {
  const errors: scheduleValidationError[] = [];
  const slotsByEmployee = groupSlotsByEmployee(shiftSlots);

  for (const [employeeId, employeeSlots] of slotsByEmployee) {
    const sortedSlots = [...employeeSlots].sort(
      (firstSlot, secondSlot) =>
        firstSlot.startTime.getTime() - secondSlot.startTime.getTime(),
    );

    // Only consecutive shifts matter for minimum-rest validation.
    for (let index = 0; index < sortedSlots.length - 1; index++) {
      const earlierSlot = sortedSlots[index];
      const laterSlot = sortedSlots[index + 1];

      // Overlaps are reported separately.
      if (shiftsOverlap(earlierSlot, laterSlot)) {
        continue;
      }

      const restHours = getRestHours(earlierSlot, laterSlot);

      if (restHours >= MINIMUM_REST_HOURS) {
        continue;
      }

      const employeeName = getEmployeeName(employeeId, employees);

      errors.push({
        code: "INSUFFICIENT_REST",
        message:
          `${employeeName} only has ${restHours.toFixed(1)} hours of rest ` +
          `between shifts ending at ${earlierSlot.endTime.toISOString()} ` +
          `and starting at ${laterSlot.startTime.toISOString()}.`,
      });
    }
  }

  return errors;
}

export function checkEmployeeWeeklyHours(
  shiftSlots: ValidatableShiftSlot[],
  employees: AssignableEmployee[],
): scheduleValidationError[] {
  const errors: scheduleValidationError[] = [];
  const slotsByEmployee = groupSlotsByEmployee(shiftSlots);

  for (const [employeeId, employeeSlots] of slotsByEmployee) {
    const totalHours = employeeSlots.reduce(
      (sum, slot) => sum + getShiftDurationHours(slot),
      0,
    );

    if (totalHours <= MAXIMUM_WEEKLY_HOURS) {
      continue;
    }

    const employeeName = getEmployeeName(employeeId, employees);

    errors.push({
      code: "WEEKLY_HOURS_EXCEEDED",
      message:
        `${employeeName} is assigned ${totalHours.toFixed(1)} hours, ` +
        `exceeding the weekly limit of ${MAXIMUM_WEEKLY_HOURS} hours.`,
    });
  }

  return errors;
}
