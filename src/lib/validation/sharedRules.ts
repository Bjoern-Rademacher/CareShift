import type { ValidatableShiftSlot } from "@/types/scheduling";

export const MINIMUM_REST_HOURS = 11;
export const MAXIMUM_WEEKLY_HOURS = 40;

const MILLISECONDS_PER_HOUR = 1000 * 60 * 60;

export function shiftsOverlap(
  firstSlot: ValidatableShiftSlot,
  secondSlot: ValidatableShiftSlot,
): boolean {
  return (
    firstSlot.startTime.getTime() < secondSlot.endTime.getTime() &&
    secondSlot.startTime.getTime() < firstSlot.endTime.getTime()
  );
}

export function getShiftDurationHours(slot: ValidatableShiftSlot): number {
  const durationMs = slot.endTime.getTime() - slot.startTime.getTime();

  return durationMs / MILLISECONDS_PER_HOUR;
}

export function getRestHours(
  earlierSlot: ValidatableShiftSlot,
  laterSlot: ValidatableShiftSlot,
): number {
  const restMs = laterSlot.startTime.getTime() - earlierSlot.endTime.getTime();

  return restMs / MILLISECONDS_PER_HOUR;
}
