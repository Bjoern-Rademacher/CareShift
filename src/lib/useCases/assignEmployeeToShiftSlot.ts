import { prisma } from "@/lib/db/prisma";

import {
  getEmployeeShiftSlotsAroundShift,
  getEmployeeShiftSlotsForWeek,
  getShiftSlotById,
  updateShiftSlotEmployee,
} from "@/lib/db/shiftSlots";
import { getEmployeeById } from "@/lib/db/employees";
import { markSchedulePeriodDraft } from "@/lib/db/schedulePeriods";

import { validateAssignment } from "@/lib/validation/assignmentRules";

import type { UUID } from "@/types/common";
import type { AssignmentValidationError } from "@/types/scheduling";

type AssignEmployeeResponse =
  | {
      ok: true;
      assigned: {
        slotId: UUID;
        employeeId: UUID;
      };
    }
  | {
      ok: false;
      errors: AssignmentValidationError[];
    }
  | {
      ok: false;
      error: string;
    };

type AssignEmployeeToShiftSlotInput = {
  slotId: UUID;
  employeeId: UUID;
};

export async function assignEmployeeToShiftSlot({
  slotId,
  employeeId,
}: AssignEmployeeToShiftSlotInput): Promise<AssignEmployeeResponse> {
  const slot = await getShiftSlotById(slotId);

  if (!slot) {
    return {
      ok: false,
      error: "Shift slot not found.",
    };
  }

  const employee = await getEmployeeById(employeeId);

  if (!employee) {
    return {
      ok: false,
      error: "Employee not found.",
    };
  }

  // Requests must still be validated on the backend even though
  // the frontend only displays eligible employees.
  if (employee.status !== "ACTIVE") {
    return {
      ok: false,
      error: "Employee is inactive.",
    };
  }

  if (!employee.departments.includes(slot.department)) {
    return {
      ok: false,
      error: "Employee cannot work in this department.",
    };
  }

  if (employee.position !== slot.position) {
    return {
      ok: false,
      error: "Employee has the wrong position.",
    };
  }

  // Weekly slots are used only for the weekly-hours limit.
  // A shift belongs to the week in which it starts.
  const weeklySlots = await getEmployeeShiftSlotsForWeek({
    employeeId,
    weekStartDate: slot.period.startDate,
    weekEndDate: slot.period.endDate,
  });

  // Nearby slots include assignments from neighboring schedule periods.
  // They are needed for overlap and minimum-rest validation.
  const nearbySlots = await getEmployeeShiftSlotsAroundShift({
    employeeId,
    shiftStart: slot.startTime,
    shiftEnd: slot.endTime,
  });

  const validationErrors = validateAssignment(slot, nearbySlots, weeklySlots);

  if (validationErrors.length > 0) {
    return {
      ok: false,
      errors: validationErrors,
    };
  }

  const assigned = await prisma.$transaction(async (tx) => {
    const updatedSlot = await updateShiftSlotEmployee(
      {
        slotId,
        employeeId,
      },
      tx,
    );

    if (
      slot.period.status === "VALIDATED" ||
      slot.period.status === "PUBLISHED"
    ) {
      await markSchedulePeriodDraft(slot.periodId, tx);
    }

    return updatedSlot;
  });

  if (!assigned.employeeId) {
    throw new Error("Assignment update returned no employee id.");
  }

  return {
    ok: true,
    assigned: {
      slotId: assigned.id as UUID,
      employeeId: assigned.employeeId as UUID,
    },
  };
}
