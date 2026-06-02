import { prisma } from "@/lib/db/prisma";

export async function assignEmployeeToShiftSlot(
  slotId: string,
  employeeId: string,
) {
  return prisma.shiftSlot.update({
    where: { id: slotId },
    data: { employeeId },
    include: {
      employee: true,
    },
  });
}

export async function unassignEmployeeFromShiftSlot(slotId: string) {
  return prisma.shiftSlot.update({
    where: { id: slotId },
    data: { employeeId: null },
    include: {
      employee: true,
    },
  });
}
