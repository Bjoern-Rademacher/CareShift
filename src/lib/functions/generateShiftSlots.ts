import type { Weekday } from "@/types/common";
import type { TemplateRule } from "@/types/scheduling";
import type { CreateShiftSlotInput } from "@/types/db_types";

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

function createUtcDateTime(day: Date, localTime: string): Date {
  const [hours, minutes] = localTime.split(":").map(Number);

  const date = new Date(day);
  date.setUTCHours(hours, minutes, 0, 0);

  return date;
}

export default function generateShiftSlots({
  scheduleStartDate,
  rules,
}: GenerateShiftSlotsInput): CreateShiftSlotInput[] {
  const generatedSlots: CreateShiftSlotInput[] = [];

  const weekStart = new Date(scheduleStartDate);

  for (const rule of rules) {
    if (!rule.active) continue;

    for (const weekday of rule.weekdays) {
      const currentDay = new Date(weekStart);
      currentDay.setUTCDate(currentDay.getUTCDate() + weekdayOffsets[weekday]);

      for (let i = 0; i < rule.slots; i++) {
        generatedSlots.push({
          department: rule.department,
          position: rule.position,
          startTime: createUtcDateTime(currentDay, rule.startTimeLocal),
          endTime: createUtcDateTime(currentDay, rule.endTimeLocal),
        });
      }
    }
  }

  generatedSlots.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  return generatedSlots;
}
