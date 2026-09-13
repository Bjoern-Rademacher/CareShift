import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/currentUser";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return children;
}
