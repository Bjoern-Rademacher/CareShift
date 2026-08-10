import { createAssignmentCandidates } from "@/lib/functions/createAssignmentCandidates";

import type {
  AutofillAssignment,
  AutofillResult,
  AutofillStrategy,
} from "@/types/autofill";
import type { AssignmentShift } from "@/types/assignment";
import type { AssignableEmployee } from "@/types/employee";

type Input = {
  targetSlots: AssignmentShift[];
  assignmentSlots: AssignmentShift[];
  employees: AssignableEmployee[];
  weekStart: Date;
  weekEnd: Date;
  strategy: AutofillStrategy;
};

type AssignmentCandidate = ReturnType<
  typeof createAssignmentCandidates
>[number];

function selectAutofillCandidate(
  candidates: AssignmentCandidate[],
  strategy: AutofillStrategy,
): AssignmentCandidate | null {
  if (candidates.length === 0) {
    return null;
  }

  // V1 relies on the ordering already produced by
  // createAssignmentCandidates().
  switch (strategy) {
    case "BALANCE_WORKLOAD":
      return candidates[0];

    case "MINIMIZE_NIGHTS":
    case "MINIMIZE_WEEKENDS":
    case "BALANCED_FAIRNESS":
      throw new Error(`Autofill strategy ${strategy} is not implemented yet.`);
  }
}

export function createAutofillAssignments({
  targetSlots,
  assignmentSlots,
  employees,
  weekStart,
  weekEnd,
  strategy,
}: Input): AutofillResult {
  /*
   * Keep a mutable in-memory view of all assignments.
   * Newly generated assignments are added here immediately,
   * so later slots are evaluated against earlier autofill decisions.
   */
  const workingAssignments = [...assignmentSlots];

  const assignments: AutofillAssignment[] = [];
  const unfilledSlotIds: AssignmentShift["id"][] = [];

  /*
   * Process slots chronologically.
   * This makes earlier autofill decisions available when
   * evaluating later shifts for overlap, rest and workload.
   */
  const sortedTargetSlots = [...targetSlots].sort(
    (first, second) => first.startTime.getTime() - second.startTime.getTime(),
  );

  for (const slot of sortedTargetSlots) {
    /*
     * Only employees matching both position and department
     * are relevant candidates for this slot.
     */
    const employeesForSlot = employees.filter(
      (employee) =>
        employee.position === slot.position &&
        employee.departments.includes(slot.department),
    );

    /*
     * Re-evaluate candidates against the current working state.
     * This includes assignments generated during earlier loop iterations.
     */
    const candidates = createAssignmentCandidates({
      selectedSlot: slot,
      assignmentSlots: workingAssignments,
      employees: employeesForSlot,
      weekStart,
      weekEnd,
    });

    const assignableCandidates = candidates.filter(
      (candidate) => candidate.assignable,
    );

    const selectedCandidate = selectAutofillCandidate(
      assignableCandidates,
      strategy,
    );

    /*
     * If nobody can legally take this slot,
     * leave it open and continue with the remaining slots.
     */
    if (!selectedCandidate) {
      unfilledSlotIds.push(slot.id);
      continue;
    }

    const employeeId = selectedCandidate.employee.id;

    assignments.push({
      slotId: slot.id,
      employeeId,
    });

    /*
     * Add the generated assignment immediately so the next slot
     * sees the updated schedule state.
     */
    workingAssignments.push({
      ...slot,
      employeeId,
    });
  }

  return {
    assignedCount: assignments.length,
    unfilledSlotIds,
    assignments,
  };
}
