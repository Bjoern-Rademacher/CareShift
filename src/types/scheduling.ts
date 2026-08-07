import {
  UUID,
  Departments,
  EmployeePosition,
  Weekday,
  ISODateString,
  LocalTimeString,
} from "@/types/common";

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
export interface SchedulePeriod {
  id: UUID;
  department: Departments;
  startDate: ISODateString;
  endDate: ISODateString;
  published: boolean;
}

export type PublishValidationErrorCode =
  | "MISSING_ASSIGNMENT"
  | "DOUBLE_ASSIGNMENT"
  | "INSUFFICIENT_REST"
  | "WEEKLY_HOURS_EXCEEDED";

export type PublishValidationError = {
  code: PublishValidationErrorCode;
  message: string;
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
