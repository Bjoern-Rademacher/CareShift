import { redirect } from "next/navigation";

import NavigationAside from "./navigation/NavigationAside/NavigationAside";
import Navbar from "./navigation/Navbar/Navbar";

import { getCurrentUser } from "@/lib/auth/currentUser";
import { logout } from "@/lib/auth/logout";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-[calc(100vh-1.5rem)]">
      <NavigationAside user={user} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar user={user} logoutAction={logout} />

        <main className="min-w-0 flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
