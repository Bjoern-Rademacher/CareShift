import "server-only";

import {
  createSchedulePeriodFromTemplate,
  getSchedulePeriodByDepartmentAndStartDate,
} from "@/lib/db/schedulePeriods";
import { getTemplateRulesByDepartment } from "@/lib/db/templateRules";

import generateShiftSlots from "@/lib/functions/generateShiftSlots";
import { getMonday, getWeekdayDate } from "@/lib/functions/dateTimeUtils";

import { toTemplateRules } from "@/lib/mappers/templateRules";

import type { Departments, UUID } from "@/types/common";
import type { UseCaseResult } from "@/types/useCases";

export type GenerateScheduleFromTemplateInput = {
  department: Departments;
  weekStartDate: Date;
};

export type GenerateScheduleFromTemplateError = {
  code: "SCHEDULE_ALREADY_EXISTS";
  message: string;
  details: {
    scheduleId: UUID;
  };
};

export type GenerateScheduleFromTemplateResult = UseCaseResult<
  {
    schedule: {
      id: UUID;
    };
  },
  GenerateScheduleFromTemplateError
>;

export async function generateScheduleFromTemplate({
  department,
  weekStartDate,
}: GenerateScheduleFromTemplateInput): Promise<GenerateScheduleFromTemplateResult> {
  const scheduleStartDate = getMonday(weekStartDate);
  const scheduleEndDate = getWeekdayDate(scheduleStartDate, 7);

  const existingSchedule = await getSchedulePeriodByDepartmentAndStartDate(
    department,
    scheduleStartDate,
  );

  if (existingSchedule) {
    return {
      ok: false,
      error: {
        code: "SCHEDULE_ALREADY_EXISTS",
        message: "A schedule already exists for this department and week.",
        details: {
          scheduleId: existingSchedule.id,
        },
      },
    };
  }

  const dbRules = await getTemplateRulesByDepartment(department);
  const rules = toTemplateRules(dbRules);

  const shiftSlots = generateShiftSlots({
    scheduleStartDate,
    rules,
  });

  const schedule = await createSchedulePeriodFromTemplate({
    department,
    startDate: scheduleStartDate,
    endDate: scheduleEndDate,
    shiftSlots,
  });

  return {
    ok: true,
    data: {
      schedule: {
        id: schedule.id,
      },
    },
  };
}
