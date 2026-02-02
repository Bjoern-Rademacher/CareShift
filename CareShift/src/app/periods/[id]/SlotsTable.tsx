import * as ui from "@/app/periods/uiCLasses";

import { ShiftSlot } from "@/types/scheduling";
import { Employee } from "@/types/employee";
import { UUID } from "@/types/common";

type Props = {
  shiftSlots: ShiftSlot[];
  employees: Employee[];
  onAssignClick: (slotId: UUID) => void;
};

function formatDateTime(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default function SlotsTable({
  shiftSlots,
  employees,
  onAssignClick,
}: Props) {
  if (shiftSlots.length === 0) {
    return <p>No slots for this period available.</p>;
  }

  return (
    <article className={ui.card}>
      <div className="overflow-x-auto">
        <table className={ui.table}>
          <thead>
            <tr>
              <th className={ui.th}>Start</th>
              <th className={ui.th}>End</th>
              <th className={ui.th}>Position</th>
              <th className={ui.th}>Employee</th>
              <th className={ui.th}></th>
            </tr>
          </thead>
          <tbody>
            {shiftSlots.map((slot) => {
              const employee = employees.find((e) => e.id === slot.employeeId);
              const employeeName = employee ? employee.name : "Unassigned";

              return (
                <tr key={slot.id} className={ui.rowHover}>
                  <td className={ui.td}>{formatDateTime(slot.startTime)}</td>
                  <td className={ui.td}>{formatDateTime(slot.endTime)}</td>
                  <td className={ui.td}>{slot.position}</td>
                  <td className={ui.td}>{employeeName}</td>
                  <td className={ui.td}>
                    <button
                      className={ui.button}
                      onClick={() => onAssignClick(slot.id)}
                    >
                      {slot.employeeId === null ? "Assign" : "Reassign"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );
}
