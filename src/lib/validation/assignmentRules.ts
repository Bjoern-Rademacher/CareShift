import type { ValidatableShiftSlot } from "@/types/scheduling";
import type { AssignmentValidationError } from "@/types/scheduling";

const MINIMUM_REST_HOURS = 11;
const MAXIMUM_WEEKLY_HOURS = 40;

function shiftsOverlap(
  first: ValidatableShiftSlot,
  second: ValidatableShiftSlot,
): boolean {
  return (
    first.startTime.getTime() < second.endTime.getTime() &&
    second.startTime.getTime() < first.endTime.getTime()
  );
}

function getShiftDurationHours(slot: ValidatableShiftSlot): number {
  const durationMs = slot.endTime.getTime() - slot.startTime.getTime();

  return durationMs / (1000 * 60 * 60);
}

function getRestHours(
  earlierShift: ValidatableShiftSlot,
  laterShift: ValidatableShiftSlot,
): number {
  const restMs =
    laterShift.startTime.getTime() - earlierShift.endTime.getTime();

  return restMs / (1000 * 60 * 60);
}

function checkShiftOverlap(
  targetSlot: ValidatableShiftSlot,
  employeeSlots: ValidatableShiftSlot[],
): AssignmentValidationError | null {
  const conflictingSlot = employeeSlots.find(
    (slot) => slot.id !== targetSlot.id && shiftsOverlap(targetSlot, slot),
  );

  if (!conflictingSlot) return null;

  return {
    code: "SHIFT_OVERLAP",
    message: `Employee is already assigned to an overlapping shift starting at ${conflictingSlot.startTime.toISOString()}.`,
  };
}

function checkMinimumRestPeriod(
  targetSlot: ValidatableShiftSlot,
  employeeSlots: ValidatableShiftSlot[],
): AssignmentValidationError | null {
  for (const slot of employeeSlots) {
    if (slot.id === targetSlot.id) continue;

    // Existing shift ends before the proposed shift starts.
    if (slot.endTime.getTime() <= targetSlot.startTime.getTime()) {
      const restHours = getRestHours(slot, targetSlot);

      if (restHours < MINIMUM_REST_HOURS) {
        return {
          code: "INSUFFICIENT_REST",
          message: `Employee would only have ${restHours.toFixed(1)} hours of rest before this shift.`,
        };
      }
    }

    // Proposed shift ends before the existing shift starts.
    if (targetSlot.endTime.getTime() <= slot.startTime.getTime()) {
      const restHours = getRestHours(targetSlot, slot);

      if (restHours < MINIMUM_REST_HOURS) {
        return {
          code: "INSUFFICIENT_REST",
          message: `Employee would only have ${restHours.toFixed(1)} hours of rest after this shift.`,
        };
      }
    }
  }

  return null;
}

function checkWeeklyHours(
  targetSlot: ValidatableShiftSlot,
  employeeSlots: ValidatableShiftSlot[],
): AssignmentValidationError | null {
  const assignedHours = employeeSlots
    .filter((slot) => slot.id !== targetSlot.id)
    .reduce((total, slot) => total + getShiftDurationHours(slot), 0);

  const targetHours = getShiftDurationHours(targetSlot);
  const totalHours = assignedHours + targetHours;

  if (totalHours <= MAXIMUM_WEEKLY_HOURS) return null;

  return {
    code: "WEEKLY_HOURS_EXCEEDED",
    message: `Assignment would increase the employee's weekly workload to ${totalHours.toFixed(1)} hours.`,
  };
}

export function validateAssignment(
  targetSlot: ValidatableShiftSlot,
  employeeSlots: ValidatableShiftSlot[],
): AssignmentValidationError[] {
  const errors: AssignmentValidationError[] = [];

  const overlapError = checkShiftOverlap(targetSlot, employeeSlots);
  if (overlapError) errors.push(overlapError);

  const restError = checkMinimumRestPeriod(targetSlot, employeeSlots);
  if (restError) errors.push(restError);

  const weeklyHoursError = checkWeeklyHours(targetSlot, employeeSlots);
  if (weeklyHoursError) errors.push(weeklyHoursError);

  return errors;
}
