import {
  getSchedulePeriodById,
  markSchedulePeriodDraft,
} from "@/lib/db/schedulePeriods";

import type { UUID } from "@/types/common";
import type { ReopenScheduleResponse } from "@/types/scheduling";

export async function reopenSchedule(
  periodId: UUID,
): Promise<ReopenScheduleResponse> {
  const period = await getSchedulePeriodById(periodId);

  if (!period) {
    return {
      ok: false,
      code: "SCHEDULE_NOT_FOUND",
      error: "Schedule not found.",
    };
  }

  if (period.status === "DRAFT") {
    return {
      ok: false,
      code: "SCHEDULE_ALREADY_DRAFT",
      error: "Schedule is already a draft.",
    };
  }

  await markSchedulePeriodDraft(periodId);

  return {
    ok: true,
    schedule: {
      id: periodId,
      status: "DRAFT",
    },
  };
}
