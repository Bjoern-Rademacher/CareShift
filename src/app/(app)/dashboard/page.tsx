import { redirect } from "next/navigation";

import AdminView from "@/app/(app)/dashboard/AdminView";
import EmployeeView from "@/app/(app)/dashboard/EmployeeView";
import DisplayView from "@/app/(app)/dashboard//DisplayView";

import { getCurrentUser } from "@/lib/auth/currentUser";

import { getAdminDashboardData } from "@/lib/useCases/getAdminDashboardData";
import { getEmployeeDashboardData } from "@/lib/useCases/getEmployeeDashboardData";
import { getDisplayDashboardData } from "@/lib/useCases/getDisplayDashboardData";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  if (user.role === "ADMIN") {
    const data = await getAdminDashboardData();

    return <AdminView data={data} />;
  }

  if (user.role === "EMPLOYEE") {
    const data = await getEmployeeDashboardData(user.employeeId);

    return <EmployeeView data={data} />;
  }

  if (user.role === "DISPLAY") {
    const data = await getDisplayDashboardData();

    return <DisplayView data={data} />;
  }

  redirect("/schedules");
}
