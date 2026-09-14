import { prisma } from "@/lib/db/prisma";

import { getAssignableEmployeesByDepartmentAndPosition } from "@/lib/db/employees";
import { getSchedulePeriodById } from "@/lib/db/schedulePeriods";
import {
  getEmployeeAssignmentsInRange,
  getShiftSlotsByPeriodId,
} from "@/lib/db/shiftSlots";

import { createAutofillAssignments } from "@/lib/functions/autofill/createAutofillAssignments";
import { getAutofillTargetSlots } from "@/lib/functions/autofill/getAutofillTargetSlots";

import type { AutofillResult, AutofillScheduleInput } from "@/types/autofill";
import type { AssignableEmployee } from "@/types/employee";
import type { UseCaseResult } from "@/types/useCases";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const ROLLING_WINDOW_MS = 7 * DAY_IN_MS;

export type AutofillScheduleError = {
  code: "SCHEDULE_NOT_FOUND";
  message: string;
};

export type AutofillScheduleResult = UseCaseResult<
  AutofillResult,
  AutofillScheduleError
>;

export async function autofillSchedule(
  input: AutofillScheduleInput,
): Promise<AutofillScheduleResult> {
  const { periodId, scope, strategy } = input;

  const period = await getSchedulePeriodById(periodId);

  if (!period) {
    return {
      ok: false,
      error: {
        code: "SCHEDULE_NOT_FOUND",
        message: "Schedule not found.",
      },
    };
  }

  // Load the period slots and reduce them to the requested scope.
  const periodSlots = await getShiftSlotsByPeriodId(periodId);

  const targetSlots = getAutofillTargetSlots({
    slots: periodSlots,
    scope,
  });

  if (targetSlots.length === 0) {
    return {
      ok: true,
      data: {
        assignedCount: 0,
        unfilledSlotIds: [],
        assignments: [],
      },
    };
  }

  // Load eligible employees once for each required position.
  const positions = [...new Set(targetSlots.map((slot) => slot.position))];

  const employeeGroups = await Promise.all(
    positions.map((position) =>
      getAssignableEmployeesByDepartmentAndPosition({
        department: period.department,
        position,
      }),
    ),
  );

  const employees: AssignableEmployee[] = employeeGroups.flat();

  if (employees.length === 0) {
    return {
      ok: true,
      data: {
        assignedCount: 0,
        unfilledSlotIds: targetSlots.map((slot) => slot.id),
        assignments: [],
      },
    };
  }

  const employeeIds = employees.map((employee) => employee.id);

  // Include surrounding assignments for workload, overlap and rest checks.
  const rangeStart = new Date(period.startDate.getTime() - ROLLING_WINDOW_MS);
  const rangeEnd = new Date(period.endDate.getTime() + ROLLING_WINDOW_MS);

  const assignmentSlots = await getEmployeeAssignmentsInRange({
    employeeIds,
    rangeStart,
    rangeEnd,
  });

  // Build the complete plan before writing anything.
  const result = createAutofillAssignments({
    targetSlots,
    assignmentSlots,
    employees,
    weekStart: period.startDate,
    weekEnd: period.endDate,
    strategy,
  });

  if (result.assignments.length === 0) {
    return {
      ok: true,
      data: result,
    };
  }

  // Persist the generated plan atomically.
  await prisma.$transaction(async (tx) => {
    for (const assignment of result.assignments) {
      await tx.shiftSlot.update({
        where: {
          id: assignment.slotId,
        },
        data: {
          employeeId: assignment.employeeId,
        },
      });
    }

    // Assignment changes invalidate validation and publication.
    if (period.status === "VALIDATED" || period.status === "PUBLISHED") {
      await tx.schedulePeriod.update({
        where: {
          id: periodId,
        },
        data: {
          status: "DRAFT",
        },
      });
    }
  });

  return {
    ok: true,
    data: result,
  };
}
