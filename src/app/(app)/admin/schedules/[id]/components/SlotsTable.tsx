import * as util from "@/ui/utilities";

import { SHIFT_GROUPS } from "@/lib/constants/schedule";
import {
  getEarliestStartingSlot,
  POSITION_ORDER,
  SHIFT_GROUP_DETAILS,
} from "@/lib/constants/scheduleDisplay";
import { formatTimeOnly } from "@/lib/functions/dateTimeUtils";
import { getPositionLabel } from "@/lib/functions/employeePositions";
import { getShiftGroup } from "@/lib/functions/scheduleUtils";

import type { UUID } from "@/types/common";
import type { AssignableEmployee } from "@/types/employee";
import type { ShiftSlot } from "@/types/scheduling";
import type { ShiftGroup } from "@/types/view";

type Props = {
  shiftSlots: ShiftSlot[];
  employees: AssignableEmployee[];
  onAssignClick: (slotId: UUID) => void;
  canAssign: boolean;
  assignmentDisabled: boolean;
};

function sortSlots(slots: ShiftSlot[]): ShiftSlot[] {
  return [...slots].sort((first, second) => {
    const positionDifference =
      POSITION_ORDER[first.position] - POSITION_ORDER[second.position];

    if (positionDifference !== 0) {
      return positionDifference;
    }

    return first.slotNumber - second.slotNumber;
  });
}

export default function SlotsTable({
  shiftSlots,
  employees,
  onAssignClick,
  canAssign,
  assignmentDisabled,
}: Props) {
  const employeesById = new Map(
    employees.map((employee) => [employee.id, employee]),
  );

  const slotsByShift = shiftSlots.reduce<Record<ShiftGroup, ShiftSlot[]>>(
    (groups, slot) => {
      groups[getShiftGroup(slot.startTime)].push(slot);

      return groups;
    },
    {
      MORNING: [],
      EVENING: [],
      NIGHT: [],
    },
  );

  return (
    <div className="space-y-4">
      {SHIFT_GROUPS.map((shiftGroup) => {
        const groupSlots = sortSlots(slotsByShift[shiftGroup]);

        if (groupSlots.length === 0) {
          return null;
        }

        const details = SHIFT_GROUP_DETAILS[shiftGroup];
        const representativeSlot = getEarliestStartingSlot(groupSlots);

        if (!representativeSlot) {
          return null;
        }

        return (
          <article
            key={shiftGroup}
            className="
              overflow-hidden rounded-card
              border border-border bg-surface
            "
          >
            <header
              className="
                flex items-center gap-4 border-b
                border-border bg-surface-muted px-5 py-3
              "
            >
              <div
                className={`flex items-center gap-3 font-semibold ${details.textClass}`}
              >
                <span aria-hidden="true" className="text-xl">
                  {details.symbol}
                </span>

                <span>{details.label}</span>
              </div>

              <span
                className="
                  rounded-control border border-border
                  bg-surface px-2 py-1 text-xs
                  font-medium text-foreground-muted
                "
              >
                {formatTimeOnly(new Date(representativeSlot.startTime))} –{" "}
                {formatTimeOnly(new Date(representativeSlot.endTime))}
              </span>
            </header>

            <div className="overflow-x-auto px-4 pb-2">
              <table className="w-full min-w-[620px] table-fixed border-collapse">
                <colgroup>
                  <col className="w-1/3" />
                  <col className="w-1/3" />
                  <col className="w-1/3" />
                </colgroup>

                <thead>
                  <tr
                    className="
                      border-b border-border
                      text-sm text-foreground-muted
                    "
                  >
                    <th className="px-2 py-3 text-left font-medium">
                      Position
                    </th>

                    <th className="px-2 py-3 text-center font-medium">
                      Employee
                    </th>

                    <th className="px-2 py-3 text-right font-medium">
                      {canAssign ? "Action" : null}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {groupSlots.map((slot) => {
                    const employee = slot.employeeId
                      ? employeesById.get(slot.employeeId)
                      : undefined;

                    const employeeName = employee
                      ? `${employee.firstName} ${employee.lastName}`
                      : "Unassigned";

                    return (
                      <tr
                        key={slot.id}
                        className="
                          border-b border-border bg-surface
                          transition-colors duration-fast
                          last:border-b-0 hover:bg-surface-hover
                        "
                      >
                        <td
                          className="
                            whitespace-nowrap px-2 py-2.5
                            text-left text-sm font-medium
                            text-foreground
                          "
                        >
                          {getPositionLabel(slot.position)} #{slot.slotNumber}
                        </td>

                        <td className="px-2 py-2.5">
                          <div className="flex items-center justify-center gap-3">
                            <span
                              className={
                                employee
                                  ? util.employeeIndicator
                                  : util.unassignedIndicator
                              }
                            />

                            <span
                              className={
                                employee
                                  ? "text-sm font-semibold text-foreground"
                                  : "text-sm font-semibold text-warning"
                              }
                            >
                              {employeeName}
                            </span>
                          </div>
                        </td>

                        <td className="px-2 py-2.5 text-right">
                          {canAssign && (
                            <button
                              type="button"
                              className={`${
                                employee
                                  ? util.reassignButton
                                  : util.assignButton
                              } disabled:cursor-wait disabled:opacity-60`}
                              disabled={assignmentDisabled}
                              onClick={() => onAssignClick(slot.id)}
                            >
                              {employee ? "Reassign" : "Assign"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </article>
        );
      })}
    </div>
  );
}
