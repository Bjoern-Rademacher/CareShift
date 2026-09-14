import { parseJsonBody } from "@/app/api/_shared/requests";

import { requireAdmin } from "@/lib/auth/authorization";
import {
  autofillSchedule,
  type AutofillScheduleError,
} from "@/lib/useCases/autofillSchedule";
import { isRecord } from "@/lib/validation/common";

import type {
  AutofillScheduleResponse,
  AutofillStrategy,
} from "@/types/autofill";
import type { UUID } from "@/types/common";

type Context = {
  params: Promise<{
    id: UUID;
  }>;
};

type AutofillRequest = {
  scope: {
    type: "ALL_OPEN";
  };
  strategy: AutofillStrategy;
};

const errorStatuses = {
  SCHEDULE_NOT_FOUND: 404,
} satisfies Record<AutofillScheduleError["code"], number>;

function parseAutofillRequest(value: unknown): AutofillRequest | null {
  if (
    !isRecord(value) ||
    !isRecord(value.scope) ||
    value.scope.type !== "ALL_OPEN" ||
    value.strategy !== "BALANCE_WORKLOAD"
  ) {
    return null;
  }

  return {
    scope: {
      type: "ALL_OPEN",
    },
    strategy: value.strategy,
  };
}

export async function POST(
  request: Request,
  { params }: Context,
): Promise<Response> {
  const auth = await requireAdmin();

  if (!auth.ok) {
    return auth.response;
  }

  const json = await parseJsonBody(request);

  if (!json.ok) {
    return json.response;
  }

  const input = parseAutofillRequest(json.data);

  if (!input) {
    const response = {
      ok: false,
      error: {
        code: "INVALID_INPUT",
        message: "A valid autofill scope and strategy are required.",
      },
    } satisfies AutofillScheduleResponse;

    return Response.json(response, { status: 400 });
  }

  const { id } = await params;

  try {
    const result = await autofillSchedule({
      periodId: id,
      scope: input.scope,
      strategy: input.strategy,
    });

    if (!result.ok) {
      const response = {
        ok: false,
        error: {
          code: result.error.code,
          message: result.error.message,
        },
      } satisfies AutofillScheduleResponse;

      return Response.json(response, {
        status: errorStatuses[result.error.code],
      });
    }

    const response = {
      ok: true,
      data: {
        result: result.data,
      },
    } satisfies AutofillScheduleResponse;

    return Response.json(response, { status: 200 });
  } catch (error) {
    console.error("Failed to autofill schedule:", error);

    const response = {
      ok: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to autofill schedule.",
      },
    } satisfies AutofillScheduleResponse;

    return Response.json(response, { status: 500 });
  }
}
