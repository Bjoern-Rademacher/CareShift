import { getPublishedSchedulePeriodForEmployeeById } from "@/lib/db/schedulePeriods";
import {
  mapSchedulePeriodToSchedule,
  mapShiftSlotToSchedule,
} from "@/lib/db/mappers";

import type { UUID } from "@/types/common";
import type { EmployeeScheduleOverview } from "@/types/scheduling";

export async function getEmployeeScheduleById(
  employeeId: UUID,
  scheduleId: UUID,
): Promise<EmployeeScheduleOverview | null> {
  const period = await getPublishedSchedulePeriodForEmployeeById(
    scheduleId,
    employeeId,
  );

  // Missing, unpublished and unassigned periods all produce the same result.
  if (!period) {
    return null;
  }

  return {
    period: mapSchedulePeriodToSchedule(period),
    shiftSlots: period.shiftSlots.map(mapShiftSlotToSchedule),
  };
}
