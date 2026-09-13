import { redirect } from "next/navigation";

import EmployeeSchedulesView from "@/app/(app)/employee/schedules/EmployeeSchedulesView";

import { getCurrentUser } from "@/lib/auth/currentUser";
import { getEmployeeSchedulesData } from "@/lib/useCases/getEmployeeSchedulesData";

export default async function EmployeeSchedulesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  if (user.role !== "EMPLOYEE" || typeof user.employeeId !== "string") {
    redirect("/dashboard");
  }

  const { currentSchedules, pastSchedules } = await getEmployeeSchedulesData(
    user.employeeId,
  );

  return (
    <EmployeeSchedulesView
      currentSchedules={currentSchedules}
      pastSchedules={pastSchedules}
    />
  );
}
