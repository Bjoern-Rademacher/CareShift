import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/currentUser";

import type { ReactNode } from "react";

type Props = Readonly<{
  children: ReactNode;
}>;

export default async function ProfileLayout({ children }: Props) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  if (user.role === "DISPLAY") {
    redirect("/dashboard");
  }

  return children;
}
