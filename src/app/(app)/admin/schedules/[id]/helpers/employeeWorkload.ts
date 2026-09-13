import { getWeekday } from "@/lib/functions/dateTimeUtils";
import { getShiftGroup } from "@/lib/functions/scheduleUtils";

import type { ShiftSlot } from "@/types/scheduling";
import type { UUID } from "@/types/common";

const HOUR_IN_MS = 60 * 60 * 1000;
const MINIMUM_REST_HOURS = 11;
const DEFAULT_TARGET_HOURS = 40;

export type EmployeeWorkloadStatus =
  | "AVAILABLE"
  | "NEAR_LIMIT"
  | "AT_LIMIT"
  | "OVER_LIMIT"
  | "REST_WARNING";

export type EmployeeWorkload = {
  assignedHours: number;
  targetHours: number;
  shiftCount: number;
  nightShiftCount: number;
  weekendShiftCount: number;
  minimumRestHours: number | null;
  hasRestViolation: boolean;
  status: EmployeeWorkloadStatus;
};

function getShiftDurationHours(slot: ShiftSlot): number {
  const startTime = new Date(slot.startTime).getTime();
  const endTime = new Date(slot.endTime).getTime();

  return (endTime - startTime) / HOUR_IN_MS;
}

function getMinimumRestHours(shiftSlots: ShiftSlot[]): number | null {
  if (shiftSlots.length < 2) {
    return null;
  }

  const sortedSlots = [...shiftSlots].sort(
    (first, second) =>
      new Date(first.startTime).getTime() -
      new Date(second.startTime).getTime(),
  );

  let minimumRestHours = Infinity;

  for (let index = 1; index < sortedSlots.length; index++) {
    const previousSlot = sortedSlots[index - 1];
    const currentSlot = sortedSlots[index];

    const restHours =
      (new Date(currentSlot.startTime).getTime() -
        new Date(previousSlot.endTime).getTime()) /
      HOUR_IN_MS;

    minimumRestHours = Math.min(minimumRestHours, restHours);
  }

  return minimumRestHours;
}

function getWorkloadStatus({
  assignedHours,
  targetHours,
  hasRestViolation,
}: {
  assignedHours: number;
  targetHours: number;
  hasRestViolation: boolean;
}): EmployeeWorkloadStatus {
  if (hasRestViolation) {
    return "REST_WARNING";
  }

  if (assignedHours > targetHours) {
    return "OVER_LIMIT";
  }

  if (assignedHours === targetHours) {
    return "AT_LIMIT";
  }

  if (assignedHours >= targetHours * 0.8) {
    return "NEAR_LIMIT";
  }

  return "AVAILABLE";
}

export function calculateEmployeeWorkload(
  shiftSlots: ShiftSlot[],
  employeeId: UUID,
  targetHours = DEFAULT_TARGET_HOURS,
): EmployeeWorkload {
  const employeeSlots = shiftSlots.filter(
    (slot) => slot.employeeId === employeeId,
  );

  const assignedHours = employeeSlots.reduce(
    (total, slot) => total + getShiftDurationHours(slot),
    0,
  );

  const nightShiftCount = employeeSlots.filter(
    (slot) => getShiftGroup(slot.startTime) === "NIGHT",
  ).length;

  const weekendShiftCount = employeeSlots.filter((slot) => {
    const weekday = getWeekday(new Date(slot.startTime));

    return weekday === "SAT" || weekday === "SUN";
  }).length;

  const minimumRestHours = getMinimumRestHours(employeeSlots);

  const hasRestViolation =
    minimumRestHours !== null && minimumRestHours < MINIMUM_REST_HOURS;

  return {
    assignedHours,
    targetHours,
    shiftCount: employeeSlots.length,
    nightShiftCount,
    weekendShiftCount,
    minimumRestHours,
    hasRestViolation,
    status: getWorkloadStatus({
      assignedHours,
      targetHours,
      hasRestViolation,
    }),
  };
}
