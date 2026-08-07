import * as util from "@/ui/utilities";

import { createEmployeeScheduleGroups } from "@/app/admin/schedules/[id]/helpers/employeeView";

import { formatTimeOnly, formatWeekday } from "@/lib/functions/dateTimeUtils";

import type { AssignableEmployee } from "@/types/employee";
import type { ShiftSlot } from "@/types/scheduling";
import type { UUID } from "@/types/common";

type Props = {
  shiftSlots: ShiftSlot[];
  employees: AssignableEmployee[];
  canAssign: boolean;
  onAssignClick: (slotId: UUID) => void;
};

const POSITION_LABELS: Record<ShiftSlot["position"], string> = {
  HEAD_DOCTOR: "Head Doctor",
  DOCTOR: "Doctor",
  SURGEON: "Surgeon",
  NURSE: "Nurse",
  MEDICAL_ASSISTANT: "Medical Assistant",
  INTERN: "Intern",
};

const CARD_STYLES = [
  {
    border: "border-violet-500/70",
    avatar: "bg-violet-600",
  },
  {
    border: "border-sky-500/60",
    avatar: "bg-sky-600",
  },
  {
    border: "border-emerald-500/60",
    avatar: "bg-emerald-600",
  },
  {
    border: "border-orange-500/60",
    avatar: "bg-orange-600",
  },
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

export default function EmployeeView({
  shiftSlots,
  employees,
  canAssign,
  onAssignClick,
}: Props) {
  const groups = createEmployeeScheduleGroups(shiftSlots, employees);

  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-8 text-center text-slate-400">
        No employee assignments match the current filters.
      </div>
    );
  }

  return (
    <section className="space-y-5">
      {groups.map((group, index) => {
        const sortedSlots = sortSlotsByStartTime(group.shiftSlots);
        const cardStyle = CARD_STYLES[index % CARD_STYLES.length];

        if (!group.employee) {
          return (
            <article
              key="unassigned"
              className="overflow-hidden rounded-xl border border-amber-500/60 bg-slate-900/60"
            >
              <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700 px-5 py-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-xl font-semibold text-amber-300">
                    ?
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-slate-100">
                      Unassigned shifts
                    </h2>

                    <p className="mt-0.5 text-sm text-amber-300">
                      These slots still require an employee
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-semibold text-slate-100">
                    {group.totalHours.toFixed(1)} h
                  </p>

                  <p className="text-sm text-slate-400">
                    {group.shiftSlots.length}{" "}
                    {group.shiftSlots.length === 1 ? "shift" : "shifts"}
                  </p>
                </div>
              </header>

              <div className="overflow-x-auto px-5 pb-3">
                <table className="w-full min-w-[760px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700 text-left text-sm text-slate-400">
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
                        className="border-b border-slate-800 last:border-b-0 hover:bg-slate-800/40"
                      >
                        <td className="px-2 py-3 text-sm text-slate-200">
                          {formatWeekday(new Date(slot.startTime))}
                        </td>

                        <td className="px-2 py-3 text-sm text-slate-200">
                          {formatTimeOnly(new Date(slot.startTime))} –{" "}
                          {formatTimeOnly(new Date(slot.endTime))}
                        </td>

                        <td className="px-2 py-3 text-sm text-slate-200">
                          {slot.department}
                        </td>

                        <td className="px-2 py-3 text-sm text-slate-200">
                          {POSITION_LABELS[slot.position]}
                        </td>

                        <td className="px-2 py-3 text-sm text-slate-200">
                          #{slot.slotNumber}
                        </td>

                        {canAssign && (
                          <td className="px-2 py-3">
                            <button
                              type="button"
                              className={util.assignButton}
                              onClick={() => onAssignClick(slot.id)}
                            >
                              Assign
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          );
        }

        const employeeName = `${group.employee.firstName} ${group.employee.lastName}`;

        return (
          <article
            key={group.employee.id}
            className={`overflow-hidden rounded-xl border bg-slate-900/60 ${cardStyle.border}`}
          >
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700 px-5 py-4">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-semibold text-white ${cardStyle.avatar}`}
                >
                  {getInitials(group.employee)}
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-100">
                    {employeeName}
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-400">
                    {POSITION_LABELS[group.employee.position]} •{" "}
                    {group.employee.departments.join(", ")}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-2xl font-semibold text-slate-100">
                  {group.totalHours.toFixed(1)} h
                </p>

                <p className="text-sm text-slate-400">
                  {group.shiftSlots.length}{" "}
                  {group.shiftSlots.length === 1 ? "shift" : "shifts"}
                </p>
              </div>
            </header>

            <div className="overflow-x-auto px-5 pb-3">
              <table className="w-full min-w-[760px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 text-left text-sm text-slate-400">
                    <th className="w-24 px-2 py-3 font-medium">
                      <span className="flex items-center gap-2">
                        <span aria-hidden="true">▣</span>
                        Day
                      </span>
                    </th>

                    <th className="px-2 py-3 font-medium">
                      <span className="flex items-center gap-2">
                        <span aria-hidden="true">◷</span>
                        Time
                      </span>
                    </th>

                    <th className="px-2 py-3 font-medium">
                      <span className="flex items-center gap-2">
                        <span aria-hidden="true">▥</span>
                        Department
                      </span>
                    </th>

                    <th className="px-2 py-3 font-medium">
                      <span className="flex items-center gap-2">
                        <span aria-hidden="true">▱</span>
                        Position
                      </span>
                    </th>

                    <th className="w-24 px-2 py-3 font-medium">
                      <span className="flex items-center gap-2">
                        <span aria-hidden="true">#</span>
                        Slot
                      </span>
                    </th>

                    {canAssign && (
                      <th className="w-32 px-2 py-3 font-medium">Action</th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {sortedSlots.map((slot) => (
                    <tr
                      key={slot.id}
                      className="border-b border-slate-800 last:border-b-0 hover:bg-slate-800/40"
                    >
                      <td className="px-2 py-3 text-sm font-medium text-slate-100">
                        {formatWeekday(new Date(slot.startTime))}
                      </td>

                      <td className="px-2 py-3 text-sm text-slate-200">
                        {formatTimeOnly(new Date(slot.startTime))} –{" "}
                        {formatTimeOnly(new Date(slot.endTime))}
                      </td>

                      <td className="px-2 py-3 text-sm text-slate-200">
                        {slot.department}
                      </td>

                      <td className="px-2 py-3 text-sm text-slate-200">
                        {POSITION_LABELS[slot.position]}
                      </td>

                      <td className="px-2 py-3 text-sm text-slate-200">
                        #{slot.slotNumber}
                      </td>

                      {canAssign && (
                        <td className="px-2 py-3">
                          <button
                            type="button"
                            className={util.reassignButton}
                            onClick={() => onAssignClick(slot.id)}
                          >
                            Reassign
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        );
      })}
    </section>
  );
}
