import {
  getSchedulePeriodById,
  markSchedulePeriodDraft,
} from "@/lib/db/schedulePeriods";

import type { UUID } from "@/types/common";
import type { UseCaseResult } from "@/types/useCases";

export type ReopenScheduleError =
  | {
      code: "SCHEDULE_NOT_FOUND";
      message: string;
    }
  | {
      code: "SCHEDULE_ALREADY_DRAFT";
      message: string;
    };

export type ReopenScheduleResult = UseCaseResult<
  {
    schedule: {
      id: UUID;
      status: "DRAFT";
    };
  },
  ReopenScheduleError
>;

export async function reopenSchedule(
  periodId: UUID,
): Promise<ReopenScheduleResult> {
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

  if (period.status === "DRAFT") {
    return {
      ok: true,
      data: {
        schedule: {
          id: periodId,
          status: "DRAFT",
        },
      },
    };
  }

  await markSchedulePeriodDraft(periodId);

  return {
    ok: true,
    data: {
      schedule: {
        id: periodId,
        status: "DRAFT",
      },
    },
  };
}
