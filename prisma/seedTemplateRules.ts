import "dotenv/config";

import { prisma } from "@/lib/db/prisma";

import type { Prisma } from "@/generated/prisma/client";
import type { Weekday } from "@/generated/prisma/enums";

const ALL_DAYS: Weekday[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const WEEKDAYS: Weekday[] = ["MON", "TUE", "WED", "THU", "FRI"];
const WEEKEND: Weekday[] = ["SAT", "SUN"];

const MORNING = { startTimeLocal: "06:00", endTimeLocal: "14:00" };
const EVENING = { startTimeLocal: "14:00", endTimeLocal: "22:00" };
const NIGHT = { startTimeLocal: "22:00", endTimeLocal: "06:00" };

function rule(
  input: Omit<Prisma.TemplateRuleCreateManyInput, "active">,
): Prisma.TemplateRuleCreateManyInput {
  return {
    ...input,
    active: true,
  };
}

const templateRules: Prisma.TemplateRuleCreateManyInput[] = [
  // ER
  rule({
    department: "ER",
    position: "DOCTOR",
    weekdays: ALL_DAYS,
    ...MORNING,
    slots: 2,
  }),
  rule({
    department: "ER",
    position: "NURSE",
    weekdays: ALL_DAYS,
    ...MORNING,
    slots: 3,
  }),
  rule({
    department: "ER",
    position: "DOCTOR",
    weekdays: ALL_DAYS,
    ...EVENING,
    slots: 2,
  }),
  rule({
    department: "ER",
    position: "NURSE",
    weekdays: ALL_DAYS,
    ...EVENING,
    slots: 2,
  }),
  rule({
    department: "ER",
    position: "DOCTOR",
    weekdays: ALL_DAYS,
    ...NIGHT,
    slots: 1,
  }),
  rule({
    department: "ER",
    position: "NURSE",
    weekdays: ALL_DAYS,
    ...NIGHT,
    slots: 2,
  }),
  rule({
    department: "ER",
    position: "HEAD_DOCTOR",
    weekdays: WEEKDAYS,
    startTimeLocal: "08:00",
    endTimeLocal: "16:00",
    slots: 1,
  }),

  // ICU
  rule({
    department: "ICU",
    position: "DOCTOR",
    weekdays: ALL_DAYS,
    ...MORNING,
    slots: 1,
  }),
  rule({
    department: "ICU",
    position: "NURSE",
    weekdays: ALL_DAYS,
    ...MORNING,
    slots: 2,
  }),
  rule({
    department: "ICU",
    position: "DOCTOR",
    weekdays: ALL_DAYS,
    ...EVENING,
    slots: 1,
  }),
  rule({
    department: "ICU",
    position: "NURSE",
    weekdays: ALL_DAYS,
    ...EVENING,
    slots: 2,
  }),
  rule({
    department: "ICU",
    position: "DOCTOR",
    weekdays: ALL_DAYS,
    ...NIGHT,
    slots: 1,
  }),
  rule({
    department: "ICU",
    position: "NURSE",
    weekdays: ALL_DAYS,
    ...NIGHT,
    slots: 2,
  }),
  rule({
    department: "ICU",
    position: "HEAD_DOCTOR",
    weekdays: WEEKDAYS,
    startTimeLocal: "08:00",
    endTimeLocal: "16:00",
    slots: 1,
  }),

  // Surgery weekdays
  rule({
    department: "SURGERY",
    position: "SURGEON",
    weekdays: WEEKDAYS,
    ...MORNING,
    slots: 2,
  }),
  rule({
    department: "SURGERY",
    position: "NURSE",
    weekdays: WEEKDAYS,
    ...MORNING,
    slots: 3,
  }),
  rule({
    department: "SURGERY",
    position: "SURGEON",
    weekdays: WEEKDAYS,
    ...EVENING,
    slots: 1,
  }),
  rule({
    department: "SURGERY",
    position: "NURSE",
    weekdays: WEEKDAYS,
    ...EVENING,
    slots: 2,
  }),
  rule({
    department: "SURGERY",
    position: "SURGEON",
    weekdays: WEEKDAYS,
    ...NIGHT,
    slots: 1,
  }),
  rule({
    department: "SURGERY",
    position: "NURSE",
    weekdays: WEEKDAYS,
    ...NIGHT,
    slots: 1,
  }),
  rule({
    department: "SURGERY",
    position: "HEAD_DOCTOR",
    weekdays: WEEKDAYS,
    startTimeLocal: "08:00",
    endTimeLocal: "16:00",
    slots: 1,
  }),

  // Surgery weekend
  rule({
    department: "SURGERY",
    position: "SURGEON",
    weekdays: WEEKEND,
    ...MORNING,
    slots: 1,
  }),
  rule({
    department: "SURGERY",
    position: "NURSE",
    weekdays: WEEKEND,
    ...MORNING,
    slots: 2,
  }),
  rule({
    department: "SURGERY",
    position: "SURGEON",
    weekdays: WEEKEND,
    ...EVENING,
    slots: 1,
  }),
  rule({
    department: "SURGERY",
    position: "NURSE",
    weekdays: WEEKEND,
    ...EVENING,
    slots: 1,
  }),
  rule({
    department: "SURGERY",
    position: "SURGEON",
    weekdays: WEEKEND,
    ...NIGHT,
    slots: 1,
  }),
  rule({
    department: "SURGERY",
    position: "NURSE",
    weekdays: WEEKEND,
    ...NIGHT,
    slots: 1,
  }),

  // Radiology weekdays
  rule({
    department: "RADIOLOGY",
    position: "DOCTOR",
    weekdays: WEEKDAYS,
    ...MORNING,
    slots: 1,
  }),
  rule({
    department: "RADIOLOGY",
    position: "MEDICAL_ASSISTANT",
    weekdays: WEEKDAYS,
    ...MORNING,
    slots: 2,
  }),
  rule({
    department: "RADIOLOGY",
    position: "DOCTOR",
    weekdays: WEEKDAYS,
    ...EVENING,
    slots: 1,
  }),
  rule({
    department: "RADIOLOGY",
    position: "MEDICAL_ASSISTANT",
    weekdays: WEEKDAYS,
    ...EVENING,
    slots: 1,
  }),
  rule({
    department: "RADIOLOGY",
    position: "MEDICAL_ASSISTANT",
    weekdays: WEEKDAYS,
    ...NIGHT,
    slots: 1,
  }),
  rule({
    department: "RADIOLOGY",
    position: "HEAD_DOCTOR",
    weekdays: WEEKDAYS,
    startTimeLocal: "08:00",
    endTimeLocal: "16:00",
    slots: 1,
  }),

  // Radiology weekend
  rule({
    department: "RADIOLOGY",
    position: "DOCTOR",
    weekdays: WEEKEND,
    ...MORNING,
    slots: 1,
  }),
  rule({
    department: "RADIOLOGY",
    position: "MEDICAL_ASSISTANT",
    weekdays: WEEKEND,
    ...MORNING,
    slots: 1,
  }),
  rule({
    department: "RADIOLOGY",
    position: "MEDICAL_ASSISTANT",
    weekdays: WEEKEND,
    ...EVENING,
    slots: 1,
  }),
  rule({
    department: "RADIOLOGY",
    position: "MEDICAL_ASSISTANT",
    weekdays: WEEKEND,
    ...NIGHT,
    slots: 1,
  }),
];

async function main() {
  await prisma.templateRule.deleteMany();

  await prisma.templateRule.createMany({
    data: templateRules,
  });

  console.log(`Seeded ${templateRules.length} template rules.`);
}

main()
  .catch((error) => {
    console.error("Template-rule seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
