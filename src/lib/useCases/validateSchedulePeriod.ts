import { getAssignableEmployees } from "@/lib/db/employees";
import {
  getSchedulePeriodById,
  markSchedulePeriodValidated,
} from "@/lib/db/schedulePeriods";

import { validateSchedule } from "@/lib/functions/validateSchedule";
import { mapSchedulePeriodToSchedule } from "@/lib/mappers/scheduleMappers";

import type { UUID } from "@/types/common";
import type {
  SchedulePeriod,
  scheduleValidationError,
} from "@/types/scheduling";
import type { UseCaseResult } from "@/types/useCases";

export type ValidateSchedulePeriodError =
  | {
      code: "SCHEDULE_NOT_FOUND";
      message: string;
    }
  | {
      code: "SCHEDULE_ALREADY_PUBLISHED";
      message: string;
    }
  | {
      code: "SCHEDULE_VALIDATION_FAILED";
      message: string;
      issues: scheduleValidationError[];
    };

export type ValidateSchedulePeriodResult = UseCaseResult<
  {
    period: SchedulePeriod;
  },
  ValidateSchedulePeriodError
>;

export async function validateSchedulePeriod(
  periodId: UUID,
): Promise<ValidateSchedulePeriodResult> {
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

  if (period.status === "PUBLISHED") {
    return {
      ok: false,
      error: {
        code: "SCHEDULE_ALREADY_PUBLISHED",
        message: "Schedule is already published.",
      },
    };
  }

  const employees = await getAssignableEmployees();

  const issues = validateSchedule(period.shiftSlots, employees);

  if (issues.length > 0) {
    return {
      ok: false,
      error: {
        code: "SCHEDULE_VALIDATION_FAILED",
        message: "Schedule validation failed.",
        issues,
      },
    };
  }

  if (period.status === "VALIDATED") {
    return {
      ok: true,
      data: {
        period: mapSchedulePeriodToSchedule(period),
      },
    };
  }

  const validatedPeriod = await markSchedulePeriodValidated(periodId);

  return {
    ok: true,
    data: {
      period: mapSchedulePeriodToSchedule(validatedPeriod),
    },
  };
}
