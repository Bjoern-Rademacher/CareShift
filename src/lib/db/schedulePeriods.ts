import { prisma } from "@/lib/db/prisma";
import {
  CreateSchedulePeriodInput,
  CreateShiftSlotInput,
} from "@/types/db_types";
import { Departments } from "@/types/common";

export async function getSchedulePeriods() {
  return prisma.schedulePeriod.findMany({
    orderBy: { startDate: "desc" },
  });
}

export async function getPublishedSchedulePeriods() {
  return prisma.schedulePeriod.findMany({
    where: { published: true },
    orderBy: { startDate: "desc" },
  });
}

export async function getSchedulePeriodById(id: string) {
  return prisma.schedulePeriod.findUnique({
    where: { id },
    include: {
      shiftSlots: {
        orderBy: { startTime: "asc" },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });
}

export async function getSchedulePeriodByDepartmentAndStartDate(
  department: Departments,
  startDate: Date,
) {
  return prisma.schedulePeriod.findFirst({
    where: {
      department,
      startDate: new Date(startDate),
    },
    select: {
      id: true,
    },
  });
}

// create a period only, edit shiftslots manually
export async function createSchedulePeriod(input: CreateSchedulePeriodInput) {
  return prisma.schedulePeriod.create({
    data: {
      department: input.department,
      startDate: input.startDate,
      endDate: input.endDate,
      published: false,
    },
    select: {
      id: true,
    },
  });
}

// create a period with all belonging shiftslots from template
export async function createSchedulePeriodFromTemplate(input: {
  department: Departments;
  startDate: Date;
  endDate: Date;
  shiftSlots: CreateShiftSlotInput[];
}) {
  const { department, startDate, endDate, shiftSlots } = input;

  return prisma.$transaction(async (tx) => {
    const period = await tx.schedulePeriod.create({
      data: {
        department,
        startDate,
        endDate,
        published: false,
      },
    });

    await tx.shiftSlot.createMany({
      data: shiftSlots.map((slot) => ({
        periodId: period.id,
        department: slot.department,
        position: slot.position,
        startTime: slot.startTime,
        endTime: slot.endTime,
      })),
    });

    return period;
  });
}

// publish schedule
export function publishSchedulePeriod(id: string) {
  return prisma.schedulePeriod.update({
    where: {
      id,
    },
    data: {
      published: true,
    },
  });
}
