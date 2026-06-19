import { prisma } from "@/lib/db/prisma";
import type { Department } from "@/generated/prisma/client";

export async function getTemplateRulesByDepartment(department: Department) {
  return prisma.templateRule.findMany({
    where: {
      department,
    },
    orderBy: [{ weekdays: "asc" }, { startTimeLocal: "asc" }],
  });
}
