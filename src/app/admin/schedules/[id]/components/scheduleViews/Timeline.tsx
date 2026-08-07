import SlotsTable from "@/app/admin/schedules/[id]/components/SlotsTable";

import {
  formatDay,
  groupSlotsByDay,
} from "@/app/admin/schedules/[id]/helpers/slotGrouping";

import type { AssignableEmployee } from "@/types/employee";
import type { ShiftSlot } from "@/types/scheduling";
import type { UUID } from "@/types/common";

type Props = {
  shiftSlots: ShiftSlot[];
  employees: AssignableEmployee[];
  canAssign: boolean;
  onAssignClick: (slotId: UUID) => void;
};

export default function Timeline({
  shiftSlots,
  employees,
  canAssign,
  onAssignClick,
}: Props) {
  const slotsByDay = groupSlotsByDay(shiftSlots);

  if (slotsByDay.length === 0) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-8 text-center text-slate-400">
        No shifts match the current filters.
      </div>
    );
  }

  return (
    <section className="space-y-8">
      {slotsByDay.map(([dayKey, daySlots]) => (
        <section
          key={dayKey}
          className="rounded-xl border border-slate-800 bg-slate-950/30 p-4"
        >
          <h2 className="mb-4 flex items-center gap-3 text-xl font-semibold text-slate-100">
            <span aria-hidden="true">▣</span>
            {formatDay(dayKey)}
          </h2>

          <SlotsTable
            shiftSlots={daySlots}
            employees={employees}
            onAssignClick={onAssignClick}
            canAssign={canAssign}
          />
        </section>
      ))}
    </section>
  );
}
