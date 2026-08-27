import type { ShiftSlot } from "@/types/scheduling";

export function getDayKey(startTime: string): string {
  return startTime.slice(0, 10);
}

export function formatDay(dayKey: string): string {
  return new Date(`${dayKey}T00:00:00.000Z`).toLocaleDateString(undefined, {
    weekday: "long",
    day: "2-digit",
    month: "long",
    timeZone: "UTC",
  });
}

export function groupSlotsByDay(
  shiftSlots: ShiftSlot[],
): Array<[string, ShiftSlot[]]> {
  const groupedSlots = shiftSlots.reduce<Record<string, ShiftSlot[]>>(
    (groups, slot) => {
      const dayKey = getDayKey(slot.startTime);

      groups[dayKey] ??= [];
      groups[dayKey].push(slot);

      return groups;
    },
    {},
  );

  return Object.entries(groupedSlots).sort(([firstDay], [secondDay]) =>
    firstDay.localeCompare(secondDay),
  );
}
