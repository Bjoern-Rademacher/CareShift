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

  // Load the schedule period and make sure it can still be modified.
  const period = await getSchedulePeriodById(periodId);

  if (!period) {
    throw new Error("Schedule period not found.");
  }

  if (period.published) {
    throw new Error("Published schedules cannot be autofilled.");
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
  if (result.assignments.length === 0) {
    return result;
  }

  // Persist the complete generated plan atomically.
  // Either every assignment is written or none are.
  await prisma.$transaction(
    result.assignments.map((assignment) =>
      prisma.shiftSlot.update({
        where: {
          id: assignment.slotId,
        },
        data: {
          employeeId: assignment.employeeId,
        },
      }),
    ),
  );

  return result;
}
