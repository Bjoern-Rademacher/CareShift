import type { ShiftSlot } from "@/types/scheduling";
import type { ShiftGroup } from "@/types/view";
import type { Weekday } from "@/types/common";

export const SHIFT_GROUP_DETAILS: Record<
  ShiftGroup,
  {
    label: string;
    symbol: string;
    textClass: string;
  }
> = {
  MORNING: {
    label: "Morning",
    symbol: "☀",
    textClass: "text-amber-600 dark:text-amber-300",
  },
  EVENING: {
    label: "Evening",
    symbol: "☼",
    textClass: "text-orange-600 dark:text-orange-300",
  },
  NIGHT: {
    label: "Night",
    symbol: "☾",
    textClass: "text-sky-600 dark:text-sky-300",
  },
};

export const SHIFT_GROUP_ORDER: Record<ShiftGroup, number> = {
  MORNING: 0,
  EVENING: 1,
  NIGHT: 2,
};

export const POSITION_ORDER: Record<ShiftSlot["position"], number> = {
  HEAD_DOCTOR: 0,
  DOCTOR: 1,
  SURGEON: 1,
  NURSE: 2,
  MEDICAL_ASSISTANT: 2,
  INTERN: 3,
};

export function getEarliestStartingSlot(
  shiftSlots: ShiftSlot[],
): ShiftSlot | undefined {
  return shiftSlots.reduce<ShiftSlot | undefined>((earliest, slot) => {
    if (!earliest) {
      return slot;
    }

    return new Date(slot.startTime).getTime() <
      new Date(earliest.startTime).getTime()
      ? slot
      : earliest;
  }, undefined);
}

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  MON: "Mon",
  TUE: "Tue",
  WED: "Wed",
  THU: "Thu",
  FRI: "Fri",
  SAT: "Sat",
  SUN: "Sun",
};
