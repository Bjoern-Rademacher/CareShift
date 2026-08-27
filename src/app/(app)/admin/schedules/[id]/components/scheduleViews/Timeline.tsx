import * as ui from "@/ui/classes";

import SlotsTable from "@/app/(app)/admin/schedules/[id]/components/SlotsTable";
import {
  formatDay,
  groupSlotsByDay,
} from "@/app/(app)/admin/schedules/[id]/helpers/slotGrouping";

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

export default function Timeline({
  shiftSlots,
  employees,
  canAssign,
  assignmentDisabled,
  onAssignClick,
}: Props) {
  const slotsByDay = groupSlotsByDay(shiftSlots);

  if (slotsByDay.length === 0) {
    return (
      <div className="rounded-card border border-border bg-surface-muted p-8 text-center">
        <p className={ui.bodyMuted}>No shifts match the current filters.</p>
      </div>
    );
  }

  return (
    <section className="space-y-8">
      {slotsByDay.map(([dayKey, daySlots]) => (
        <section
          key={dayKey}
          className="rounded-card border border-border bg-surface p-4"
        >
          <h2 className="mb-4 flex items-center gap-3 text-xl font-semibold text-foreground">
            {formatDay(dayKey)}
          </h2>

          <SlotsTable
            shiftSlots={daySlots}
            employees={employees}
            onAssignClick={onAssignClick}
            canAssign={canAssign}
            assignmentDisabled={assignmentDisabled}
          />
        </section>
      ))}
    </section>
  );
}
