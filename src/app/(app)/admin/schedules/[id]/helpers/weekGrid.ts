import {
  POSITION_ORDER,
  SHIFT_GROUP_ORDER,
} from "@/lib/constants/scheduleDisplay";
import { getWeekday } from "@/lib/functions/dateTimeUtils";
import { getShiftGroup } from "@/lib/functions/scheduleUtils";

import type { Weekday } from "@/types/common";
import type { ShiftSlot } from "@/types/scheduling";
import type { ShiftGroup } from "@/types/view";

export type WeekGridRow = {
  key: string;
  shiftGroup: ShiftGroup;
  position: ShiftSlot["position"];
  slotNumber: number;
  slots: Partial<Record<Weekday, ShiftSlot>>;
};

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
