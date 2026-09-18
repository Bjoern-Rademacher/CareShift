import type {
  AssignEmployeeResponse,
  GetAssignmentCandidatesResponse,
} from "@/types/assignment";
import type {
  AutofillResult,
  AutofillScheduleResponse,
  AutofillStrategy,
} from "@/types/autofill";
import type { UUID } from "@/types/common";
import type {
  ClearScheduleApiResponse,
  ReopenScheduleResponse,
} from "@/types/scheduling";

export async function assignEmployeeRequest(
  slotId: UUID,
  employeeId: UUID,
): Promise<AssignEmployeeResponse> {
  const response = await fetch(`/api/shift-slots/${slotId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ employeeId }),
  });

  const result = (await response.json()) as AssignEmployeeResponse;

  if (response.status >= 500) {
    throw new Error(!result.ok ? result.error.message : "Assignment failed.");
  }

  return result;
}

// export async function scheduleActionRequest(
//   periodId: UUID,
//   action: ScheduleAction,
// ): Promise<ScheduleActionResponse> {
//   const response = await fetch(`/api/periods/${periodId}/publish`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ action }),
//   });

//   const data: unknown = await response.json();

//   if (!isScheduleActionResponse(data)) {
//     throw new Error("Invalid schedule action response.");
//   }

//   if (response.status >= 500) {
//     throw new Error(
//       data.ok ? "Schedule action failed." : data.error.message,
//     );
//   }

//   if (!response.ok || !data.ok) {
//     if (!data.ok && response.status >= 400 && response.status < 500) {
//       return data;
//     }

//     throw new Error("Invalid schedule action response.");
//   }

//   return data;
// }

export async function getAssignmentCandidatesRequest(
  slotId: UUID,
  signal?: AbortSignal,
): Promise<GetAssignmentCandidatesResponse> {
  const response = await fetch(
    `/api/shift-slots/${slotId}/assignment-candidates`,
    {
      method: "GET",
      cache: "no-store",
      signal,
    },
  );

  return (await response.json()) as GetAssignmentCandidatesResponse;
}

export async function autofillScheduleRequest(
  periodId: UUID,
  strategy: AutofillStrategy,
): Promise<AutofillResult> {
  const response = await fetch(`/api/periods/${periodId}/autofill`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      scope: {
        type: "ALL_OPEN",
      },
      strategy,
    }),
  });

  const result = (await response.json()) as AutofillScheduleResponse;

  if (!response.ok || !result.ok) {
    throw new Error(
      result.ok ? "Could not autofill schedule." : result.error.message,
    );
  }

  return result.data.result;
}

export async function returnScheduleToDraftRequest(
  periodId: UUID,
): Promise<ReopenScheduleResponse> {
  const response = await fetch(`/api/periods/${periodId}/reopen`, {
    method: "POST",
  });

  const result = (await response.json()) as ReopenScheduleResponse;

  if (response.status >= 500) {
    throw new Error(
      result.ok ? "Could not return schedule to draft." : result.error.message,
    );
  }

  return result;
}

export async function clearScheduleAssignmentsRequest(
  periodId: UUID,
): Promise<ClearScheduleApiResponse> {
  const response = await fetch(`/api/periods/${periodId}/clear-assignments`, {
    method: "POST",
  });

  return (await response.json()) as ClearScheduleApiResponse;
}
