import * as ui from "@/ui/classes";

import { createEmployeeScheduleGroups } from "@/app/admin/schedules/[id]/helpers/employeeView";

import { formatWeekday, formatTimeOnly } from "@/lib/functions/dateTimeUtils";

import type { AssignableEmployee } from "@/types/employee";
import type { ShiftSlot } from "@/types/scheduling";
import type { UUID } from "@/types/common";

type Props = {
  shiftSlots: ShiftSlot[];
  employees: AssignableEmployee[];
  canAssign: boolean;
  onAssignClick: (slotId: UUID) => void;
};

export default function EmployeeView({
  shiftSlots,
  employees,
  canAssign,
  onAssignClick,
}: Props) {
  const groups = createEmployeeScheduleGroups(shiftSlots, employees);

  return (
    <section className="space-y-6">
      {groups.map((group) => (
        <article key={group.employee?.id ?? "unassigned"} className={ui.card}>
          <header className="mb-4 flex items-center justify-between border-b border-slate-700 pb-3">
            <div>
              <h2 className="text-lg font-semibold">
                {group.employee
                  ? `${group.employee.firstName} ${group.employee.lastName}`
                  : "Unassigned Shifts"}
              </h2>

              {group.employee && (
                <p className={ui.subtitle}>
                  {group.employee.position} •{" "}
                  {group.employee.departments.join(", ")}
                </p>
              )}
            </div>

            <div className="text-right">
              <p className="text-xl font-semibold">
                {group.totalHours.toFixed(1)} h
              </p>

              <p className={ui.subtitle}>{group.shiftSlots.length} shifts</p>
            </div>
          </header>

          <table className={ui.table}>
            <thead>
              <tr>
                <th className={ui.th}>Day</th>
                <th className={ui.th}>Time</th>
                <th className={ui.th}>Department</th>
                <th className={ui.th}>Position</th>
                <th className={ui.th}>Slot</th>

                {canAssign && <th className={ui.th}></th>}
              </tr>
            </thead>

            <tbody>
              {group.shiftSlots.map((slot) => (
                <tr key={slot.id} className={ui.rowHover}>
                  <td className={ui.td}>
                    {formatWeekday(new Date(slot.startTime))}
                  </td>

                  <td className={ui.td}>
                    {formatTimeOnly(new Date(slot.startTime))}
                    {" – "}
                    {formatTimeOnly(new Date(slot.endTime))}
                  </td>

                  <td className={ui.td}>{slot.department}</td>

                  <td className={ui.td}>{slot.position}</td>

                  <td className={ui.td}>#{slot.slotNumber}</td>

                  {canAssign && (
                    <td className={ui.td}>
                      <button
                        type="button"
                        className={ui.button}
                        onClick={() => onAssignClick(slot.id)}
                      >
                        {slot.employeeId ? "Reassign" : "Assign"}
                      </button>
                    </td>
                  )}
                </tr>
              ))}

              {group.shiftSlots.length === 0 && (
                <tr>
                  <td
                    colSpan={canAssign ? 6 : 5}
                    className={`${ui.td} text-center text-slate-500`}
                  >
                    No shifts.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </article>
      ))}
    </section>
  );
}
