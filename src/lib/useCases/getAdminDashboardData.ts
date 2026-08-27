import { getSchedulePeriodsInRange } from "@/lib/db/schedulePeriods";

import { getMonday, getWeekdayDate } from "@/lib/functions/dateTimeUtils";

import { DEPARTMENTS } from "@/types/common";

import type {
  AdminDashboardAttentionItem,
  AdminDashboardCurrentWeekItem,
  AdminDashboardData,
  AdminDashboardPeriod,
} from "@/types/dashboard";

const NUMBER_OF_UPCOMING_WEEKS = 3;

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const currentWeekStart = getMonday(new Date());
  const currentWeekEnd = getWeekdayDate(currentWeekStart, 7);

  const upcomingRangeStart = currentWeekEnd;

  const upcomingRangeEnd = getWeekdayDate(
    upcomingRangeStart,
    NUMBER_OF_UPCOMING_WEEKS * 7,
  );

  const periods = await getSchedulePeriodsInRange(
    currentWeekStart,
    upcomingRangeEnd,
  );

  const dashboardPeriods: AdminDashboardPeriod[] = periods.map((period) => ({
    id: period.id,
    department: period.department,
    startDate: period.startDate,
    endDate: period.endDate,
    status: period.status,
  }));

  const activePeriods = dashboardPeriods.filter(
    (period) =>
      period.startDate.getTime() >= currentWeekStart.getTime() &&
      period.startDate.getTime() < currentWeekEnd.getTime(),
  );

  const currentWeekItems: AdminDashboardCurrentWeekItem[] = DEPARTMENTS.map(
    (department) => {
      const period = activePeriods.find(
        (candidate) => candidate.department === department,
      );

      if (period) {
        return {
          type: "SCHEDULE",
          period,
        };
      }

      return {
        type: "MISSING",
        department,
        startDate: currentWeekStart,
        endDate: currentWeekEnd,
      };
    },
  );

  const upcomingPeriods = dashboardPeriods.filter(
    (period) =>
      period.startDate.getTime() >= upcomingRangeStart.getTime() &&
      period.startDate.getTime() < upcomingRangeEnd.getTime(),
  );

  const needsAttention: AdminDashboardAttentionItem[] = [];

  for (let weekIndex = 0; weekIndex < NUMBER_OF_UPCOMING_WEEKS; weekIndex++) {
    const weekStart = getWeekdayDate(upcomingRangeStart, weekIndex * 7);
    const weekEnd = getWeekdayDate(weekStart, 7);

    for (const department of DEPARTMENTS) {
      const period = upcomingPeriods.find(
        (candidate) =>
          candidate.department === department &&
          candidate.startDate.getTime() === weekStart.getTime(),
      );

      if (!period) {
        needsAttention.push({
          type: "MISSING",
          department,
          startDate: weekStart,
          endDate: weekEnd,
        });

        continue;
      }

      if (period.status === "DRAFT") {
        needsAttention.push({
          type: "DRAFT",
          period,
        });
      }
    }
  }

  const draft = upcomingPeriods.filter(
    (period) => period.status === "DRAFT",
  ).length;

  const validated = upcomingPeriods.filter(
    (period) => period.status === "VALIDATED",
  ).length;

  const published = upcomingPeriods.filter(
    (period) => period.status === "PUBLISHED",
  ).length;

  return {
    summary: {
      needsAttention: needsAttention.length,
      draft,
      validated,
      published,
    },

    currentWeekItems,
    upcomingPeriods,
    needsAttention,
  };
}
