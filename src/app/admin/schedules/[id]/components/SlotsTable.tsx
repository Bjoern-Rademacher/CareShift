import { Fragment } from "react";

import * as ui from "@/ui/classes";

import type { ShiftSlot } from "@/types/scheduling";
import type { AssignableEmployee } from "@/types/employee";
import type { UUID } from "@/types/common";

type Props = {
  shiftSlots: ShiftSlot[];
  employees: AssignableEmployee[];
  onAssignClick: (slotId: UUID) => void;
  canAssign: boolean;
};

type ShiftGroup = "Morning" | "Evening" | "Night";

const SHIFT_GROUP_ORDER: ShiftGroup[] = ["Morning", "Evening", "Night"];

const POSITION_ORDER: Record<ShiftSlot["position"], number> = {
  HEAD_DOCTOR: 0,
  DOCTOR: 1,
  SURGEON: 1,
  NURSE: 2,
  MEDICAL_ASSISTANT: 2,
  INTERN: 3,
};

function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(date);
}

function getShiftGroup(startTime: string): ShiftGroup {
  const hour = new Date(startTime).getUTCHours();

  if (hour >= 6 && hour < 14) {
    return "Morning";
  }

  if (hour >= 14 && hour < 22) {
    return "Evening";
  }

  return "Night";
}

function sortSlots(shiftSlots: ShiftSlot[]): ShiftSlot[] {
  return [...shiftSlots].sort((firstSlot, secondSlot) => {
    const positionDifference =
      POSITION_ORDER[firstSlot.position] - POSITION_ORDER[secondSlot.position];

    if (positionDifference !== 0) {
      return positionDifference;
    }

    const slotNumberDifference = firstSlot.slotNumber - secondSlot.slotNumber;

    if (slotNumberDifference !== 0) {
      return slotNumberDifference;
    }

    return firstSlot.id.localeCompare(secondSlot.id);
  });
}

export default function SlotsTable({
  shiftSlots,
  employees,
  onAssignClick,
  canAssign,
}: Props) {
  if (shiftSlots.length === 0) {
    return <p>No slots for this period available.</p>;
  }

  const slotsByShift = shiftSlots.reduce<Record<ShiftGroup, ShiftSlot[]>>(
    (groups, slot) => {
      const shiftGroup = getShiftGroup(slot.startTime);

      groups[shiftGroup].push(slot);

      return groups;
    },
    {
      Morning: [],
      Evening: [],
      Night: [],
    },
  );

  return (
    <article className={ui.card}>
      <div className="overflow-x-auto">
        <table className={ui.table}>
          <thead>
            <tr>
              <th className={ui.th}>Start</th>
              <th className={ui.th}>End</th>
              <th className={ui.th}>Position</th>
              <th className={ui.th}>Slot</th>
              <th className={ui.th}>Employee</th>
              <th className={ui.th}></th>
            </tr>
          </thead>

          <tbody>
            {SHIFT_GROUP_ORDER.map((shiftGroup) => {
              const groupSlots = sortSlots(slotsByShift[shiftGroup]);

              if (groupSlots.length === 0) {
                return null;
              }

              return (
                <Fragment key={shiftGroup}>
                  <tr>
                    <th
                      colSpan={6}
                      className="px-3 pt-4 pb-2 text-left text-sm font-semibold"
                    >
                      {shiftGroup}
                    </th>
                  </tr>

                  {groupSlots.map((slot) => {
                    const employee = employees.find(
                      (employee) => employee.id === slot.employeeId,
                    );

                    const employeeName = employee
                      ? `${employee.firstName} ${employee.lastName}`
                      : "Unassigned";

                    return (
                      <tr key={slot.id} className={ui.rowHover}>
                        <td className={ui.td}>
                          {formatDateTime(slot.startTime)}
                        </td>

                        <td className={ui.td}>
                          {formatDateTime(slot.endTime)}
                        </td>

                        <td className={ui.td}>{slot.position}</td>

                        <td className={ui.td}>#{slot.slotNumber}</td>

                        <td className={ui.td}>{employeeName}</td>

                        <td className={ui.td}>
                          {canAssign && (
                            <button
                              type="button"
                              className={ui.button}
                              onClick={() => onAssignClick(slot.id)}
                            >
                              {slot.employeeId === null ? "Assign" : "Reassign"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );
}
