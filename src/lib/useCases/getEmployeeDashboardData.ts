import { getPublishedSchedulePeriodsForEmployee } from "@/lib/db/schedulePeriods";
import { getEmployeeAssignmentsInRange } from "@/lib/db/shiftSlots";

import { mapShiftSlotToSchedule } from "@/lib/db/mappers";

import { getMonday, getWeekdayDate } from "@/lib/functions/dateTimeUtils";

import type { UUID } from "@/types/common";
import type {
  EmployeeDashboardData,
  EmployeeDashboardPeriod,
} from "@/types/dashboard";

export async function getEmployeeDashboardData(
  employeeId: UUID,
): Promise<EmployeeDashboardData> {
  const currentWeekStart = getMonday(new Date());
  const nextWeekStart = getWeekdayDate(currentWeekStart, 7);
  const periodEnd = getWeekdayDate(currentWeekStart, 28);

  const [periods, currentWeekAssignments] = await Promise.all([
    getPublishedSchedulePeriodsForEmployee(
      employeeId,
      currentWeekStart,
      periodEnd,
    ),

    getEmployeeAssignmentsInRange({
      employeeIds: [employeeId],
      rangeStart: currentWeekStart,
      rangeEnd: nextWeekStart,
    }),
  ]);

  const dashboardPeriods = periods.map(
    (period): EmployeeDashboardPeriod => ({
      id: period.id,
      department: period.department,
      startDate: period.startDate,
      endDate: period.endDate,
      assignedShiftCount: period.shiftSlots.length,
    }),
  );

  const currentWeekPeriods = dashboardPeriods.filter(
    (period) => period.startDate < nextWeekStart,
  );

  const currentWeekPeriodIds = new Set(
    currentWeekPeriods.map((period) => period.id),
  );

  const currentWeekShiftSlots = currentWeekAssignments
    .filter((assignment) => currentWeekPeriodIds.has(assignment.periodId))
    .map(mapShiftSlotToSchedule);

  return {
    currentWeekPeriods,
    currentWeekShiftSlots,

    upcomingPeriods: dashboardPeriods.filter(
      (period) => period.startDate >= nextWeekStart,
    ),
  };
}
