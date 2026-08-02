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

      // Include every shift that overlaps the weekly period:
      // [weekStartDate, weekEndDate)
      startTime: {
        lt: weekEndDate,
      },
      endTime: {
        gt: weekStartDate,
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
