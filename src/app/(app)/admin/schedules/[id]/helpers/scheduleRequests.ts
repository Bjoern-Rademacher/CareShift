import type {
  AssignEmployeeResponse,
  GetAssignmentCandidatesResponse,
} from "@/types/assignment";
import type { AutofillResult, AutofillStrategy } from "@/types/autofill";
import type { UUID } from "@/types/common";
import type {
  ClearScheduleApiResponse,
  ReopenScheduleResponse,
  ScheduleAction,
  ScheduleActionResponse,
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
    throw new Error(
      !result.ok ? result.error.message : "Assignment failed.",
    );
  }

  return result;
}

export async function scheduleActionRequest(
  periodId: UUID,
  action: ScheduleAction,
): Promise<ScheduleActionResponse> {
  const response = await fetch(`/api/periods/${periodId}/publish`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action }),
  });

  const data = (await response.json()) as ScheduleActionResponse;

  if (response.status === 409) {
    return data;
  }

  if (!response.ok) {
    throw new Error("error" in data ? data.error : "Schedule action failed.");
  }

  return data;
}

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

  const data = (await response.json()) as {
    result?: AutofillResult;
    error?: string;
  };

  if (!response.ok || !data.result) {
    throw new Error(data.error ?? "Could not autofill schedule.");
  }

  return data.result;
}

export async function returnScheduleToDraftRequest(
  periodId: UUID,
): Promise<void> {
  const response = await fetch(`/api/periods/${periodId}/reopen`, {
    method: "POST",
  });

  const result = (await response.json()) as ReopenScheduleResponse;

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  if (!response.ok) {
    throw new Error("Could not return schedule to draft.");
  }
}

export async function clearScheduleAssignmentsRequest(
  periodId: UUID,
): Promise<ClearScheduleApiResponse> {
  const response = await fetch(`/api/periods/${periodId}/clear-assignments`, {
    method: "POST",
  });

  return (await response.json()) as ClearScheduleApiResponse;
}
