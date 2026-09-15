import "dotenv/config";

import { prisma } from "@/lib/db/prisma";

import type { SeededEmployeeIds } from "./seedEmployees";

export async function seedAuth(employeeIds: SeededEmployeeIds): Promise<void> {
  await prisma.$transaction([
    prisma.user.upsert({
      where: {
        authProvider_authSubject: {
          authProvider: "DEV",
          authSubject: "demo-admin",
        },
      },
      update: {
        role: "ADMIN",
        employeeId: employeeIds.admin,
      },
      create: {
        authProvider: "DEV",
        authSubject: "demo-admin",
        role: "ADMIN",
        employeeId: employeeIds.admin,
      },
    }),

    prisma.user.upsert({
      where: {
        authProvider_authSubject: {
          authProvider: "DEV",
          authSubject: "demo-employee",
        },
      },
      update: {
        role: "EMPLOYEE",
        employeeId: employeeIds.employee,
      },
      create: {
        authProvider: "DEV",
        authSubject: "demo-employee",
        role: "EMPLOYEE",
        employeeId: employeeIds.employee,
      },
    }),

    prisma.user.upsert({
      where: {
        authProvider_authSubject: {
          authProvider: "DEV",
          authSubject: "demo-display",
        },
      },
      update: {
        role: "DISPLAY",
        employeeId: null,
      },
      create: {
        authProvider: "DEV",
        authSubject: "demo-display",
        role: "DISPLAY",
        employeeId: null,
      },
    }),
  ]);

  console.log("Seeded development users.");
}
