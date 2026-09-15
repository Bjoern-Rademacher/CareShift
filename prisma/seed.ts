// prisma/seed.ts

import { prisma } from "@/lib/db/prisma";

import { seedEmployees } from "./seedEmployees";
import { seedAuth } from "./seedAuth";
import { seedTemplateRules } from "./seedTemplateRules";
import { seedPeriods } from "./seedPeriods";

async function main() {
  await seedTemplateRules();

  const employeeIds = await seedEmployees();

  await seedAuth(employeeIds);

  await seedPeriods();
}

main()
  .catch((error) => {
    console.error("Database seed failed:", error);

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
