import type { ISODateString } from "@/types/common";
import type { ShiftGroup } from "@/types/view";

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
