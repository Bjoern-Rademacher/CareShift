import { notFound } from "next/navigation";

import * as ui from "@/ui/classes";

import EmployeeSchedules from "./components/EmployeeSchedules";
import EmployeeSummary from "./components/EmployeeSummary";

import { getEmployeeById } from "@/lib/db/employees";
import { getActiveSchedulesForEmployee } from "@/lib/useCases/getActiveSchedulesForEmployee";

import type { UUID } from "@/types/common";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EmployeePage({ params }: Props) {
  const { id } = await params;
  const employeeId = id as UUID;

  const [employee, activeSchedules] = await Promise.all([
    getEmployeeById(employeeId),
    getActiveSchedulesForEmployee(employeeId, "INCLUDE_UNPUBLISHED"),
  ]);

  if (!employee) {
    notFound();
  }

  return (
    <div className={ui.page}>
      <EmployeeSummary employee={employee} activeSchedules={activeSchedules} />

      <EmployeeSchedules activeSchedules={activeSchedules} />
    </div>
  );
}
