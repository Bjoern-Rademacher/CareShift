import * as util from "@/ui/utilities";

import type { AssignableEmployee } from "@/types/employee";
import type { ShiftSlot } from "@/types/scheduling";
import type { UUID } from "@/types/common";
import type { ShiftGroup } from "@/types/view";

type Props = {
  shiftSlots: ShiftSlot[];
  employees: AssignableEmployee[];
  onAssignClick: (slotId: UUID) => void;
  canAssign: boolean;
};

const SHIFT_GROUPS: ShiftGroup[] = ["MORNING", "EVENING", "NIGHT"];

const POSITION_ORDER: Record<ShiftSlot["position"], number> = {
  HEAD_DOCTOR: 0,
  DOCTOR: 1,
  SURGEON: 1,
  NURSE: 2,
  MEDICAL_ASSISTANT: 2,
  INTERN: 3,
};

const SHIFT_DETAILS: Record<
  ShiftGroup,
  {
    label: string;
    icon: string;
    headerClass: string;
    borderClass: string;
  }
> = {
  MORNING: {
    label: "Morning",
    icon: "☀",
    headerClass: "text-amber-300",
    borderClass: "border-amber-500/50",
  },
  EVENING: {
    label: "Evening",
    icon: "☼",
    headerClass: "text-orange-400",
    borderClass: "border-orange-500/50",
  },
  NIGHT: {
    label: "Night",
    icon: "☾",
    headerClass: "text-sky-300",
    borderClass: "border-sky-500/50",
  },
};

function getShiftGroup(startTime: string): ShiftGroup {
  const hour = new Date(startTime).getUTCHours();

  if (hour >= 6 && hour < 14) {
    return "MORNING";
  }

  if (hour >= 14 && hour < 22) {
    return "EVENING";
  }

  return "NIGHT";
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(value));
}

function formatPosition(position: ShiftSlot["position"]): string {
  return position
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

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

        const details = SHIFT_DETAILS[shiftGroup];
        const secondSlot = groupSlots[1];

        return (
          <article
            key={shiftGroup}
            className={`overflow-hidden rounded-lg border bg-slate-900/60 ${details.borderClass}`}
          >
            <header
              className={`flex items-center gap-4 border-b px-5 py-3 ${details.borderClass}`}
            >
              <div
                className={`flex items-center gap-3 font-semibold ${details.headerClass}`}
              >
                <span aria-hidden="true" className="text-xl">
                  {details.icon}
                </span>

                <span>{details.label}</span>
              </div>

              <span className="rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300">
                {formatTime(secondSlot.startTime)} –{" "}
                {formatTime(secondSlot.endTime)}
              </span>
            </header>

            <div className="overflow-x-auto px-4 pb-2">
              <table className="w-full min-w-[620px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 text-left text-sm text-slate-400">
                    <th className="px-2 py-3 font-medium">Position</th>

                    <th className="px-2 py-3 font-medium">Employee</th>

                    <th className="w-32 px-2 py-3 font-medium">Action</th>
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
                        className="border-b border-slate-800 last:border-b-0 hover:bg-slate-800/40"
                      >
                        <td className="px-2 py-2.5 text-sm font-medium text-slate-100">
                          {formatPosition(slot.position)} #{slot.slotNumber}
                        </td>

                        <td className="px-2 py-2.5">
                          <div className="flex items-center gap-3">
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
                                  ? "text-sm text-slate-100"
                                  : "text-sm font-medium text-amber-300"
                              }
                            >
                              {employeeName}
                            </span>
                          </div>
                        </td>

                        <td className="px-2 py-2.5">
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
