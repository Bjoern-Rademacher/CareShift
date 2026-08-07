import { prisma } from "@/lib/db/prisma";
import { EmployeeStatus, Department, Position } from "@/generated/prisma/enums";

export async function getEmployeeById(id: string) {
  return prisma.employee.findUnique({
    where: {
      id,
    },
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

export async function getAssignableEmployees() {
  return prisma.employee.findMany({
    where: {
      status: EmployeeStatus.ACTIVE,
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      departments: true,
      position: true,
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

export async function getAssignableEmployeesByDepartmentAndPosition({
  department,
  position,
}: {
  department: Department;
  position: Position;
}) {
  return prisma.employee.findMany({
    where: {
      status: "ACTIVE",
      position,
      departments: {
        has: department,
      },
    },
    orderBy: [
      {
        lastName: "asc",
      },
      {
        firstName: "asc",
      },
    ],
  });
}
