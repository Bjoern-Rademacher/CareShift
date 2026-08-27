import * as ui from "@/ui/classes";
import * as util from "@/ui/utilities";

import { createWeekGridRows } from "@/app/(app)/admin/schedules/[id]/helpers/weekGrid";

import { SHIFT_GROUPS, WEEKDAYS } from "@/lib/constants/schedule";
import {
  getEarliestStartingSlot,
  SHIFT_GROUP_DETAILS,
  WEEKDAY_LABELS,
} from "@/lib/constants/scheduleDisplay";

import { formatDayMonth, formatTimeRange } from "@/lib/functions/dateTimeUtils";
import { getPositionLabel } from "@/lib/functions/employeePositions";

import type { WeekGridRow } from "@/app/(app)/admin/schedules/[id]/helpers/weekGrid";
import type { UUID, Weekday } from "@/types/common";
import type { AssignableEmployee, ScheduleEmployee } from "@/types/employee";
import type { ShiftSlot } from "@/types/scheduling";
import type { ShiftGroup } from "@/types/view";

type SharedProps = {
  shiftSlots: ShiftSlot[];
  employees: AssignableEmployee[] | ScheduleEmployee[];
};

type Props =
  | (SharedProps & {
      canAssign: true;
      assignmentDisabled: boolean;
      onAssignClick: (slotId: UUID) => void;
    })
  | (SharedProps & {
      canAssign: false;
      assignmentDisabled?: never;
      onAssignClick?: never;
    });

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

function getShiftGroupTime(rows: WeekGridRow[]): string | null {
  const shiftSlots = rows.flatMap((row) =>
    Object.values(row.slots).filter(
      (slot): slot is ShiftSlot => slot !== undefined,
    ),
  );

  const representativeSlot = getEarliestStartingSlot(shiftSlots);

  if (!representativeSlot) {
    return null;
  }

  return formatTimeRange(
    new Date(representativeSlot.startTime),
    new Date(representativeSlot.endTime),
  );
}

function getPositionCount(rows: WeekGridRow[], row: WeekGridRow): number {
  return rows.filter(
    (candidate) =>
      candidate.shiftGroup === row.shiftGroup &&
      candidate.position === row.position,
  ).length;
}

export default function WeekGrid(props: Props) {
  const { shiftSlots, employees } = props;

  const rows = createWeekGridRows(shiftSlots);
  const weekdayDates = getWeekdayDates(shiftSlots);

  const employeesById = new Map(
    employees.map((employee) => [employee.id, employee]),
  );

  if (rows.length === 0) {
    return (
      <div
        className="
          rounded-card border border-border
          bg-surface-muted p-8 text-center
        "
      >
        <p className={ui.bodyMuted}>No shifts match the current filters.</p>
      </div>
    );
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
        const shiftTime = getShiftGroupTime(groupRows);

        return (
          <article
            key={shiftGroup}
            className="
              overflow-hidden rounded-card border
              border-border/70 bg-surface shadow-card
            "
          >
            <header
              className="
                border-b border-border
                bg-surface-muted px-4 py-3
              "
            >
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={`text-lg ${shiftDetails.textClass}`}
                >
                  {shiftDetails.symbol}
                </span>

                <div>
                  <h2 className={`font-semibold ${shiftDetails.textClass}`}>
                    {shiftDetails.label}
                  </h2>

                  {shiftTime && (
                    <p className="text-xs text-foreground-muted">{shiftTime}</p>
                  )}
                </div>
              </div>
            </header>

            <div className={util.scrollbarContainer}>
              <table className={`${ui.table} ${util.tableContainer}`}>
                <thead>
                  <tr className="bg-surface">
                    <th
                      className={`
                        ${ui.th}
                        ${util.stickyFirstColumnHeader}
                        bg-surface-muted text-left
                      `}
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
                          className={`${ui.th} w-40 bg-surface text-center`}
                        >
                          <span
                            className={
                              isSunday
                                ? "block font-semibold text-danger"
                                : isSaturday
                                  ? "block font-semibold text-warning"
                                  : "block font-semibold text-foreground"
                            }
                          >
                            {WEEKDAY_LABELS[weekday]}
                          </span>

                          {date && (
                            <span
                              className={
                                isSunday
                                  ? `
                                    mt-0.5 block text-xs
                                    font-normal text-danger/80
                                  `
                                  : isSaturday
                                    ? `
                                      mt-0.5 block text-xs
                                      font-normal text-warning/80
                                    `
                                    : `
                                      mt-0.5 block text-xs font-normal
                                      text-foreground-muted
                                    `
                              }
                            >
                              {formatDayMonth(new Date(date))}
                            </span>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody>
                  {groupRows.map((row) => {
                    const positionLabel = getPositionLabel(row.position);
                    const positionCount = getPositionCount(groupRows, row);

                    return (
                      <tr
                        key={row.key}
                        className="
                          transition-colors duration-fast
                          hover:bg-surface-hover
                        "
                      >
                        <th
                          className={`
                            ${ui.td}
                            ${util.stickyFirstColumn}
                            bg-surface-muted text-left
                          `}
                        >
                          <div
                            className="
                              flex min-h-14 items-center
                              justify-between gap-2
                            "
                          >
                            <p className="text-xs font-medium text-foreground">
                              {positionLabel} #{row.slotNumber}
                            </p>

                            <span
                              className="
                                flex shrink-0 items-center gap-1
                                text-xs text-foreground-muted
                              "
                              title={`${positionCount} ${positionLabel} slots in this shift`}
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
                                className={`${ui.td} bg-surface align-middle`}
                              >
                                <span className="text-foreground-subtle">
                                  —
                                </span>
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
                            <td
                              key={weekday}
                              className={`${ui.td} bg-surface align-top`}
                            >
                              <div
                                className={`
                                  flex min-h-14 flex-col
                                  justify-between gap-1.5
                                  rounded-control p-2
                                  transition-colors duration-fast
                                  hover:bg-surface-hover
                                  ${employee ? "" : "border-l-2 border-warning"}
                                `}
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
                                      title={employeeName}
                                      className={
                                        employee
                                          ? `
                                            truncate text-sm font-semibold
                                            text-foreground
                                          `
                                          : `
                                            truncate text-sm font-semibold
                                            text-warning
                                          `
                                      }
                                    >
                                      {employeeName}
                                    </p>
                                  </div>

                                  <p
                                    className="
                                      mt-0.5 text-xs
                                      text-foreground-muted
                                    "
                                  >
                                    {formatTimeRange(
                                      new Date(slot.startTime),
                                      new Date(slot.endTime),
                                    )}
                                  </p>
                                </div>

                                {props.canAssign && (
                                  <button
                                    type="button"
                                    className={`
                                      ${
                                        employee
                                          ? util.reassignButton
                                          : util.assignButton
                                      }
                                      disabled:cursor-wait
                                      disabled:opacity-60
                                    `}
                                    disabled={props.assignmentDisabled}
                                    onClick={() => props.onAssignClick(slot.id)}
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
