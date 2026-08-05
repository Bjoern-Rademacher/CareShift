import type { AssignableEmployee } from "@/types/employee";
import type { ShiftSlot } from "@/types/scheduling";

export type EmployeeScheduleGroup = {
  employee: AssignableEmployee | null;
  totalHours: number;
  shiftSlots: ShiftSlot[];
};

function getShiftDurationHours(slot: ShiftSlot): number {
  const start = new Date(slot.startTime);
  const end = new Date(slot.endTime);

  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
}

export function createEmployeeScheduleGroups(
  shiftSlots: ShiftSlot[],
  employees: AssignableEmployee[],
): EmployeeScheduleGroup[] {
  const groups = new Map<string | null, EmployeeScheduleGroup>();

  for (const employee of employees) {
    groups.set(employee.id, {
      employee,
      totalHours: 0,
      shiftSlots: [],
    });
  }

  groups.set(null, {
    employee: null,
    totalHours: 0,
    shiftSlots: [],
  });

  for (const slot of shiftSlots) {
    const key = slot.employeeId ?? null;

    const group = groups.get(key);

    if (!group) {
      continue;
    }

    group.shiftSlots.push(slot);
    group.totalHours += getShiftDurationHours(slot);
  }

  return [...groups.values()]
    .filter((group) => group.shiftSlots.length > 0 || group.employee === null)
    .sort((first, second) => {
      if (first.employee === null) {
        return 1;
      }

      if (second.employee === null) {
        return -1;
      }

      return second.totalHours - first.totalHours;
    });
}
