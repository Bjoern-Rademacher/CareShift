import type { UUID, ISODateString, Weekday } from "@/types/common";

import type { ShiftSlot, TemplateRule } from "@/types/scheduling";

type GenerateShiftSlotsInput = {
  periodId: UUID;
  weekStartDate: ISODateString;
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
  periodId,
  weekStartDate,
  rules,
}: GenerateShiftSlotsInput): ShiftSlot[] {
  const generatedSlots: ShiftSlot[] = [];

  // monday of the target week
  const weekStart = new Date(weekStartDate);

  // process all template rules
  for (const rule of rules) {
    if (!rule.active) continue;

    // generate shifts for every weekday in the rule
    for (const weekday of rule.weekdays) {
      const dayOffset = weekdayOffsets[weekday];

      // clone monday date
      const currentDay = new Date(weekStart);

      // move date to correct weekday
      currentDay.setUTCDate(currentDay.getUTCDate() + dayOffset);

      // extract YYYY-MM-DD
      const dateString = currentDay.toISOString().split("T")[0];

      // generate multiple slots if required
      for (let i = 0; i < rule.slots; i++) {
        // build full ISO timestamps
        const startTime = `${dateString}T${rule.startTimeLocal}:00Z`;

        const endTime = `${dateString}T${rule.endTimeLocal}:00Z`;

        generatedSlots.push({
          id: crypto.randomUUID(),
          periodId,
          employeeId: null,
          department: rule.department,
          position: rule.position,
          startTime: startTime as ISODateString,
          endTime: endTime as ISODateString,
        });
      }
    }
  }

  // order slots by start time
  generatedSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

  return generatedSlots;
}
