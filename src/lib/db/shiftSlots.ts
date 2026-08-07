import { prisma } from "@/lib/db/prisma";
import { UUID } from "@/types/common";

type AssignEmployeeToShiftSlotInput = {
  slotId: UUID;
  employeeId: UUID;
};

type GetEmployeeShiftSlotsForWeekInput = {
  employeeId: string;
  weekStartDate: Date;
  weekEndDate: Date;
};

type GetEmployeeShiftSlotsAroundShiftInput = {
  employeeId: string;
  shiftStart: Date;
  shiftEnd: Date;
};

export async function getShiftSlotById(id: string) {
  return prisma.shiftSlot.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      periodId: true,
      employeeId: true,
      department: true,
      position: true,
      slotNumber: true,
      startTime: true,
      endTime: true,
      period: {
        select: {
          startDate: true,
          endDate: true,
          published: true,
        },
      },
    },
  });
}

export async function updateShiftSlotEmployee({
  slotId,
  employeeId,
}: AssignEmployeeToShiftSlotInput) {
  return prisma.shiftSlot.update({
    where: {
      id: slotId,
    },
    data: {
      employeeId,
    },
    select: {
      id: true,
      employeeId: true,
    },
  });
}

export async function unassignEmployeeFromShiftSlot(slotId: string) {
  return prisma.shiftSlot.update({
    where: { id: slotId },
    data: { employeeId: null },
    include: {
      employee: true,
    },
  });
}

export async function getEmployeeShiftSlotsForWeek({
  employeeId,
  weekStartDate,
  weekEndDate,
}: GetEmployeeShiftSlotsForWeekInput) {
  return prisma.shiftSlot.findMany({
    where: {
      employeeId,

      // Weekly-hour validation counts every shift in the week
      // where the shift starts. Overnight shifts therefore belong
      // to exactly one schedule period and are never counted twice.

      startTime: {
        gte: weekStartDate,
        lt: weekEndDate,
      },
    },
    orderBy: {
      startTime: "asc",
    },
    select: {
      id: true,
      periodId: true,
      employeeId: true,
      department: true,
      position: true,
      startTime: true,
      endTime: true,
    },
  });
}

import { MINIMUM_REST_HOURS } from "@/lib/validation/sharedRules";

export async function getEmployeeShiftSlotsAroundShift({
  employeeId,
  shiftStart,
  shiftEnd,
}: GetEmployeeShiftSlotsAroundShiftInput) {
  const minimumRestMs = MINIMUM_REST_HOURS * 60 * 60 * 1000;

  const rangeStart = new Date(shiftStart.getTime() - minimumRestMs);

  const rangeEnd = new Date(shiftEnd.getTime() + minimumRestMs);

  return prisma.shiftSlot.findMany({
    where: {
      employeeId,

      // Rest-time and overlap validation must also consider
      // assignments from the previous and next schedule periods.
      // Therefore every shift intersecting the surrounding time
      // window is loaded instead of only the current week.

      startTime: {
        lt: rangeEnd,
      },
      endTime: {
        gt: rangeStart,
      },
    },
    orderBy: {
      startTime: "asc",
    },
    select: {
      id: true,
      periodId: true,
      employeeId: true,
      department: true,
      position: true,
      startTime: true,
      endTime: true,
    },
  });
}

export async function getEmployeeAssignmentsInRange({
  employeeIds,
  rangeStart,
  rangeEnd,
}: {
  employeeIds: string[];
  rangeStart: Date;
  rangeEnd: Date;
}) {
  return prisma.shiftSlot.findMany({
    where: {
      employeeId: {
        in: employeeIds,
      },
      startTime: {
        lt: rangeEnd,
      },
      endTime: {
        gt: rangeStart,
      },
    },
    select: {
      id: true,
      periodId: true,
      employeeId: true,
      department: true,
      position: true,
      slotNumber: true,
      startTime: true,
      endTime: true,
    },
    orderBy: [
      {
        employeeId: "asc",
      },
      {
        startTime: "asc",
      },
    ],
  });
}
