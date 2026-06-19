import generateShiftSlots from "@/lib/functions/generateShiftSlots";
import { getMonday, getWeekdayDate } from "@/lib/functions/verifyDate";
import {
  createSchedulePeriodFromTemplate,
  getSchedulePeriodByDepartmentAndStartDate,
} from "@/lib/db/schedulePeriods";
import { getTemplateRulesByDepartment } from "@/lib/db/templateRules";
import { toTemplateRules } from "@/lib/mappers/templateRules";

import type { Departments } from "@/types/common";

type GenerateScheduleFromTemplateInput = {
  department: Departments;
  weekStartDate: Date;
};

export async function generateScheduleFromTemplate({
  department,
  weekStartDate,
}: GenerateScheduleFromTemplateInput) {
  const scheduleStartDate = getMonday(weekStartDate);

  const scheduleEndDate = getWeekdayDate(scheduleStartDate, 6);

  const existingSchedule = await getSchedulePeriodByDepartmentAndStartDate(
    department,
    scheduleStartDate,
  );

  if (existingSchedule) {
    return {
      ok: false as const,
      code: "SCHEDULE_ALREADY_EXISTS" as const,
      scheduleId: existingSchedule.id,
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
    ok: true as const,
    schedule,
  };
}
