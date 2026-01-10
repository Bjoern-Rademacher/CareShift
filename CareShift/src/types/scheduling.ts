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
  startTime: ISODateString;
  endTime: ISODateString;
}

export interface SchedulePeriod {
  id: UUID;
  department: Departments;
  startDate: ISODateString;
  endDate: ISODateString;
  status: "draft" | "published" | "needsRepublish";
}
