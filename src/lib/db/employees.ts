import { prisma } from "@/lib/db/prisma";

import type { EmployeeStatus } from "@/types/employee";

export async function getAssignableEmployees() {
  return prisma.employee.findMany({
    where: {
      // later: isActive: true
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      departments: true,
      position: true,
      // later: isActive: true
    },
  });
}

export async function getDisplayEmployees(status?: EmployeeStatus) {
  return prisma.employee.findMany({
    where: status ? { status } : undefined,
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      departments: true,
      position: true,
      status: true,
    },
  });
}
