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

      for (let i = 0; i < rule.slots; i++) {
        generatedSlots.push({
          department: rule.department,
          position: rule.position,
          slotNumber: i + 1,
          startTime: createShiftDateTime(currentDay, rule.startTimeLocal),
          endTime: createShiftDateTime(currentDay, rule.endTimeLocal),
        });
      }
    }
  }

  generatedSlots.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  return generatedSlots;
}
