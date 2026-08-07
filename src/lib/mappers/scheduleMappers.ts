import type { SchedulePeriodModel } from "@/generated/prisma/models/SchedulePeriod";
import type { ShiftSlotModel } from "@/generated/prisma/models";
import type { SchedulePeriod, ShiftSlot } from "@/types/scheduling";
import type { ISODateString } from "@/types/common";
import type { AssignmentShift } from "@/types/assignment";

import { createISODateString } from "../functions/dateTimeUtils";

export function mapSchedulePeriodToSchedule(
  period: SchedulePeriodModel,
): SchedulePeriod {
  return {
    id: period.id,
    department: period.department,
    startDate: createISODateString(period.startDate.toISOString()),
    endDate: createISODateString(period.startDate.toISOString()),
    published: period.published,
  };
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

export function mapAssignmentShiftToShiftSlot(
  shift: AssignmentShift,
): ShiftSlot {
  return {
    id: shift.id,
    periodId: shift.periodId,
    employeeId: shift.employeeId,
    department: shift.department,
    position: shift.position,
    slotNumber: shift.slotNumber,
    startTime: shift.startTime.toISOString() as ISODateString,
    endTime: shift.endTime.toISOString() as ISODateString,
  };
}
