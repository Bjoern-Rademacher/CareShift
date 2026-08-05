import type { ShiftSlot } from "@/types/scheduling";
import type { Weekday } from "@/types/common";

import { getWeekday } from "@/lib/functions/dateTimeUtils";

export type ShiftGroup = "MORNING" | "EVENING" | "NIGHT";

export type WeekGridRow = {
  key: string;
  shiftGroup: ShiftGroup;
  position: ShiftSlot["position"];
  slotNumber: number;
  slots: Partial<Record<Weekday, ShiftSlot>>;
};

export const WEEKDAYS: Weekday[] = [
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
  "SUN",
];

const SHIFT_GROUP_ORDER: Record<ShiftGroup, number> = {
  MORNING: 0,
  EVENING: 1,
  NIGHT: 2,
};

const POSITION_ORDER: Record<ShiftSlot["position"], number> = {
  HEAD_DOCTOR: 0,
  DOCTOR: 1,
  SURGEON: 1,
  NURSE: 2,
  MEDICAL_ASSISTANT: 2,
  INTERN: 3,
};

function getShiftGroup(startTime: string): ShiftGroup {
  const hour = new Date(startTime).getUTCHours();

  if (hour >= 6 && hour < 14) {
    return "MORNING";
  }

  if (hour >= 14 && hour < 22) {
    return "EVENING";
  }

  return "NIGHT";
}

function createRowKey(slot: ShiftSlot): string {
  return [getShiftGroup(slot.startTime), slot.position, slot.slotNumber].join(
    "-",
  );
}

function sortWeekGridRows(rows: WeekGridRow[]): WeekGridRow[] {
  return [...rows].sort((first, second) => {
    const shiftGroupDifference =
      SHIFT_GROUP_ORDER[first.shiftGroup] -
      SHIFT_GROUP_ORDER[second.shiftGroup];

    if (shiftGroupDifference !== 0) {
      return shiftGroupDifference;
    }

    const positionDifference =
      POSITION_ORDER[first.position] - POSITION_ORDER[second.position];

    if (positionDifference !== 0) {
      return positionDifference;
    }

    return first.slotNumber - second.slotNumber;
  });
}

export function createWeekGridRows(shiftSlots: ShiftSlot[]): WeekGridRow[] {
  const rows = new Map<string, WeekGridRow>();

  for (const slot of shiftSlots) {
    const key = createRowKey(slot);
    const weekday = getWeekday(new Date(slot.startTime));
    const existingRow = rows.get(key);

    if (existingRow) {
      existingRow.slots[weekday] = slot;
      continue;
    }

    rows.set(key, {
      key,
      shiftGroup: getShiftGroup(slot.startTime),
      position: slot.position,
      slotNumber: slot.slotNumber,
      slots: {
        [weekday]: slot,
      },
    });
  }

  return sortWeekGridRows([...rows.values()]);
}
