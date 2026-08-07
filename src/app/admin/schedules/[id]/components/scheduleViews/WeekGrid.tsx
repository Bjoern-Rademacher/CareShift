import * as ui from "@/ui/classes";
import * as util from "@/ui/utilities";

import { createWeekGridRows } from "@/app/admin/schedules/[id]/helpers/weekGrid";

import { formatTimeOnly } from "@/lib/functions/dateTimeUtils";

import { WEEKDAYS } from "@/lib/constants/schedule";

import type { AssignableEmployee } from "@/types/employee";
import type { ShiftSlot } from "@/types/scheduling";
import type { UUID, Weekday } from "@/types/common";
import { ShiftGroup } from "@/types/view";
import type { WeekGridRow } from "@/app/admin/schedules/[id]/helpers/weekGrid";

type Props = {
  shiftSlots: ShiftSlot[];
  employees: AssignableEmployee[];
  canAssign: boolean;
  onAssignClick: (slotId: UUID) => void;
};

const WEEKDAY_LABELS: Record<Weekday, string> = {
  MON: "Mon",
  TUE: "Tue",
  WED: "Wed",
  THU: "Thu",
  FRI: "Fri",
  SAT: "Sat",
  SUN: "Sun",
};

const SHIFT_GROUP_DETAILS: Record<
  ShiftGroup,
  {
    label: string;
    icon: string;
  }
> = {
  MORNING: {
    label: "Morning",
    icon: "☀",
  },
  EVENING: {
    label: "Evening",
    icon: "☼",
  },
  NIGHT: {
    label: "Night",
    icon: "☾",
  },
};

const SHIFT_GROUPS: ShiftGroup[] = ["MORNING", "EVENING", "NIGHT"];

function formatPosition(position: ShiftSlot["position"]): string {
  return position
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDayOfMonth(value: string): string {
  const date = new Date(value);

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

function getWeekdayDates(
  shiftSlots: ShiftSlot[],
): Partial<Record<Weekday, string>> {
  const dates: Partial<Record<Weekday, string>> = {};

  for (const slot of shiftSlots) {
    const date = new Date(slot.startTime);
    const weekday = WEEKDAYS[(date.getUTCDay() + 6) % 7];

    dates[weekday] ??= slot.startTime;
  }

  return dates;
}

function getShiftGroupTime(row: WeekGridRow): string | null {
  const firstSlot = WEEKDAYS.map((weekday) => row.slots[weekday]).find(Boolean);

  if (!firstSlot) {
    return null;
  }

  return `${formatTimeOnly(new Date(firstSlot.startTime))} – ${formatTimeOnly(
    new Date(firstSlot.endTime),
  )}`;
}

function getPositionCount(rows: WeekGridRow[], row: WeekGridRow): number {
  return rows.filter(
    (candidate) =>
      candidate.shiftGroup === row.shiftGroup &&
      candidate.position === row.position,
  ).length;
}

function getShiftGroupTextClass(shiftGroup: ShiftGroup): string {
  if (shiftGroup === "NIGHT") {
    return "text-sky-300";
  }

  if (shiftGroup === "EVENING") {
    return "text-orange-400";
  }

  return "text-amber-300";
}

export default function WeekGrid({
  shiftSlots,
  employees,
  canAssign,
  onAssignClick,
}: Props) {
  const rows = createWeekGridRows(shiftSlots);
  const weekdayDates = getWeekdayDates(shiftSlots);

  const employeesById = new Map(
    employees.map((employee) => [employee.id, employee]),
  );

  if (rows.length === 0) {
    return <p>No shifts match the current filters.</p>;
  }

  const rowsByShiftGroup: Record<ShiftGroup, WeekGridRow[]> = {
    MORNING: rows.filter((row) => row.shiftGroup === "MORNING"),
    EVENING: rows.filter((row) => row.shiftGroup === "EVENING"),
    NIGHT: rows.filter((row) => row.shiftGroup === "NIGHT"),
  };

  return (
    <section className="space-y-6">
      {SHIFT_GROUPS.map((shiftGroup) => {
        const groupRows = rowsByShiftGroup[shiftGroup];

        if (groupRows.length === 0) {
          return null;
        }

        const shiftDetails = SHIFT_GROUP_DETAILS[shiftGroup];
        const shiftTime = getShiftGroupTime(groupRows[0]);
        const shiftGroupTextClass = getShiftGroupTextClass(shiftGroup);

        return (
          <article key={shiftGroup} className={ui.card}>
            <header className={`${util.sectionHeader} px-4 py-3`}>
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={`text-lg ${shiftGroupTextClass}`}
                >
                  {shiftDetails.icon}
                </span>

                <div>
                  <h2 className={`font-semibold ${shiftGroupTextClass}`}>
                    {shiftDetails.label}
                  </h2>

                  {shiftTime && (
                    <p className="text-xs text-slate-400">{shiftTime}</p>
                  )}
                </div>
              </div>
            </header>

            <div className={util.scrollbarContainer}>
              <table className={`${ui.table} ${util.tableContainer}`}>
                <thead>
                  <tr>
                    <th
                      className={`${ui.th} ${util.stickyFirstColumnHeader} text-left`}
                    >
                      Position
                    </th>

                    {WEEKDAYS.map((weekday) => {
                      const isSaturday = weekday === "SAT";
                      const isSunday = weekday === "SUN";
                      const date = weekdayDates[weekday];

                      return (
                        <th
                          key={weekday}
                          className={`${ui.th} w-40 text-center`}
                        >
                          <span
                            className={
                              isSunday
                                ? "block font-semibold text-red-400"
                                : isSaturday
                                  ? "block font-semibold text-amber-300"
                                  : "block font-semibold"
                            }
                          >
                            {WEEKDAY_LABELS[weekday]}
                          </span>

                          {date && (
                            <span
                              className={
                                isSunday
                                  ? "mt-0.5 block text-xs font-normal text-red-400/80"
                                  : isSaturday
                                    ? "mt-0.5 block text-xs font-normal text-amber-300/80"
                                    : "mt-0.5 block text-xs font-normal text-slate-400"
                              }
                            >
                              {formatDayOfMonth(date)}
                            </span>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody>
                  {groupRows.map((row) => {
                    const positionCount = getPositionCount(groupRows, row);

                    return (
                      <tr key={row.key} className={ui.rowHover}>
                        <th
                          className={`${ui.td} ${util.stickyFirstColumn} text-left`}
                        >
                          <div className="flex min-h-14 items-center justify-between gap-1">
                            <p className="text-xs font-medium">
                              {formatPosition(row.position)} #{row.slotNumber}
                            </p>

                            <span
                              className="flex shrink-0 items-center gap-1 text-xs text-slate-400"
                              title={`${positionCount} ${formatPosition(
                                row.position,
                              )} slots in this shift`}
                            >
                              <span aria-hidden="true">♙</span>
                              {positionCount}
                            </span>
                          </div>
                        </th>

                        {WEEKDAYS.map((weekday) => {
                          const slot = row.slots[weekday];

                          if (!slot) {
                            return (
                              <td
                                key={weekday}
                                className={`${ui.td} align-middle`}
                              >
                                <span className="text-slate-600">—</span>
                              </td>
                            );
                          }

                          const employee = slot.employeeId
                            ? employeesById.get(slot.employeeId)
                            : undefined;

                          const employeeName = employee
                            ? `${employee.firstName} ${employee.lastName}`
                            : "Unassigned";

                          return (
                            <td key={weekday} className={`${ui.td} align-top`}>
                              <div
                                className={
                                  employee
                                    ? "flex min-h-14 flex-col justify-between gap-1.5"
                                    : "flex min-h-14 flex-col justify-between gap-1.5 border-l-2 border-amber-400 pl-2"
                                }
                              >
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      aria-hidden="true"
                                      className={
                                        employee
                                          ? util.employeeIndicator
                                          : util.unassignedIndicator
                                      }
                                    />

                                    <p
                                      className={
                                        employee
                                          ? "truncate text-sm font-medium text-slate-100"
                                          : "truncate text-sm font-medium text-amber-300"
                                      }
                                      title={employeeName}
                                    >
                                      {employeeName}
                                    </p>
                                  </div>

                                  <p className="mt-0.5 text-xs text-slate-400">
                                    {formatTimeOnly(new Date(slot.startTime))} –{" "}
                                    {formatTimeOnly(new Date(slot.endTime))}
                                  </p>
                                </div>

                                {canAssign && (
                                  <button
                                    type="button"
                                    className={
                                      employee
                                        ? util.reassignButton
                                        : util.assignButton
                                    }
                                    onClick={() => onAssignClick(slot.id)}
                                  >
                                    {employee ? "Reassign" : "Assign"}
                                  </button>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </article>
        );
      })}
    </section>
  );
}
