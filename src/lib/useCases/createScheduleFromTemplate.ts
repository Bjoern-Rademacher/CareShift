import generateShiftSlots from "@/lib/functions/generateShiftSlots";
import { getMonday, getWeekdayDate } from "@/lib/functions/dateTimeUtils";
import {
  createSchedulePeriodFromTemplate,
  getSchedulePeriodByDepartmentAndStartDate,
} from "@/lib/db/schedulePeriods";
import { getTemplateRulesByDepartment } from "@/lib/db/templateRules";
import { toTemplateRules } from "@/lib/mappers/templateRules";

import {
  SCHEDULE_ERRORS,
  scheduleErrorMessages,
} from "@/domain/errors/scheduleErrors";
import type {
  GenerateScheduleFromTemplateInput,
  GenerateScheduleFromTemplateResult,
} from "@/types/useCases/createScheduleFromTemplate";

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
        code: SCHEDULE_ERRORS.SCHEDULE_ALREADY_EXISTS,
        message: scheduleErrorMessages.SCHEDULE_ALREADY_EXISTS,
        details: { scheduleId: existingSchedule.id },
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
    data: { schedule: { id: schedule.id } },
  };
}
