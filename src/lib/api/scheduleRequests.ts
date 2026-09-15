import type { UUID } from "@/types/common";

import type { ValidateScheduleResponse } from "@/types/scheduling";
import type { PublishScheduleResponse } from "@/types/scheduling";

export async function validateScheduleRequest(
  periodId: UUID,
): Promise<ValidateScheduleResponse> {
  const response = await fetch(`/api/periods/${periodId}/validate`, {
    method: "POST",
  });

  let result: ValidateScheduleResponse;

  try {
    result = (await response.json()) as ValidateScheduleResponse;
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (response.status >= 500) {
    throw new Error(
      result.ok ? "Schedule validation failed." : result.error.message,
    );
  }

  return result;
}

export async function publishScheduleRequest(
  periodId: UUID,
): Promise<PublishScheduleResponse> {
  const response = await fetch(`/api/periods/${periodId}/publish`, {
    method: "POST",
  });

  let result: PublishScheduleResponse;

  try {
    result = (await response.json()) as PublishScheduleResponse;
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (response.status >= 500) {
    throw new Error(
      result.ok ? "Schedule publishing failed." : result.error.message,
    );
  }

  return result;
}
