import type {
  CreateScheduleResponse,
  CreateScheduleInput,
} from "@/types/scheduling";

export async function createSchedule(
  input: CreateScheduleInput,
): Promise<CreateScheduleResponse> {
  const response = await fetch("/api/admin/schedules/create", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(input),
  });

  const data = (await response.json()) as CreateScheduleResponse;

  return data;
}
