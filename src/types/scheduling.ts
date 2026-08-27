import type {
  Departments,
  EmployeePosition,
  ISODateString,
  LocalTimeString,
  UUID,
  Weekday,
} from "@/types/common";

import type { ApiResponse } from "@/types/api";
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

export type PeriodStatus = "DRAFT" | "VALIDATED" | "PUBLISHED";

export interface SchedulePeriod {
  id: UUID;
  department: Departments;
  startDate: ISODateString;
  endDate: ISODateString;
  status: PeriodStatus;
}

export type SchedulePeriodOverview = {
  id: UUID;
  department: Departments;
  startDate: Date;
  endDate: Date;
  status: PeriodStatus;
};

export type AdminScheduleWeek = {
  startDate: Date;
  endDate: Date;
};

export type AdminSchedulesData = {
  weeks: AdminScheduleWeek[];
  periods: SchedulePeriodOverview[];
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

export type ScheduleValidationResult = {
  noOverlaps: boolean;
  sufficientRest: boolean;
  weeklyHoursValid: boolean;
  rollingSevenDayHoursValid: boolean;
};

export type ScheduleAction = "VALIDATE" | "PUBLISH";

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
      errors: scheduleValidationError[];
    }
  | {
      ok: false;
      error: string;
    };

export type AssignmentValidationError = {
  code:
    | "SHIFT_OVERLAP"
    | "INSUFFICIENT_REST"
    | "WEEKLY_HOURS_EXCEEDED"
    | "NO_SLOT_SELECTED";
  message: string;
};

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

export type EmployeeScheduleOverview = {
  period: SchedulePeriod;
  shiftSlots: ShiftSlot[];
};

export type EmployeeSchedulesData = {
  currentSchedules: EmployeeScheduleOverview[];
  pastSchedules: EmployeeScheduleOverview[];
};

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
