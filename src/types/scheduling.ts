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
  periodId?: UUID;
  employeeId: UUID | null;
  department: Departments;
  position: EmployeePosition;
  startTime: Date;
  endTime: Date;
}

export type DbShiftSlot = {
  id: string;
  periodId: string;
  employeeId: string | null;
  department: ShiftSlot["department"];
  position: ShiftSlot["position"];
  startTime: Date;
  endTime: Date;
};

export type ShiftSlotDto = {
  id: UUID;
  periodId: UUID;
  employeeId: UUID | null;
  department: Departments;
  position: EmployeePosition;
  startTime: ISODateString;
  endTime: ISODateString;
};

export type ShiftSlotsResponseDto = {
  shiftSlots: ShiftSlotDto[];
};

export interface Schedule {
  id: UUID;
  department: Departments;
  startDate: ISODateString;
  endDate: ISODateString;
  status: "draft" | "published" | "needsRepublish";
}

export interface PeriodsResponse {
  periods: Schedule[];
}

export type ValidationErrorCode = "MISSING_ASSIGNMENT" | "DOUBLE_ASSIGNMENT";

export type ValidationError = {
  code: ValidationErrorCode;
  message: string;
};
