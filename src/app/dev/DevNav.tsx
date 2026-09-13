import Link from "next/link";

import { getCurrentUser } from "@/lib/auth/currentUser";

import type { Role } from "@/types/auth";

type NavigationItem = {
  label: string;
  href: string;
};

const navigationByRole = {
  ADMIN: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Schedules", href: "/admin/schedules" },
    { label: "Employees", href: "/admin/employees" },
  ],

  EMPLOYEE: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "My schedule", href: "/employee/schedules" },
    { label: "My profile", href: "/employee/profile" },
  ],

  DISPLAY: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Schedules", href: "/schedules" },
  ],
} satisfies Record<Role, NavigationItem[]>;

export default async function DevNav() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const navigation = navigationByRole[user.role];

  return (
    <div className="w-full border-b border-border bg-surface">
      <nav
        aria-label="Application navigation"
        className="flex min-h-14 w-full items-center gap-2 px-6 lg:px-8"
      >
        <span className="mr-4 text-xs font-medium uppercase tracking-wide text-foreground-subtle">
          DevNav | {formatRole(user.role)}
        </span>

        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="
              flex min-h-10 items-center rounded-control
              px-4 text-sm font-medium text-foreground-muted
              transition-colors duration-fast
              hover:bg-surface-hover hover:text-foreground
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-ring
            "
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

function formatRole(role: Role) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}
