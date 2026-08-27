import * as ui from "@/ui/classes";

import { SHIFT_GROUPS, WEEKDAYS } from "@/lib/constants/schedule";

import type {
  AssignmentFilter,
  ScheduleFilters,
  ScheduleView,
  ShiftGroup,
} from "@/types/view";
import type { Weekday } from "@/types/common";

type Props = {
  activeView: ScheduleView;
  filters: ScheduleFilters;
  onViewChange: (view: ScheduleView) => void;
  onFiltersChange: (filters: ScheduleFilters) => void;
};

const VIEW_OPTIONS: Array<{
  value: ScheduleView;
  label: string;
  icon: string;
}> = [
  {
    value: "TIMELINE",
    label: "Timeline",
    icon: "☷",
  },
  {
    value: "WEEK_GRID",
    label: "Week Grid",
    icon: "▦",
  },
  {
    value: "EMPLOYEES",
    label: "Employees",
    icon: "♙",
  },
];

const DAY_OPTIONS: Array<{
  value: "ALL" | Weekday;
  label: string;
}> = [
  { value: "ALL", label: "All days" },
  { value: "MON", label: "Monday" },
  { value: "TUE", label: "Tuesday" },
  { value: "WED", label: "Wednesday" },
  { value: "THU", label: "Thursday" },
  { value: "FRI", label: "Friday" },
  { value: "SAT", label: "Saturday" },
  { value: "SUN", label: "Sunday" },
];

const SHIFT_OPTIONS: Array<{
  value: "ALL" | ShiftGroup;
  label: string;
}> = [
  { value: "ALL", label: "All shifts" },
  { value: "MORNING", label: "Morning" },
  { value: "EVENING", label: "Evening" },
  { value: "NIGHT", label: "Night" },
];

const ASSIGNMENT_OPTIONS: Array<{
  value: AssignmentFilter;
  label: string;
}> = [
  { value: "ALL", label: "All assignments" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "UNASSIGNED", label: "Unassigned" },
];

export default function ScheduleControls({
  activeView,
  filters,
  onViewChange,
  onFiltersChange,
}: Props) {
  const selectedDay =
    filters.weekdays.length === WEEKDAYS.length ? "ALL" : filters.weekdays[0];

  const selectedShift =
    filters.shiftGroups.length === SHIFT_GROUPS.length
      ? "ALL"
      : filters.shiftGroups[0];

  function handleDayChange(value: "ALL" | Weekday) {
    onFiltersChange({
      ...filters,
      weekdays: value === "ALL" ? [...WEEKDAYS] : [value],
    });
  }

  function handleShiftChange(value: "ALL" | ShiftGroup) {
    onFiltersChange({
      ...filters,
      shiftGroups: value === "ALL" ? [...SHIFT_GROUPS] : [value],
    });
  }

  function handleAssignmentChange(value: AssignmentFilter) {
    onFiltersChange({
      ...filters,
      assignment: value,
    });
  }

  return (
    <section className="rounded-card border border-border bg-surface px-4 py-3 shadow-card">
      <div className="flex flex-wrap items-center gap-4">
        <nav
          aria-label="Schedule view"
          className="inline-flex overflow-hidden rounded-control border border-border bg-surface-muted"
        >
          {VIEW_OPTIONS.map((option) => {
            const isActive = activeView === option.value;

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => onViewChange(option.value)}
                className={
                  isActive
                    ? "inline-flex items-center gap-2 bg-selected px-4 py-2 text-sm font-medium text-selected-foreground"
                    : "inline-flex items-center gap-2 border-l border-border px-4 py-2 text-sm font-medium text-foreground-muted transition-colors duration-fast first:border-l-0 hover:bg-surface-hover hover:text-foreground"
                }
              >
                <span aria-hidden="true">{option.icon}</span>

                {option.label}
              </button>
            );
          })}
        </nav>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <label>
            <span className="sr-only">Filter by day</span>

            <select
              className={`${ui.select} min-w-32`}
              value={selectedDay}
              onChange={(event) =>
                handleDayChange(event.target.value as "ALL" | Weekday)
              }
            >
              {DAY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="sr-only">Filter by shift</span>

            <select
              className={`${ui.select} min-w-32`}
              value={selectedShift}
              onChange={(event) =>
                handleShiftChange(event.target.value as "ALL" | ShiftGroup)
              }
            >
              {SHIFT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="sr-only">Filter by assignment status</span>

            <select
              className={`${ui.select} min-w-32`}
              value={filters.assignment}
              onChange={(event) =>
                handleAssignmentChange(event.target.value as AssignmentFilter)
              }
            >
              {ASSIGNMENT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </section>
  );
}
