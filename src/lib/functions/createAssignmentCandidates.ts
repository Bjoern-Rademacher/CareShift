import { getWeekday } from "@/lib/functions/dateTimeUtils";
import { mapAssignmentShiftToShiftSlot } from "@/lib/mappers/scheduleMappers";

import type {
  AssignmentShift,
  EmployeeAssignmentCandidate,
  EmployeeWorkload,
  NeighborShift,
} from "@/types/assignment";
import type { AssignableEmployee } from "@/types/employee";

const HOUR_IN_MS = 60 * 60 * 1000;

const MAXIMUM_WEEKLY_HOURS = 40;
const MINIMUM_REST_HOURS = 11;

type Input = {
  selectedSlot: AssignmentShift;
  assignmentSlots: AssignmentShift[];
  employees: AssignableEmployee[];
  weekStart: Date;
  weekEnd: Date;
};

function getDurationHours(slot: AssignmentShift): number {
  return (slot.endTime.getTime() - slot.startTime.getTime()) / HOUR_IN_MS;
}

function getHoursWithinRange(
  slot: AssignmentShift,
  rangeStart: Date,
  rangeEnd: Date,
): number {
  const startTime = Math.max(slot.startTime.getTime(), rangeStart.getTime());

  const endTime = Math.min(slot.endTime.getTime(), rangeEnd.getTime());

  if (endTime <= startTime) {
    return 0;
  }

  return (endTime - startTime) / HOUR_IN_MS;
}

function getShiftGroup(startTime: Date): "MORNING" | "EVENING" | "NIGHT" {
  const hour = startTime.getUTCHours();

  if (hour >= 6 && hour < 14) {
    return "MORNING";
  }

  if (hour >= 14 && hour < 22) {
    return "EVENING";
  }

  return "NIGHT";
}

function shiftsOverlap(
  first: AssignmentShift,
  second: AssignmentShift,
): boolean {
  return (
    first.startTime.getTime() < second.endTime.getTime() &&
    second.startTime.getTime() < first.endTime.getTime()
  );
}

function calculateWorkload(
  employeeSlots: AssignmentShift[],
  weekStart: Date,
  weekEnd: Date,
): EmployeeWorkload {
  const assignedHours = employeeSlots.reduce(
    (total, slot) => total + getHoursWithinRange(slot, weekStart, weekEnd),
    0,
  );

  const nightShiftCount = employeeSlots.filter(
    (slot) => getShiftGroup(slot.startTime) === "NIGHT",
  ).length;

  const weekendShiftCount = employeeSlots.filter((slot) => {
    const weekday = getWeekday(slot.startTime);

    return weekday === "SAT" || weekday === "SUN";
  }).length;

  return {
    assignedHours,
    targetHours: MAXIMUM_WEEKLY_HOURS,
    shiftCount: employeeSlots.length,
    nightShiftCount,
    weekendShiftCount,
  };
}

function createPreviousShiftInfo(
  previousSlot: AssignmentShift | undefined,
  selectedSlot: AssignmentShift,
): NeighborShift | null {
  if (!previousSlot) {
    return null;
  }

  const overlaps = shiftsOverlap(previousSlot, selectedSlot);

  const restHours =
    (selectedSlot.startTime.getTime() - previousSlot.endTime.getTime()) /
    HOUR_IN_MS;

  return {
    shiftSlot: mapAssignmentShiftToShiftSlot(previousSlot),
    restHours,
    overlaps,
    hasEnoughRest: !overlaps && restHours >= MINIMUM_REST_HOURS,
  };
}

function createNextShiftInfo(
  nextSlot: AssignmentShift | undefined,
  selectedSlot: AssignmentShift,
): NeighborShift | null {
  if (!nextSlot) {
    return null;
  }

  const overlaps = shiftsOverlap(selectedSlot, nextSlot);

  const restHours =
    (nextSlot.startTime.getTime() - selectedSlot.endTime.getTime()) /
    HOUR_IN_MS;

  return {
    shiftSlot: mapAssignmentShiftToShiftSlot(nextSlot),
    restHours,
    overlaps,
    hasEnoughRest: !overlaps && restHours >= MINIMUM_REST_HOURS,
  };
}

function getNeighborShifts(
  employeeSlots: AssignmentShift[],
  selectedSlot: AssignmentShift,
): {
  previousShift: NeighborShift | null;
  nextShift: NeighborShift | null;
} {
  const selectedStart = selectedSlot.startTime.getTime();

  const sortedSlots = [...employeeSlots].sort(
    (first, second) => first.startTime.getTime() - second.startTime.getTime(),
  );

  const previousSlot = [...sortedSlots]
    .reverse()
    .find((slot) => slot.startTime.getTime() < selectedStart);

  const nextSlot = sortedSlots.find(
    (slot) => slot.startTime.getTime() >= selectedStart,
  );

  return {
    previousShift: createPreviousShiftInfo(previousSlot, selectedSlot),
    nextShift: createNextShiftInfo(nextSlot, selectedSlot),
  };
}

export function createAssignmentCandidates({
  selectedSlot,
  assignmentSlots,
  employees,
  weekStart,
  weekEnd,
}: Input): EmployeeAssignmentCandidate[] {
  const selectedSlotHours = getHoursWithinRange(
    selectedSlot,
    weekStart,
    weekEnd,
  );

  return employees
    .map((employee) => {
      /*
       * Exclude the selected slot when reassignment is being evaluated.
       * Otherwise its current employee would appear to collide with the
       * slot being reassigned.
       */
      const employeeSlots = assignmentSlots.filter(
        (slot) =>
          slot.employeeId === employee.id && slot.id !== selectedSlot.id,
      );

      const weeklyEmployeeSlots = employeeSlots.filter(
        (slot) =>
          slot.startTime.getTime() >= weekStart.getTime() &&
          slot.startTime.getTime() < weekEnd.getTime(),
      );

      const workload = calculateWorkload(
        weeklyEmployeeSlots,
        weekStart,
        weekEnd,
      );

      const { previousShift, nextShift } = getNeighborShifts(
        employeeSlots,
        selectedSlot,
      );

      const exceedsWeeklyHours =
        workload.assignedHours + selectedSlotHours > MAXIMUM_WEEKLY_HOURS;

      const hasOverlap =
        previousShift?.overlaps === true || nextShift?.overlaps === true;

      const hasInsufficientRest =
        previousShift?.hasEnoughRest === false ||
        nextShift?.hasEnoughRest === false;

      let unavailableReason: EmployeeAssignmentCandidate["unavailableReason"] =
        null;

      if (hasOverlap) {
        unavailableReason = "OVERLAP";
      } else if (hasInsufficientRest) {
        unavailableReason = "INSUFFICIENT_REST";
      } else if (exceedsWeeklyHours) {
        unavailableReason = "AT_CAPACITY";
      }

      return {
        employee,
        workload,
        previousShift,
        nextShift,
        assignable: unavailableReason === null,
        unavailableReason,
      };
    })
    .sort((first, second) => {
      if (first.assignable !== second.assignable) {
        return first.assignable ? -1 : 1;
      }

      const workloadDifference =
        first.workload.assignedHours - second.workload.assignedHours;

      if (workloadDifference !== 0) {
        return workloadDifference;
      }

      const lastNameDifference = first.employee.lastName.localeCompare(
        second.employee.lastName,
      );

      if (lastNameDifference !== 0) {
        return lastNameDifference;
      }

      return first.employee.firstName.localeCompare(second.employee.firstName);
    });
}
