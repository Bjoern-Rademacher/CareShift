import { getShiftGroup } from "@/lib/functions/scheduleUtils";
import { getWeekday } from "@/lib/functions/dateTimeUtils";

import type { AutofillScope } from "@/types/autofill";
import type { AssignmentShift } from "@/types/assignment";

type Input = {
  slots: AssignmentShift[];
  scope: AutofillScope;
};

export function getAutofillTargetSlots({
  slots,
  scope,
}: Input): AssignmentShift[] {
  const openSlots = slots.filter((slot) => slot.employeeId === null);

  switch (scope.type) {
    case "ALL_OPEN":
      return openSlots;

    case "FILTERED":
      return openSlots.filter((slot) => scope.slotIds.includes(slot.id));

    case "DAY":
      return openSlots.filter(
        (slot) => getWeekday(slot.startTime) === scope.weekday,
      );

    case "SHIFT_GROUP":
      return openSlots.filter(
        (slot) => getShiftGroup(slot.startTime) === scope.shiftGroup,
      );

    case "POSITION":
      return openSlots.filter((slot) => slot.position === scope.position);

    case "SINGLE_SLOT":
      return openSlots.filter((slot) => slot.id === scope.slotId);
  }
}
