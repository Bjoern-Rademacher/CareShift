import { getSchedulePeriodsInRange } from "@/lib/db/schedulePeriods";

import { getMonday, getWeekdayDate } from "@/lib/functions/dateTimeUtils";

import type { AdminSchedulesData, AdminScheduleWeek } from "@/types/scheduling";

const NUMBER_OF_WEEKS = 3;

export async function getAdminSchedulesData(): Promise<AdminSchedulesData> {
  const currentWeekStart = getMonday(new Date());
  const rangeStart = getWeekdayDate(currentWeekStart, 7);
  const rangeEnd = getWeekdayDate(rangeStart, NUMBER_OF_WEEKS * 7);

  const periods = await getSchedulePeriodsInRange(rangeStart, rangeEnd);

  const weeks = Array.from(
    { length: NUMBER_OF_WEEKS },
    (_, index): AdminScheduleWeek => {
      const startDate = getWeekdayDate(rangeStart, index * 7);

      return {
        startDate,
        endDate: getWeekdayDate(startDate, 7),
      };
    },
  );

  return {
    weeks,
    periods,
  };
}
