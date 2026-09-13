// types/autofill.ts

import type { UUID } from "@/types/common";

export type AutofillScope =
  | {
      type: "ALL_OPEN";
    }
  | {
      type: "FILTERED";
      slotIds: UUID[];
    }
  | {
      type: "DAY";
      weekday: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
    }
  | {
      type: "SHIFT_GROUP";
      shiftGroup: "MORNING" | "EVENING" | "NIGHT";
    }
  | {
      type: "POSITION";
      position: string;
    }
  | {
      type: "SINGLE_SLOT";
      slotId: UUID;
    };

export type AutofillStrategy =
  | "BALANCE_WORKLOAD"
  | "MINIMIZE_NIGHTS"
  | "MINIMIZE_WEEKENDS"
  | "BALANCED_FAIRNESS";

export type AutofillScheduleInput = {
  periodId: UUID;
  scope: AutofillScope;
  strategy: AutofillStrategy;
};

export type AutofillAssignment = {
  slotId: UUID;
  employeeId: UUID;
};

export type AutofillResult = {
  assignedCount: number;
  unfilledSlotIds: UUID[];
  assignments: AutofillAssignment[];
};
