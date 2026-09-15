import "server-only";

import { getAssignableEmployees } from "@/lib/db/employees";
import {
  getSchedulePeriodById,
  publishSchedulePeriod as persistPublishedSchedulePeriod,
} from "@/lib/db/schedulePeriods";

import { validateSchedule } from "@/lib/functions/validateSchedule";

import type { SchedulePeriodModel } from "@/generated/prisma/models/SchedulePeriod";

import type { UUID } from "@/types/common";
import type { scheduleValidationError } from "@/types/scheduling";
import type { UseCaseResult } from "@/types/useCases";

export type PublishScheduleError =
  | {
      code: "SCHEDULE_NOT_FOUND";
      message: string;
    }
  | {
      code: "SCHEDULE_NOT_VALIDATED";
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

export type PublishScheduleResult = UseCaseResult<
  {
    period: SchedulePeriodModel;
  },
  PublishScheduleError
>;

export async function publishSchedulePeriod(
  periodId: UUID,
): Promise<PublishScheduleResult> {
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

  if (period.status !== "VALIDATED") {
    return {
      ok: false,
      error: {
        code: "SCHEDULE_NOT_VALIDATED",
        message: "Schedule must be validated before publishing.",
      },
    };
  }

  // Recheck the schedule immediately before publishing.
  const employees = await getAssignableEmployees();
  const validationErrors = validateSchedule(period.shiftSlots, employees);

  if (validationErrors.length > 0) {
    return {
      ok: false,
      error: {
        code: "SCHEDULE_VALIDATION_FAILED",
        message: "Schedule validation failed.",
        issues: validationErrors,
      },
    };
  }

  const publishedPeriod = await persistPublishedSchedulePeriod(periodId);

  return {
    ok: true,
    data: {
      period: publishedPeriod,
    },
  };
}
