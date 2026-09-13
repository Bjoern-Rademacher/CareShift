import { prisma } from "@/lib/db/prisma";
import { clearScheduleAssignments as clearAssignments } from "@/lib/db/shiftSlots";

import type { UUID } from "@/types/common";
import type { UseCaseResult } from "@/types/useCases";

export type ClearScheduleAssignmentsError =
  | {
      code: "SCHEDULE_NOT_DRAFT";
      message: string;
    }
  | {
      code: "SCHEDULE_NOT_FOUND";
      message: string;
    };

export type ClearScheduleAssignmentsResult = UseCaseResult<
  { clearedCount: number },
  ClearScheduleAssignmentsError
>;

export async function clearScheduleAssignments(
  periodId: UUID,
): Promise<ClearScheduleAssignmentsResult> {
  return prisma.$transaction(
    async (tx): Promise<ClearScheduleAssignmentsResult> => {
      // Lock the draft period so its status cannot change while clearing slots.
      const draft = await tx.schedulePeriod.updateMany({
        where: { id: periodId, status: "DRAFT" },
        data: { status: "DRAFT" },
      });

      if (draft.count === 0) {
        // Distinguish a missing schedule from one that is not a draft.
        const period = await tx.schedulePeriod.findUnique({
          where: { id: periodId },
          select: { id: true },
        });

        if (!period) {
          return {
            ok: false,
            error: {
              code: "SCHEDULE_NOT_FOUND",
              message: "Schedule not found.",
            },
          };
        }

        return {
          ok: false,
          error: {
            code: "SCHEDULE_NOT_DRAFT",
            message:
              "Return the schedule to draft before clearing assignments.",
          },
        };
      }

      const result = await clearAssignments(periodId, tx);

      return {
        ok: true,
        data: {
          clearedCount: result.count,
        },
      };
    },
  );
}
