import * as ui from "@/ui/classes";
import * as util from "@/ui/utilities";

import { createEmployeeScheduleGroups } from "@/app/(app)/admin/schedules/[id]/helpers/employeeView";

import { getDepartmentLabel } from "@/lib/functions/departments";
import { formatTimeOnly, formatWeekday } from "@/lib/functions/dateTimeUtils";
import { getPositionLabel } from "@/lib/functions/employeePositions";

import type { UUID } from "@/types/common";
import type { AssignableEmployee } from "@/types/employee";
import type { ShiftSlot } from "@/types/scheduling";

type Props = {
  shiftSlots: ShiftSlot[];
  employees: AssignableEmployee[];
  canAssign: boolean;
  assignmentDisabled: boolean;
  onAssignClick: (slotId: UUID) => void;
};

const CARD_STYLES = [
  "bg-violet-600",
  "bg-sky-600",
  "bg-emerald-600",
  "bg-orange-600",
];

function getInitials(employee: AssignableEmployee): string {
  return `${employee.firstName.charAt(0)}${employee.lastName.charAt(
    0,
  )}`.toUpperCase();
}

function sortSlotsByStartTime(shiftSlots: ShiftSlot[]): ShiftSlot[] {
  return [...shiftSlots].sort(
    (first, second) =>
      new Date(first.startTime).getTime() -
      new Date(second.startTime).getTime(),
  );
}

function EmployeeShiftTable({
  shiftSlots,
  assigned,
  canAssign,
  assignmentDisabled,
  onAssignClick,
}: {
  shiftSlots: ShiftSlot[];
  assigned: boolean;
  canAssign: boolean;
  assignmentDisabled: boolean;
  onAssignClick: (slotId: UUID) => void;
}) {
  const sortedSlots = sortSlotsByStartTime(shiftSlots);

  return (
    <div className="overflow-x-auto px-5 pb-3">
      <table className="w-full min-w-[760px] border-collapse">
        <thead>
          <tr className="border-b border-border text-left text-sm text-foreground-muted">
            <th className="w-24 px-2 py-3 font-medium">Day</th>
            <th className="px-2 py-3 font-medium">Time</th>
            <th className="px-2 py-3 font-medium">Department</th>
            <th className="px-2 py-3 font-medium">Position</th>
            <th className="w-24 px-2 py-3 font-medium">Slot</th>
            {canAssign && (
              <th className="w-32 px-2 py-3 font-medium">Action</th>
            )}
          </tr>
        </thead>

        <tbody>
          {sortedSlots.map((slot) => (
            <tr
              key={slot.id}
              className="border-b border-border transition-colors duration-fast last:border-b-0 hover:bg-surface-hover"
            >
              <td className="px-2 py-3 text-sm font-medium text-foreground">
                {formatWeekday(new Date(slot.startTime))}
              </td>

              <td className="px-2 py-3 text-sm text-foreground">
                {formatTimeOnly(new Date(slot.startTime))} –{" "}
                {formatTimeOnly(new Date(slot.endTime))}
              </td>

              <td className="px-2 py-3 text-sm text-foreground">
                {getDepartmentLabel(slot.department)}
              </td>

              <td className="px-2 py-3 text-sm text-foreground">
                {getPositionLabel(slot.position)}
              </td>

              <td className="px-2 py-3 text-sm text-foreground">
                #{slot.slotNumber}
              </td>

              {canAssign && (
                <td className="px-2 py-3">
                  <button
                    type="button"
                    className={`${
                      assigned ? util.reassignButton : util.assignButton
                    } disabled:cursor-wait disabled:opacity-60`}
                    disabled={assignmentDisabled}
                    onClick={() => onAssignClick(slot.id)}
                  >
                    {assigned ? "Reassign" : "Assign"}
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function EmployeeView({
  shiftSlots,
  employees,
  canAssign,
  assignmentDisabled,
  onAssignClick,
}: Props) {
  const groups = createEmployeeScheduleGroups(shiftSlots, employees);

  if (groups.length === 0) {
    return (
      <div className="rounded-card border border-border bg-surface-muted p-8 text-center">
        <p className={ui.bodyMuted}>
          No employee assignments match the current filters.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      {groups.map((group, index) => {
        if (!group.employee) {
          return (
            <article
              key="unassigned"
              className="overflow-hidden rounded-card border border-warning/60 bg-surface shadow-card"
            >
              <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-surface-muted px-5 py-4">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-warning-muted text-xl font-semibold text-warning">
                    ?
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Unassigned shifts
                    </h2>

                    <p className="mt-0.5 text-sm text-warning">
                      These slots still require an employee
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-semibold text-foreground">
                    {group.totalHours.toFixed(1)} h
                  </p>

                  <p className="text-sm text-foreground-muted">
                    {group.shiftSlots.length}{" "}
                    {group.shiftSlots.length === 1 ? "shift" : "shifts"}
                  </p>
                </div>
              </header>

              <EmployeeShiftTable
                shiftSlots={group.shiftSlots}
                assigned={false}
                canAssign={canAssign}
                assignmentDisabled={assignmentDisabled}
                onAssignClick={onAssignClick}
              />
            </article>
          );
        }

        const employeeName = `${group.employee.firstName} ${group.employee.lastName}`;
        const avatarClass = CARD_STYLES[index % CARD_STYLES.length];

        return (
          <article
            key={group.employee.id}
            className="overflow-hidden rounded-card border border-border/70 bg-surface shadow-card"
          >
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-surface-muted px-5 py-4">
              <div className="flex items-center gap-4">
                <div
                  className={`flex size-12 shrink-0 items-center justify-center rounded-full text-base font-semibold text-white ${avatarClass}`}
                >
                  {getInitials(group.employee)}
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {employeeName}
                  </h2>

                  <p className="mt-0.5 text-sm text-foreground-muted">
                    {getPositionLabel(group.employee.position)} •{" "}
                    {group.employee.departments
                      .map(getDepartmentLabel)
                      .join(", ")}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-2xl font-semibold text-foreground">
                  {group.totalHours.toFixed(1)} h
                </p>

                <p className="text-sm text-foreground-muted">
                  {group.shiftSlots.length}{" "}
                  {group.shiftSlots.length === 1 ? "shift" : "shifts"}
                </p>
              </div>
            </header>

            <EmployeeShiftTable
              shiftSlots={group.shiftSlots}
              assigned
              canAssign={canAssign}
              assignmentDisabled={assignmentDisabled}
              onAssignClick={onAssignClick}
            />
          </article>
        );
      })}
    </section>
  );
}
