import { ShiftGroup } from "@/types/view";

export function getShiftGroup(startTime: string): ShiftGroup {
  const hour = new Date(startTime).getUTCHours();

  if (hour >= 6 && hour < 14) {
    return "MORNING";
  }

  if (hour >= 14 && hour < 22) {
    return "EVENING";
  }

  return "NIGHT";
}
