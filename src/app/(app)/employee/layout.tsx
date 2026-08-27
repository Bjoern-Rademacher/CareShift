import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/currentUser";

export default async function EmployeeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  if (user.role !== "EMPLOYEE" || typeof user.employeeId !== "string") {
    redirect("/dashboard");
  }

  return children;
}
