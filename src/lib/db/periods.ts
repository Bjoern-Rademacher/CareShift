import { prisma } from "@/lib/db/prisma";

export async function getSchedulePeriods() {
  return prisma.schedulePeriod.findMany({
    orderBy: { startDate: "desc" },
  });
}

export async function getSchedulePeriodById(id: string) {
  return prisma.schedulePeriod.findUnique({
    where: { id },
    include: {
      shiftSlots: {
        orderBy: { startTime: "asc" },
        include: {
          employee: true,
        },
      },
    },
  });
}
