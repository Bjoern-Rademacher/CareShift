import { getSchedulePeriodsInRange } from "@/lib/db/schedulePeriods";

import { getMonday, getWeekdayDate } from "@/lib/functions/dateTimeUtils";

import type {
  DisplayDashboardData,
  DisplayDashboardPeriod,
} from "@/types/dashboard";

export async function getDisplayDashboardData(): Promise<DisplayDashboardData> {
  const currentWeekStart = getMonday(new Date());
  const currentWeekEnd = getWeekdayDate(currentWeekStart, 7);

  const periods = await getSchedulePeriodsInRange(
    currentWeekStart,
    currentWeekEnd,
  );

  // Display users may only see schedules that have been published.
  const currentWeekPeriods = periods
    .filter((period) => period.status === "PUBLISHED")
    .map(
      (period): DisplayDashboardPeriod => ({
        id: period.id,
        department: period.department,
        startDate: period.startDate,
        endDate: period.endDate,
      }),
    );

  return {
    currentWeekPeriods,
  };
}
