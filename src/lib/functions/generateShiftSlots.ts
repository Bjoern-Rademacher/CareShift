import type { Weekday } from "@/types/common";
import type { TemplateRule } from "@/types/scheduling";
import type { CreateShiftSlotInput } from "@/types/db_types";
import { getWeekdayDate, createShiftDateTime } from "./dateTimeUtils";

type GenerateShiftSlotsInput = {
  scheduleStartDate: Date;
  rules: TemplateRule[];
};

const weekdayOffsets: Record<Weekday, number> = {
  MON: 0,
  TUE: 1,
  WED: 2,
  THU: 3,
  FRI: 4,
  SAT: 5,
  SUN: 6,
};

export default function generateShiftSlots({
  scheduleStartDate,
  rules,
}: GenerateShiftSlotsInput): CreateShiftSlotInput[] {
  const generatedSlots: CreateShiftSlotInput[] = [];

  for (const rule of rules) {
    if (!rule.active) continue;

    for (const weekday of rule.weekdays) {
      const currentDay = getWeekdayDate(
        scheduleStartDate,
        weekdayOffsets[weekday],
      );

      const startTime = createShiftDateTime(currentDay, rule.startTimeLocal);

      const endTime = createShiftDateTime(currentDay, rule.endTimeLocal);

      // Make sure cross-midnight shifts have the correct end date.

      if (endTime.getTime() < startTime.getTime()) {
        endTime.setUTCDate(endTime.getUTCDate() + 1);
      }

      for (let i = 0; i < rule.slots; i++) {
        generatedSlots.push({
          department: rule.department,
          position: rule.position,
          slotNumber: i + 1,
          startTime,
          endTime,
        });
      }
    }
  }

  return generatedSlots;
}
