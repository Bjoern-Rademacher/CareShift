import generateShiftSlots from "@/lib/functions/generateShiftSlots";
import { getMonday, getWeekdayDate } from "@/lib/functions/dateTimeUtils";
import {
  createSchedulePeriodFromTemplate,
  getSchedulePeriodByDepartmentAndStartDate,
} from "@/lib/db/schedulePeriods";
import { getTemplateRulesByDepartment } from "@/lib/db/templateRules";
import { toTemplateRules } from "@/lib/mappers/templateRules";

import type { Departments } from "@/types/common";
import { SCHEDULE_ERRORS } from "@/domain/errors/scheduleErrors";

type GenerateScheduleFromTemplateInput = {
  department: Departments;
  weekStartDate: Date;
};

export async function generateScheduleFromTemplate({
  department,
  weekStartDate,
}: GenerateScheduleFromTemplateInput) {
  const scheduleStartDate = getMonday(weekStartDate);

  const scheduleEndDate = getWeekdayDate(scheduleStartDate, 7);

  const existingSchedule = await getSchedulePeriodByDepartmentAndStartDate(
    department,
    scheduleStartDate,
  );

  if (existingSchedule) {
    return {
      ok: false,
      code: SCHEDULE_ERRORS.SCHEDULE_ALREADY_EXISTS,
      scheduleId: existingSchedule.id,
    } as const;
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
    ok: true as const,
    schedule,
  };
}
