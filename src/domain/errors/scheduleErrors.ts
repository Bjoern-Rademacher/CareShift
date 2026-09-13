export type ScheduleErrorCode = "SCHEDULE_ALREADY_EXISTS";

export const SCHEDULE_ERRORS = {
  SCHEDULE_ALREADY_EXISTS: "SCHEDULE_ALREADY_EXISTS",
} as const;

export const scheduleErrorMessages = {
  SCHEDULE_ALREADY_EXISTS:
    "A schedule already exists for this department and week.",
} as const;
