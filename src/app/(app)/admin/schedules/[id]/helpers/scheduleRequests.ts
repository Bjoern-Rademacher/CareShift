import type { EmployeeAssignmentCandidate } from "@/types/assignment";
import type { AutofillResult, AutofillStrategy } from "@/types/autofill";
import type { UUID } from "@/types/common";
import type {
  AssignmentValidationError,
  ScheduleAction,
  ScheduleActionResponse,
  ReopenScheduleResponse,
} from "@/types/scheduling";

export type AssignEmployeeResponse =
  | {
      ok: true;
      assigned: {
        slotId: UUID;
        employeeId: UUID;
      };
    }
  | {
      ok: false;
      errors: AssignmentValidationError[];
    };

type ErrorResponse = {
  error?: string;
};

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

  const data = (await response.json()) as
    | AssignEmployeeResponse
    | ErrorResponse;

  if (response.status === 409) {
    return data as AssignEmployeeResponse;
  }

  if (!response.ok) {
    throw new Error(
      "error" in data && data.error ? data.error : "Assignment failed.",
    );
  }

  return data as AssignEmployeeResponse;
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
): Promise<EmployeeAssignmentCandidate[]> {
  const response = await fetch(
    `/api/shift-slots/${slotId}/assignment-candidates`,
    {
      method: "GET",
      cache: "no-store",
      signal,
    },
  );

  const data = (await response.json()) as {
    candidates?: EmployeeAssignmentCandidate[];
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error ?? "Could not load assignment candidates.");
  }

  return data.candidates ?? [];
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

  if (!response.ok || !result.ok) {
    throw new Error(
      result.ok ? "Could not return schedule to draft." : result.error,
    );
  }
}
