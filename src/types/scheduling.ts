import type { ApiResponse } from "@/types/api";
import type {
  Departments,
  EmployeePosition,
  ISODateString,
  LocalTimeString,
  UUID,
  Weekday,
} from "@/types/common";

// Scheduling models — dates and times are serialized strings.

export type PeriodStatus = "DRAFT" | "VALIDATED" | "PUBLISHED";

export interface TemplateRule {
  id: UUID;
  department: Departments;
  position: EmployeePosition;
  weekdays: Weekday[];
  startTimeLocal: LocalTimeString;
  endTimeLocal: LocalTimeString;
  slots: number;
  active: boolean;
}

export interface SchedulePeriod {
  id: UUID;
  department: Departments;
  startDate: ISODateString;
  endDate: ISODateString;
  status: PeriodStatus;
}

export interface ShiftSlot {
  id: UUID;
  periodId: UUID;
  employeeId: UUID | null;
  department: Departments;
  position: EmployeePosition;
  slotNumber: number;
  startTime: ISODateString;
  endTime: ISODateString;
}

// Database and server-side views — dates remain Date objects.

export type DbShiftSlot = {
  id: string;
  periodId: string;
  employeeId: string | null;
  department: Departments;
  position: EmployeePosition;
  slotNumber: number;
  startTime: Date;
  endTime: Date;
};

export type SchedulePeriodOverview = {
  id: UUID;
  department: Departments;
  startDate: Date;
  endDate: Date;
  status: PeriodStatus;
};

// Admin overview data.

export type AdminScheduleWeek = {
  startDate: Date;
  endDate: Date;
};

export type AdminSchedulesData = {
  weeks: AdminScheduleWeek[];
  periods: SchedulePeriodOverview[];
};

// Employee overview data.

export type EmployeeScheduleOverview = {
  period: SchedulePeriod;
  shiftSlots: ShiftSlot[];
};

export type EmployeeSchedulesData = {
  currentSchedules: EmployeeScheduleOverview[];
  pastSchedules: EmployeeScheduleOverview[];
};

// Inputs consumed by schedule validation.

export type ValidatablePeriod = {
  id: string;
  department: Departments;
  startDate: Date;
  endDate: Date;
  published: boolean;
};

export type ValidatableShiftSlot = {
  id: string;
  periodId: string;
  employeeId: string | null;
  department: Departments;
  position: EmployeePosition;
  startTime: Date;
  endTime: Date;
};

// Validation results and individual failures.

export type ScheduleValidationResult = {
  noOverlaps: boolean;
  sufficientRest: boolean;
  weeklyHoursValid: boolean;
  rollingSevenDayHoursValid: boolean;
};

export type scheduleValidationErrorCode =
  | "MISSING_ASSIGNMENT"
  | "DOUBLE_ASSIGNMENT"
  | "INSUFFICIENT_REST"
  | "WEEKLY_HOURS_EXCEEDED";

export type scheduleValidationError = {
  code: scheduleValidationErrorCode;
  message: string;
};

export type schedulePublishError = string;

export type AssignmentValidationError = {
  code:
    | "SHIFT_OVERLAP"
    | "INSUFFICIENT_REST"
    | "WEEKLY_HOURS_EXCEEDED"
    | "NO_SLOT_SELECTED";
  message: string;
};

// Schedule creation — shared API response contract.

export type CreateScheduleInput = {
  department: Departments;
  weekStartDate: string;
};

export type CreateScheduleErrorCode = "SCHEDULE_ALREADY_EXISTS";

export type CreateScheduleErrorDetails = {
  scheduleId: UUID;
};

export type CreateScheduleResponse = ApiResponse<
  {
    schedule: {
      id: UUID;
    };
  },
  CreateScheduleErrorCode,
  CreateScheduleErrorDetails
>;

// Clear assignments — shared API response contract.

export type ClearScheduleApiResponse = ApiResponse<
  { clearedCount: number },
  "SCHEDULE_NOT_FOUND" | "SCHEDULE_NOT_DRAFT"
>;

export type ReopenScheduleResponse = ApiResponse<
  {
    schedule: {
      id: UUID;
      status: "DRAFT";
    };
  },
  "SCHEDULE_NOT_FOUND" | "SCHEDULE_ALREADY_DRAFT"
>;

// Api response types

export type GetSchedulePeriodsResponse = ApiResponse<{
  periods: SchedulePeriod[];
}>;

export type ClearScheduleAssignmentsResponse = ApiResponse<
  {
    clearedCount: number;
  },
  "SCHEDULE_NOT_FOUND" | "SCHEDULE_NOT_DRAFT"
>;

export type ValidateScheduleResponse = ApiResponse<
  {
    period: SchedulePeriod;
  },
  | "SCHEDULE_NOT_FOUND"
  | "SCHEDULE_ALREADY_PUBLISHED"
  | "SCHEDULE_VALIDATION_FAILED"
>;

export type PublishScheduleResponse = ApiResponse<
  {
    period: SchedulePeriod;
  },
  | "SCHEDULE_NOT_FOUND"
  | "SCHEDULE_NOT_VALIDATED"
  | "SCHEDULE_ALREADY_PUBLISHED"
  | "SCHEDULE_VALIDATION_FAILED"
>;
