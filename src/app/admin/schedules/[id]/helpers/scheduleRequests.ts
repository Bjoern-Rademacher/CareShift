import type { UUID } from "@/types/common";
import type {
  AssignmentValidationError,
  PublishValidationError,
  SchedulePeriod,
} from "@/types/scheduling";
import type { EmployeeAssignmentCandidate } from "@/types/assignment";

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

export type ScheduleActionResponse =
  | {
      ok: true;
      action: "VALIDATE";
    }
  | {
      ok: true;
      action: "PUBLISH";
      period: SchedulePeriod;
    }
  | {
      ok: false;
      errors: PublishValidationError[];
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

  const data = await response.json();

  if (response.status === 409) {
    return data;
  }

  if (!response.ok) {
    throw new Error(data.error ?? "Assignment failed.");
  }

  return data;
}

export async function scheduleActionRequest(
  periodId: UUID,
  action: "VALIDATE" | "PUBLISH",
): Promise<ScheduleActionResponse> {
  const response = await fetch(`/api/periods/${periodId}/publish`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action }),
  });

  const data = await response.json();

  if (response.status === 409) {
    return data;
  }

  if (!response.ok) {
    throw new Error(data.error ?? "Schedule action failed.");
  }

  return data;
}

export async function getAssignmentCandidatesRequest(
  slotId: UUID,
): Promise<EmployeeAssignmentCandidate[]> {
  const response = await fetch(
    `/api/shift-slots/${slotId}/assignment-candidates`,
    {
      method: "GET",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? "Could not load assignment candidates.");
  }

  return data.candidates;
}
