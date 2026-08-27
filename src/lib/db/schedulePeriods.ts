import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { UUID } from "@/types/common";

import { getMonday } from "@/lib/functions/dateTimeUtils";

import type {
  CreateSchedulePeriodInput,
  CreateShiftSlotInput,
} from "@/types/db_types";
import type { Departments } from "@/types/common";

export async function getSchedulePeriods() {
  return prisma.schedulePeriod.findMany({
    orderBy: {
      startDate: "desc",
    },
  });
}

export async function getPublishedSchedulePeriods(
  range: "CURRENT_AND_FUTURE" | "PAST" = "CURRENT_AND_FUTURE",
) {
  const currentWeekStart = getMonday(new Date());

  if (range === "PAST") {
    const pastRangeStart = new Date(currentWeekStart);
    pastRangeStart.setUTCMonth(pastRangeStart.getUTCMonth() - 3);

    return prisma.schedulePeriod.findMany({
      where: {
        status: "PUBLISHED",

        startDate: {
          gte: pastRangeStart,
          lt: currentWeekStart,
        },
      },

      orderBy: {
        startDate: "desc",
      },
    });
  }

  return prisma.schedulePeriod.findMany({
    where: {
      status: "PUBLISHED",

      startDate: {
        gte: currentWeekStart,
      },
    },

    orderBy: {
      startDate: "asc",
    },
  });
}

export async function getSchedulePeriodById(id: string) {
  return prisma.schedulePeriod.findUnique({
    where: {
      id,
    },
    include: {
      shiftSlots: {
        orderBy: {
          startTime: "asc",
        },
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
      startDate,
    },
    select: {
      id: true,
    },
  });
}

// Create an empty schedule period.
// Status defaults to DRAFT in the database.
export async function createSchedulePeriod(input: CreateSchedulePeriodInput) {
  return prisma.schedulePeriod.create({
    data: {
      department: input.department,
      startDate: input.startDate,
      endDate: input.endDate,
    },
    select: {
      id: true,
    },
  });
}

// Create a schedule period together with its template-generated shift slots.
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
      },
    });

    await tx.shiftSlot.createMany({
      data: shiftSlots.map((slot) => ({
        periodId: period.id,
        department: slot.department,
        position: slot.position,
        slotNumber: slot.slotNumber,
        startTime: slot.startTime,
        endTime: slot.endTime,
      })),
    });

    return period;
  });
}

// Persist a successful schedule validation.
export function markSchedulePeriodValidated(id: string) {
  return prisma.schedulePeriod.update({
    where: {
      id,
    },
    data: {
      status: "VALIDATED",
    },
  });
}

// Invalidate a previous validation after the schedule changes.
export function markSchedulePeriodDraft(
  id: string,
  db: Prisma.TransactionClient | typeof prisma = prisma,
) {
  return db.schedulePeriod.update({
    where: {
      id,
    },
    data: {
      status: "DRAFT",
    },
  });
}

// Persist publication of a validated schedule.
// The use-case layer must verify the VALIDATED -> PUBLISHED transition.
export function publishSchedulePeriod(id: string) {
  return prisma.schedulePeriod.update({
    where: {
      id,
    },
    data: {
      status: "PUBLISHED",
    },
  });
}

export async function getSchedulePeriodsInRange(
  rangeStart: Date,
  rangeEnd: Date,
) {
  return prisma.schedulePeriod.findMany({
    where: {
      startDate: {
        gte: rangeStart,
        lt: rangeEnd,
      },
    },

    orderBy: [
      {
        startDate: "asc",
      },
      {
        department: "asc",
      },
    ],

    select: {
      id: true,
      department: true,
      startDate: true,
      endDate: true,
      status: true,
    },
  });
}

export async function getPublishedSchedulePeriodsForEmployee(
  employeeId: UUID,
  startDate: Date,
  endDate: Date,
) {
  return prisma.schedulePeriod.findMany({
    where: {
      status: "PUBLISHED",

      startDate: {
        gte: startDate,
        lt: endDate,
      },

      shiftSlots: {
        some: {
          employeeId,
        },
      },
    },

    select: {
      id: true,
      department: true,
      startDate: true,
      endDate: true,

      shiftSlots: {
        where: {
          employeeId,
        },

        select: {
          id: true,
        },
      },
    },

    orderBy: [
      {
        startDate: "asc",
      },
      {
        department: "asc",
      },
    ],
  });
}

export async function getPublishedSchedulePeriodForEmployeeById(
  scheduleId: UUID,
  employeeId: UUID,
) {
  return prisma.schedulePeriod.findFirst({
    where: {
      id: scheduleId,
      status: "PUBLISHED",

      // The period is only accessible when it contains a shift assigned to
      // the authenticated employee.
      shiftSlots: {
        some: {
          employeeId,
        },
      },
    },

    include: {
      // Return only this employee's shifts, not the complete schedule.
      shiftSlots: {
        where: {
          employeeId,
        },
        orderBy: {
          startTime: "asc",
        },
      },
    },
  });
}
