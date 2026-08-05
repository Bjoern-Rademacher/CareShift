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
    return <p>No shifts match the current filters.</p>;
  }

  return (
    <>
      {slotsByDay.map(([dayKey, daySlots]) => (
        <section key={dayKey} className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">{formatDay(dayKey)}</h2>

          <SlotsTable
            shiftSlots={daySlots}
            employees={employees}
            onAssignClick={onAssignClick}
            canAssign={canAssign}
          />
        </section>
      ))}
    </>
  );
}
