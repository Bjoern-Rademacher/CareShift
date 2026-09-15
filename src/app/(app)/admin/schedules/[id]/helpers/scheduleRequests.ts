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
  ScheduleAction,
  ScheduleActionResponse,
} from "@/types/scheduling";
import { isRecord } from "@/lib/validation/common";

function isScheduleActionErrorCode(value: unknown): value is string {
  return (
    value === "INVALID_JSON" ||
    value === "INVALID_INPUT" ||
    value === "UNAUTHENTICATED" ||
    value === "FORBIDDEN" ||
    value === "NOT_FOUND" ||
    value === "INTERNAL_ERROR" ||
    value === "SCHEDULE_NOT_FOUND" ||
    value === "SCHEDULE_ALREADY_PUBLISHED" ||
    value === "SCHEDULE_NOT_VALIDATED" ||
    value === "SCHEDULE_VALIDATION_FAILED"
  );
}

function isScheduleActionResponse(
  value: unknown,
): value is ScheduleActionResponse {
  if (!isRecord(value)) {
    return false;
  }

  if (value.ok === true) {
    return (
      isRecord(value.data) &&
      (value.data.action === "VALIDATE" || value.data.action === "PUBLISH") &&
      isRecord(value.data.period) &&
      typeof value.data.period.id === "string" &&
      typeof value.data.period.department === "string" &&
      typeof value.data.period.startDate === "string" &&
      typeof value.data.period.endDate === "string" &&
      (value.data.period.status === "DRAFT" ||
        value.data.period.status === "VALIDATED" ||
        value.data.period.status === "PUBLISHED")
    );
  }

  return (
    value.ok === false &&
    isRecord(value.error) &&
    isScheduleActionErrorCode(value.error.code) &&
    typeof value.error.message === "string" &&
    (value.error.issues === undefined ||
      (Array.isArray(value.error.issues) &&
        value.error.issues.every(
          (issue) =>
            isRecord(issue) &&
            typeof issue.code === "string" &&
            typeof issue.message === "string" &&
            (issue.field === undefined || typeof issue.field === "string"),
        )))
  );
}

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

  const data: unknown = await response.json();

  if (!isScheduleActionResponse(data)) {
    throw new Error("Invalid schedule action response.");
  }

  if (response.status >= 500) {
    throw new Error(
      data.ok ? "Schedule action failed." : data.error.message,
    );
  }

  if (!response.ok || !data.ok) {
    if (!data.ok && response.status >= 400 && response.status < 500) {
      return data;
    }

    throw new Error("Invalid schedule action response.");
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
