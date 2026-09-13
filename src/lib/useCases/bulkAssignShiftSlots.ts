import { prisma } from "@/lib/db/prisma";

import { getEmployeeAssignmentsInRange } from "@/lib/db/shiftSlots";
import { getShiftSlotsByIds } from "@/lib/db/shiftSlots";
import { getEmployeeById } from "@/lib/db/employees";

import { createAssignmentCandidates } from "@/lib/functions/createAssignmentCandidates";
import { getMonday } from "@/lib/functions/dateTimeUtils";

import type { AssignmentShift } from "@/types/assignment";
import type { BulkAssignInput, BulkAssignResult } from "@/types/bulkAssignment";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const ROLLING_WINDOW_MS = 7 * DAY_IN_MS;

export async function bulkAssignShiftSlots(
  input: BulkAssignInput,
): Promise<BulkAssignResult> {
  const { slotIds, employeeId, reassignExisting } = input;

  if (slotIds.length === 0) {
    throw new Error("No shift slots selected.");
  }

  // Load all selected slots and make sure every requested id exists.
  const selectedSlots = await getShiftSlotsByIds(slotIds);

  if (selectedSlots.length !== slotIds.length) {
    throw new Error("One or more selected shift slots were not found.");
  }

  const employee = await getEmployeeById(employeeId);

  if (!employee) {
    throw new Error("Employee not found.");
  }

  const skippedSlotIds: AssignmentShift["id"][] = [];

  /*
   * Resolve the actual assignment intent:
   * - already assigned to this employee → skip
   * - assigned to someone else and reassignment disabled → skip
   * - otherwise → validate and assign
   */
  const slotsToAssign = selectedSlots
    .filter((slot) => {
      if (slot.employeeId === employeeId) {
        skippedSlotIds.push(slot.id);
        return false;
      }

      if (slot.employeeId !== null && !reassignExisting) {
        skippedSlotIds.push(slot.id);
        return false;
      }

      return true;
    })
    .sort(
      (first, second) => first.startTime.getTime() - second.startTime.getTime(),
    );

  if (slotsToAssign.length === 0) {
    return {
      assignedSlotIds: [],
      skippedSlotIds,
    };
  }

  /*
   * Load enough surrounding assignment context for overlap,
   * rest, weekly-hours and rolling 7-day validation.
   */
  const earliestStart = slotsToAssign[0].startTime;

  const latestEnd = slotsToAssign.reduce(
    (latest, slot) =>
      slot.endTime.getTime() > latest.getTime() ? slot.endTime : latest,
    slotsToAssign[0].endTime,
  );

  const rangeStart = new Date(earliestStart.getTime() - ROLLING_WINDOW_MS);

  const rangeEnd = new Date(latestEnd.getTime() + ROLLING_WINDOW_MS);

  const assignmentSlots = await getEmployeeAssignmentsInRange({
    employeeIds: [employeeId],
    rangeStart,
    rangeEnd,
  });

  /*
   * Simulate every assignment in memory first.
   * Later selected slots therefore see earlier bulk assignments.
   */
  const workingAssignments = [...assignmentSlots];

  for (const slot of slotsToAssign) {
    const weekStart = getMonday(slot.startTime);

    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);

    const candidates = createAssignmentCandidates({
      selectedSlot: slot,
      assignmentSlots: workingAssignments,
      employees: [employee],
      weekStart,
      weekEnd,
    });

    const candidate = candidates[0];

    if (!candidate?.assignable) {
      throw new Error(
        candidate?.unavailableReason
          ? `Bulk assignment failed: ${candidate.unavailableReason}.`
          : "Bulk assignment failed.",
      );
    }

    /*
     * Replace any existing representation of this slot in the
     * working state and simulate the new assignment.
     */
    const existingIndex = workingAssignments.findIndex(
      (assignment) => assignment.id === slot.id,
    );

    const simulatedAssignment: AssignmentShift = {
      ...slot,
      employeeId,
    };

    if (existingIndex >= 0) {
      workingAssignments[existingIndex] = simulatedAssignment;
    } else {
      workingAssignments.push(simulatedAssignment);
    }
  }

  // Every selected assignment passed validation, so persist atomically.
  await prisma.$transaction(async (tx) => {
    for (const slot of slotsToAssign) {
      await tx.shiftSlot.update({
        where: {
          id: slot.id,
        },
        data: {
          employeeId,
        },
      });
    }

    const periodIdsToReset = [
      ...new Set(
        slotsToAssign
          .filter(
            (slot) =>
              slot.period.status === "VALIDATED" ||
              slot.period.status === "PUBLISHED",
          )
          .map((slot) => slot.periodId),
      ),
    ];

    if (periodIdsToReset.length > 0) {
      await tx.schedulePeriod.updateMany({
        where: {
          id: {
            in: periodIdsToReset,
          },
        },
        data: {
          status: "DRAFT",
        },
      });
    }
  });

  return {
    assignedSlotIds: slotsToAssign.map((slot) => slot.id),
    skippedSlotIds,
  };
}
