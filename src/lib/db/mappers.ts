import { createISODateString } from "@/lib/functions/dateTimeUtils";

import type { ShiftSlotModel } from "@/generated/prisma/models";
import type { ISODateString, UUID } from "@/types/common";
import type {
  ShiftSlot,
  SchedulePeriod,
  DbShiftSlot,
} from "@/types/scheduling";

export function toUiShiftSlot(slot: DbShiftSlot): ShiftSlot {
  return {
    id: slot.id as UUID,
    periodId: slot.periodId as UUID,
    employeeId: slot.employeeId as UUID | null,
    department: slot.department,
    position: slot.position,
    slotNumber: slot.slotNumber,
    startTime: slot.startTime.toISOString() as ISODateString,
    endTime: slot.endTime.toISOString() as ISODateString,
  };
}

export function toUiShiftSlots(slots: DbShiftSlot[]): ShiftSlot[] {
  return slots.map(toUiShiftSlot);
}

import type { SchedulePeriodModel } from "@/generated/prisma/models/SchedulePeriod";

export function mapSchedulePeriodToSchedule(
  period: SchedulePeriodModel,
): SchedulePeriod {
  return {
    id: period.id,
    department: period.department,
    startDate: period.startDate.toISOString() as ISODateString,
    endDate: period.endDate.toISOString() as ISODateString,
    status: period.status,
  };
}

export function mapSchedulePeriodsToSchedules(
  periods: SchedulePeriodModel[],
): SchedulePeriod[] {
  return periods.map(mapSchedulePeriodToSchedule);
}

export function mapShiftSlotToSchedule(slot: ShiftSlotModel): ShiftSlot {
  return {
    id: slot.id,
    periodId: slot.periodId,
    employeeId: slot.employeeId,
    department: slot.department,
    position: slot.position,
    slotNumber: slot.slotNumber,
    startTime: createISODateString(slot.startTime.toISOString()),
    endTime: createISODateString(slot.endTime.toISOString()),
  };
}
