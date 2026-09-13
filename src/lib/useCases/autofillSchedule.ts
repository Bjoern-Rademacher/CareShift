import { prisma } from "@/lib/db/prisma";

import { getAssignableEmployeesByDepartmentAndPosition } from "@/lib/db/employees";
import {
  getEmployeeAssignmentsInRange,
  getShiftSlotsByPeriodId,
} from "@/lib/db/shiftSlots";
import { getSchedulePeriodById } from "@/lib/db/schedulePeriods";

import { createAutofillAssignments } from "@/lib/functions/autofill/createAutofillAssignments";
import { getAutofillTargetSlots } from "@/lib/functions/autofill/getAutofillTargetSlots";

import type { AutofillResult, AutofillScheduleInput } from "@/types/autofill";
import type { AssignableEmployee } from "@/types/employee";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const ROLLING_WINDOW_MS = 7 * DAY_IN_MS;

export async function autofillSchedule(
  input: AutofillScheduleInput,
): Promise<AutofillResult> {
  const { periodId, scope, strategy } = input;

  const period = await getSchedulePeriodById(periodId);

  if (!period) {
    throw new Error("Schedule period not found.");
  }

  // Load all slots for the period, then reduce them to the requested autofill scope.
  const periodSlots = await getShiftSlotsByPeriodId(periodId);

  const targetSlots = getAutofillTargetSlots({
    slots: periodSlots,
    scope,
  });

  // Nothing to fill.
  if (targetSlots.length === 0) {
    return {
      assignedCount: 0,
      unfilledSlotIds: [],
      assignments: [],
    };
  }

  // Load eligible employees once per required position instead of once per slot.
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

  // No eligible employees means every target slot stays open.
  if (employees.length === 0) {
    return {
      assignedCount: 0,
      unfilledSlotIds: targetSlots.map((slot) => slot.id),
      assignments: [],
    };
  }

  const employeeIds = employees.map((employee) => employee.id);

  // Load surrounding assignments as context for overlap, rest,
  // weekly-hour and rolling 7-day checks.
  const rangeStart = new Date(period.startDate.getTime() - ROLLING_WINDOW_MS);

  const rangeEnd = new Date(period.endDate.getTime() + ROLLING_WINDOW_MS);

  const assignmentSlots = await getEmployeeAssignmentsInRange({
    employeeIds,
    rangeStart,
    rangeEnd,
  });

  // Build the autofill plan in memory before writing anything to the database.
  const result = createAutofillAssignments({
    targetSlots,
    assignmentSlots,
    employees,
    weekStart: period.startDate,
    weekEnd: period.endDate,
    strategy,
  });

  // No valid assignments could be generated.
  // Since nothing changes, the period status stays untouched.
  if (result.assignments.length === 0) {
    return result;
  }

  // Persist the complete generated plan atomically.
  // Any previous validation or publication becomes stale once assignments change.
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

  return result;
}
