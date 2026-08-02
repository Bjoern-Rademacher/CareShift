import type { SchedulePeriodModel } from "@/generated/prisma/models/SchedulePeriod";
import { ISODateString } from "@/types/common";

import type { Schedule } from "@/types/scheduling";

export function mapSchedulePeriodToSchedule(
  period: SchedulePeriodModel,
): Schedule {
  return {
    id: period.id,
    department: period.department,
    startDate: period.startDate.toISOString() as ISODateString,
    endDate: period.endDate.toISOString() as ISODateString,
    published: period.published,
  };
}
