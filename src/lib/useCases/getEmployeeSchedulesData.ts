import { getShiftSlotsByEmployee } from "@/lib/db/shiftSlots";

import { createISODateString } from "@/lib/functions/dateTimeUtils";

import type { UUID } from "@/types/common";
import type {
  EmployeeScheduleOverview,
  EmployeeSchedulesData,
  ShiftSlot,
} from "@/types/scheduling";

export async function getEmployeeSchedulesData(
  employeeId: UUID,
): Promise<EmployeeSchedulesData> {
  const slots = await getShiftSlotsByEmployee(employeeId, "PUBLISHED_ONLY");

  const now = new Date();
  const pastRangeStart = getPastRangeStart(now);

  const schedulesByPeriod = new Map<UUID, EmployeeScheduleOverview>();

  for (const slot of slots) {
    if (
      slot.period.status !== "PUBLISHED" ||
      slot.period.endDate < pastRangeStart
    ) {
      continue;
    }

    const shiftSlot: ShiftSlot = {
      id: slot.id,
      periodId: slot.periodId,
      employeeId: slot.employeeId,
      department: slot.department,
      position: slot.position,
      slotNumber: slot.slotNumber,
      startTime: createISODateString(slot.startTime.toISOString()),
      endTime: createISODateString(slot.endTime.toISOString()),
    };

    const existingSchedule = schedulesByPeriod.get(slot.period.id);

    if (existingSchedule) {
      existingSchedule.shiftSlots.push(shiftSlot);
      continue;
    }

    schedulesByPeriod.set(slot.period.id, {
      period: {
        id: slot.period.id,
        department: slot.period.department,
        startDate: createISODateString(slot.period.startDate.toISOString()),
        endDate: createISODateString(slot.period.endDate.toISOString()),
        status: slot.period.status,
      },
      shiftSlots: [shiftSlot],
    });
  }

  const schedules = Array.from(schedulesByPeriod.values());

  for (const schedule of schedules) {
    schedule.shiftSlots.sort(
      (first, second) =>
        new Date(first.startTime).getTime() -
        new Date(second.startTime).getTime(),
    );
  }

  const currentSchedules = schedules
    .filter((schedule) => new Date(schedule.period.endDate) > now)
    .sort(compareScheduleStartAscending);

  const pastSchedules = schedules
    .filter((schedule) => {
      const endDate = new Date(schedule.period.endDate);

      return endDate >= pastRangeStart && endDate <= now;
    })
    .sort(compareScheduleStartDescending);

  return {
    currentSchedules,
    pastSchedules,
  };
}

function getPastRangeStart(date: Date) {
  const targetMonth = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 3, 1),
  );

  const lastDayOfTargetMonth = new Date(
    Date.UTC(targetMonth.getUTCFullYear(), targetMonth.getUTCMonth() + 1, 0),
  ).getUTCDate();

  return new Date(
    Date.UTC(
      targetMonth.getUTCFullYear(),
      targetMonth.getUTCMonth(),
      Math.min(date.getUTCDate(), lastDayOfTargetMonth),
    ),
  );
}

function compareScheduleStartAscending(
  first: EmployeeScheduleOverview,
  second: EmployeeScheduleOverview,
) {
  return (
    new Date(first.period.startDate).getTime() -
    new Date(second.period.startDate).getTime()
  );
}

function compareScheduleStartDescending(
  first: EmployeeScheduleOverview,
  second: EmployeeScheduleOverview,
) {
  return compareScheduleStartAscending(second, first);
}
