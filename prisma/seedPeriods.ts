import "dotenv/config";

import { prisma } from "@/lib/db/prisma";

import type {
  Department,
  EmployeeStatus,
  Position,
  Weekday,
} from "@/generated/prisma/enums";

const DEPARTMENTS: Department[] = ["ER", "ICU", "SURGERY", "RADIOLOGY"];

const WEEKDAY_OFFSETS: Record<Weekday, number> = {
  MON: 0,
  TUE: 1,
  WED: 2,
  THU: 3,
  FRI: 4,
  SAT: 5,
  SUN: 6,
};

const MAXIMUM_WEEKLY_HOURS = 40;
const MINIMUM_REST_HOURS = 11;
const HOUR_MS = 60 * 60 * 1000;

type SeedEmployee = {
  id: string;
  position: Position;
  departments: Department[];
  status: EmployeeStatus;
};

type GeneratedSlot = {
  department: Department;
  position: Position;
  slotNumber: number;
  startTime: Date;
  endTime: Date;
};

type AssignedSlot = GeneratedSlot & {
  employeeId: string;
};

function getUtcMonday(date: Date): Date {
  const result = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );

  const weekday = result.getUTCDay();
  const daysSinceMonday = weekday === 0 ? 6 : weekday - 1;

  result.setUTCDate(result.getUTCDate() - daysSinceMonday);

  return result;
}

function addUtcDays(date: Date, days: number): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() + days,
    ),
  );
}

function createUtcDateTime(day: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);

  return new Date(
    Date.UTC(
      day.getUTCFullYear(),
      day.getUTCMonth(),
      day.getUTCDate(),
      hours,
      minutes,
    ),
  );
}

function getDurationHours(slot: GeneratedSlot): number {
  return (slot.endTime.getTime() - slot.startTime.getTime()) / HOUR_MS;
}

function overlaps(first: GeneratedSlot, second: GeneratedSlot): boolean {
  return (
    first.startTime.getTime() < second.endTime.getTime() &&
    second.startTime.getTime() < first.endTime.getTime()
  );
}

function hasEnoughRest(
  candidate: GeneratedSlot,
  assignments: AssignedSlot[],
): boolean {
  for (const assignment of assignments) {
    if (overlaps(candidate, assignment)) {
      return false;
    }

    if (assignment.endTime.getTime() <= candidate.startTime.getTime()) {
      const restHours =
        (candidate.startTime.getTime() - assignment.endTime.getTime()) /
        HOUR_MS;

      if (restHours < MINIMUM_REST_HOURS) {
        return false;
      }
    }

    if (candidate.endTime.getTime() <= assignment.startTime.getTime()) {
      const restHours =
        (assignment.startTime.getTime() - candidate.endTime.getTime()) /
        HOUR_MS;

      if (restHours < MINIMUM_REST_HOURS) {
        return false;
      }
    }
  }

  return true;
}

async function generateSlots(
  department: Department,
  weekStartDate: Date,
): Promise<GeneratedSlot[]> {
  const rules = await prisma.templateRule.findMany({
    where: {
      department,
      active: true,
    },
  });

  const slots: GeneratedSlot[] = [];

  for (const rule of rules) {
    for (const weekday of rule.weekdays) {
      const day = addUtcDays(weekStartDate, WEEKDAY_OFFSETS[weekday]);

      for (let index = 0; index < rule.slots; index++) {
        const startTime = createUtcDateTime(day, rule.startTimeLocal);

        const endTime = createUtcDateTime(day, rule.endTimeLocal);

        // Night shifts continue into the following calendar day.
        if (endTime.getTime() <= startTime.getTime()) {
          endTime.setUTCDate(endTime.getUTCDate() + 1);
        }

        slots.push({
          department: rule.department,
          position: rule.position,
          slotNumber: index + 1,
          startTime,
          endTime,
        });
      }
    }
  }

  return slots.sort(
    (first, second) => first.startTime.getTime() - second.startTime.getTime(),
  );
}

function assignSlots({
  slots,
  employees,
  existingAssignments,
  assignmentRatio,
  weekStartDate,
  weekEndDate,
}: {
  slots: GeneratedSlot[];
  employees: SeedEmployee[];
  existingAssignments: AssignedSlot[];
  assignmentRatio: number;
  weekStartDate: Date;
  weekEndDate: Date;
}): Array<GeneratedSlot & { employeeId: string | null }> {
  const assignmentTarget = Math.floor(slots.length * assignmentRatio);
  const weeklyHours = new Map<string, number>();

  // Count assignments already created in other departments of this week.
  for (const assignment of existingAssignments) {
    const belongsToWeek =
      assignment.startTime.getTime() >= weekStartDate.getTime() &&
      assignment.startTime.getTime() < weekEndDate.getTime();

    if (!belongsToWeek) continue;

    weeklyHours.set(
      assignment.employeeId,
      (weeklyHours.get(assignment.employeeId) ?? 0) +
        getDurationHours(assignment),
    );
  }

  const allAssignments = [...existingAssignments];
  let assignedCount = 0;

  return slots.map((slot) => {
    if (assignedCount >= assignmentTarget) {
      return {
        ...slot,
        employeeId: null,
      };
    }

    const eligibleEmployees = employees
      .filter(
        (employee) =>
          employee.status === "ACTIVE" &&
          employee.position === slot.position &&
          employee.departments.includes(slot.department),
      )
      .sort(
        (first, second) =>
          (weeklyHours.get(first.id) ?? 0) - (weeklyHours.get(second.id) ?? 0),
      );

    const employee = eligibleEmployees.find((candidate) => {
      const candidateAssignments = allAssignments.filter(
        (assignment) => assignment.employeeId === candidate.id,
      );

      const nextWeeklyHours =
        (weeklyHours.get(candidate.id) ?? 0) + getDurationHours(slot);

      return (
        nextWeeklyHours <= MAXIMUM_WEEKLY_HOURS &&
        hasEnoughRest(slot, candidateAssignments)
      );
    });

    if (!employee) {
      return {
        ...slot,
        employeeId: null,
      };
    }

    weeklyHours.set(
      employee.id,
      (weeklyHours.get(employee.id) ?? 0) + getDurationHours(slot),
    );

    allAssignments.push({
      ...slot,
      employeeId: employee.id,
    });

    assignedCount += 1;

    return {
      ...slot,
      employeeId: employee.id,
    };
  });
}

async function main() {
  const employees = await prisma.employee.findMany({
    select: {
      id: true,
      position: true,
      departments: true,
      status: true,
    },
  });

  if (employees.length === 0) {
    throw new Error("Seed employees before seeding schedule periods.");
  }

  const templateRuleCount = await prisma.templateRule.count();

  if (templateRuleCount === 0) {
    throw new Error("Seed template rules before seeding schedule periods.");
  }

  await prisma.shiftSlot.deleteMany();
  await prisma.schedulePeriod.deleteMany();

  const currentWeekStart = getUtcMonday(new Date());

  const weeks = [
    {
      startDate: addUtcDays(currentWeekStart, -7),
      published: true,
      assignmentRatio: 1,
    },
    {
      startDate: currentWeekStart,
      published: false,
      assignmentRatio: 0.7,
    },
    {
      startDate: addUtcDays(currentWeekStart, 7),
      published: false,
      assignmentRatio: 0,
    },
  ];

  for (const week of weeks) {
    const weekEndDate = addUtcDays(week.startDate, 7);

    for (const department of DEPARTMENTS) {
      const generatedSlots = await generateSlots(department, week.startDate);

      // Include previously-created departments and weeks so cross-trained
      // employees are not double-booked and week boundaries remain valid.
      const existingRows = await prisma.shiftSlot.findMany({
        where: {
          employeeId: {
            not: null,
          },
        },
        select: {
          employeeId: true,
          department: true,
          position: true,
          slotNumber: true,
          startTime: true,
          endTime: true,
        },
      });

      const existingAssignments: AssignedSlot[] = existingRows.flatMap(
        (slot) =>
          slot.employeeId
            ? [
                {
                  employeeId: slot.employeeId,
                  department: slot.department,
                  position: slot.position,
                  slotNumber: slot.slotNumber,
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                },
              ]
            : [],
      );

      const assignedSlots = assignSlots({
        slots: generatedSlots,
        employees,
        existingAssignments,
        assignmentRatio: week.assignmentRatio,
        weekStartDate: week.startDate,
        weekEndDate,
      });

      await prisma.schedulePeriod.create({
        data: {
          department,
          startDate: week.startDate,
          endDate: weekEndDate,
          published: week.published,
          shiftSlots: {
            create: assignedSlots.map((slot) => ({
              employeeId: slot.employeeId,
              department: slot.department,
              position: slot.position,
              slotNumber: slot.slotNumber,
              startTime: slot.startTime,
              endTime: slot.endTime,
            })),
          },
        },
      });
    }
  }

  console.log("Seeded 12 schedule periods and their shift slots.");
}

main()
  .catch((error) => {
    console.error("Schedule-period seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
