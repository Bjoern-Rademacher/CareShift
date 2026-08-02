import {
  getShiftSlotById,
  getEmployeeShiftSlotsForWeek,
  updateShiftSlotEmployee,
} from "@/lib/db/shiftSlots";
import { getEmployeeById } from "@/lib/db/employees";

import { validateAssignment } from "@/lib/validation/assignmentRules";

import type { UUID } from "@/types/common";
import type { AssignmentValidationError } from "@/lib/validation/assignmentRules";

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
    };

type AssignEmployeeToShiftSlotInput = {
  slotId: UUID;
  employeeId: UUID;
};

export async function assignEmployeeToShiftSlot({
  slotId,
  employeeId,
}: AssignEmployeeToShiftSlotInput) {
  const slot = await getShiftSlotById(slotId);

  if (!slot) {
    return {
      ok: false,
      error: "Shift slot not found.",
    } as const;
  }

  const employee = await getEmployeeById(employeeId);

  if (!employee) {
    return {
      ok: false,
      error: "Employee not found.",
    } as const;
  }

  // Defensive validation.
  if (employee.status !== "ACTIVE") {
    return {
      ok: false,
      error: "Employee is inactive.",
    } as const;
  }

  if (!employee.departments.includes(slot.department)) {
    return {
      ok: false,
      error: "Employee cannot work in this department.",
    } as const;
  }

  if (employee.position !== slot.position) {
    return {
      ok: false,
      error: "Employee has the wrong position.",
    } as const;
  }

  const employeeShiftSlots = await getEmployeeShiftSlotsForWeek({
    employeeId,
    weekStartDate: slot.period.startDate,
    weekEndDate: slot.period.endDate,
  });

  const validationErrors = validateAssignment(slot, employeeShiftSlots);

  if (validationErrors.length > 0) {
    return {
      ok: false,
      errors: validationErrors,
    } as const;
  }

  const assigned = await updateShiftSlotEmployee({
    slotId,
    employeeId,
  });

  return {
    ok: true,
    assigned: {
      slotId: assigned.id as UUID,
      employeeId: assigned.employeeId as UUID,
    },
  } as const;
}
