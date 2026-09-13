import { getEmployeeProfileById } from "@/lib/db/employees";

import type { CurrentUser } from "@/types/auth";
import type { EmployeeProfileData } from "@/types/employee";

export async function getEmployeeProfileData(
  user: CurrentUser,
): Promise<EmployeeProfileData | null> {
  // check whether user.employeeId exists
  if (user.role === "DISPLAY") {
    return null;
  }

  const employee = await getEmployeeProfileById(user.employeeId);

  if (!employee) {
    return null;
  }

  return {
    id: employee.id,
    firstName: employee.firstName,
    lastName: employee.lastName,
    position: employee.position,
    departments: employee.departments,
    status: employee.status,
    role: user.role,
  };
}
