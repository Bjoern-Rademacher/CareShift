import type { ISODateString } from "@/types/common";
import type { ShiftGroup } from "@/types/view";

type ShiftTimeRange = {
  startTime: Date | ISODateString;
  endTime: Date | ISODateString;
};

export function getShiftGroup(startTime: Date | ISODateString): ShiftGroup {
  const date = startTime instanceof Date ? startTime : new Date(startTime);

  const hour = date.getUTCHours();

  if (hour >= 6 && hour < 14) {
    return "MORNING";
  }

  if (hour >= 14 && hour < 22) {
    return "EVENING";
  }

  return "NIGHT";
}

export function getShiftDurationHours(shift: ShiftTimeRange): number {
  const start = new Date(shift.startTime).getTime();
  const end = new Date(shift.endTime).getTime();

  return (end - start) / 3_600_000;
}

export function getTotalShiftHours(shifts: readonly ShiftTimeRange[]): number {
  return shifts.reduce(
    (total, shift) => total + getShiftDurationHours(shift),
    0,
  );
}

export function formatHours(hours: number): string {
  return Number.isInteger(hours) ? hours.toString() : hours.toFixed(1);
}
