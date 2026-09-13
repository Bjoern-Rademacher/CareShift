// prisma/seed.ts

import { prisma } from "@/lib/db/prisma";

import { seedEmployees } from "./seedEmployees";
import { seedTemplateRules } from "./seedTemplateRules";
import { seedPeriods } from "./seedPeriods";

async function main() {
  await seedEmployees();

  await seedTemplateRules();

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
