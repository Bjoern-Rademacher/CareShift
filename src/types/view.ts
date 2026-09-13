import { Weekday } from "./common";

export type ShiftGroup = "MORNING" | "EVENING" | "NIGHT";

export type AssignmentFilter = "ALL" | "ASSIGNED" | "UNASSIGNED";

export type ScheduleView = "TIMELINE" | "WEEK_GRID" | "EMPLOYEES";

export type ScheduleFilters = {
  weekdays: Weekday[];
  shiftGroups: ShiftGroup[];
  assignment: AssignmentFilter;
};
