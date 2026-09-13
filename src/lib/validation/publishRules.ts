import type { AssignableEmployee } from "@/types/employee";

import type {
  PublishValidationError,
  ValidatableShiftSlot,
} from "@/types/scheduling";

import {
  getRestHours,
  getShiftDurationHours,
  MAXIMUM_WEEKLY_HOURS,
  MINIMUM_REST_HOURS,
  shiftsOverlap,
} from "@/lib/validation/sharedRules";

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
    if (slot.employeeId === null) continue;

    const employeeSlots = slotsByEmployee.get(slot.employeeId) ?? [];

    employeeSlots.push(slot);

    slotsByEmployee.set(slot.employeeId, employeeSlots);
  }

  return slotsByEmployee;
}

export function checkMissingAssignments(
  shiftSlots: ValidatableShiftSlot[],
): PublishValidationError[] {
  const errors: PublishValidationError[] = [];

  // Every generated slot must be assigned before publishing.
  for (const slot of shiftSlots) {
    if (slot.employeeId !== null) continue;

    errors.push({
      code: "MISSING_ASSIGNMENT",
      message: `Missing assignment for ${slot.department} ${slot.position} shift at ${slot.startTime.toISOString()}.`,
    });
  }

  return errors;
}

export function checkEmployeeOverlaps(
  shiftSlots: ValidatableShiftSlot[],
  employees: AssignableEmployee[],
): PublishValidationError[] {
  const errors: PublishValidationError[] = [];
  const slotsByEmployee = groupSlotsByEmployee(shiftSlots);

  for (const [employeeId, employeeSlots] of slotsByEmployee) {
    const sortedSlots = [...employeeSlots].sort(
      (firstSlot, secondSlot) =>
        firstSlot.startTime.getTime() - secondSlot.startTime.getTime(),
    );

    // Compare each slot with every later slot for the same employee.
    for (let i = 0; i < sortedSlots.length; i++) {
      for (let j = i + 1; j < sortedSlots.length; j++) {
        const firstSlot = sortedSlots[i];
        const secondSlot = sortedSlots[j];

        if (!shiftsOverlap(firstSlot, secondSlot)) {
          continue;
        }

        const employeeName = getEmployeeName(employeeId, employees);

        errors.push({
          code: "DOUBLE_ASSIGNMENT",
          message: `${employeeName} is assigned to overlapping shifts at ${firstSlot.startTime.toISOString()} and ${secondSlot.startTime.toISOString()}.`,
        });
      }
    }
  }

  return errors;
}

export function checkEmployeeRestPeriods(
  shiftSlots: ValidatableShiftSlot[],
  employees: AssignableEmployee[],
): PublishValidationError[] {
  const errors: PublishValidationError[] = [];
  const slotsByEmployee = groupSlotsByEmployee(shiftSlots);

  for (const [employeeId, employeeSlots] of slotsByEmployee) {
    const sortedSlots = [...employeeSlots].sort(
      (firstSlot, secondSlot) =>
        firstSlot.startTime.getTime() - secondSlot.startTime.getTime(),
    );

    // Only consecutive shifts matter for minimum-rest validation.
    for (let i = 0; i < sortedSlots.length - 1; i++) {
      const earlierSlot = sortedSlots[i];
      const laterSlot = sortedSlots[i + 1];

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
        message: `${employeeName} only has ${restHours.toFixed(1)} hours of rest between shifts ending at ${earlierSlot.endTime.toISOString()} and starting at ${laterSlot.startTime.toISOString()}.`,
      });
    }
  }

  return errors;
}

export function checkEmployeeWeeklyHours(
  shiftSlots: ValidatableShiftSlot[],
  employees: AssignableEmployee[],
): PublishValidationError[] {
  const errors: PublishValidationError[] = [];
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
      message: `${employeeName} is assigned ${totalHours.toFixed(1)} hours, exceeding the weekly limit of ${MAXIMUM_WEEKLY_HOURS} hours.`,
    });
  }

  return errors;
}
