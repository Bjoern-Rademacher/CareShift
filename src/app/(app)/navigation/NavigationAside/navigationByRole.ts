import {
  Building2,
  CalendarCheck2,
  CalendarDays,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";
import type { Role } from "@/types/auth";

export type NavigationItem = Readonly<{
  label: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
}>;

export type NavigationSection = Readonly<{
  label: string;
  items: readonly NavigationItem[];
}>;

type RoleNavigation = Readonly<{
  ariaLabel: string;
  footerLabel: string;
  sections: readonly NavigationSection[];
}>;

export const navigationByRole = {
  ADMIN: {
    ariaLabel: "Admin navigation",
    footerLabel: "Demo · Admin",

    sections: [
      {
        label: "Workspace",

        items: [
          {
            label: "Dashboard",
            href: "/dashboard",
            icon: LayoutDashboard,
          },
          {
            label: "Schedule Planning",
            href: "/admin/schedules",
            icon: CalendarCheck2,
          },
          {
            label: "Public Schedules",
            href: "/schedules",
            icon: CalendarDays,
          },
          {
            label: "Employees",
            href: "/admin/employees",
            icon: Users,
          },
        ],
      },
      {
        label: "Management",

        items: [
          {
            label: "Departments",
            href: "/admin/departments",
            icon: Building2,
            disabled: true,
          },
          {
            label: "Settings",
            href: "/admin/settings",
            icon: Settings,
            disabled: true,
          },
        ],
      },
    ],
  },

  EMPLOYEE: {
    ariaLabel: "Employee navigation",
    footerLabel: "Demo · Employee",

    sections: [
      {
        label: "Workspace",

        items: [
          {
            label: "Dashboard",
            href: "/dashboard",
            icon: LayoutDashboard,
          },
          {
            label: "My Schedules",
            href: "/employee/schedules",
            icon: CalendarDays,
          },
        ],
      },
      {
        label: "Account",

        items: [
          {
            label: "Settings",
            href: "/settings",
            icon: Settings,
            disabled: true,
          },
        ],
      },
    ],
  },

  DISPLAY: {
    ariaLabel: "Display navigation",
    footerLabel: "Demo · Display",

    sections: [
      {
        label: "Workspace",

        items: [
          {
            label: "Dashboard",
            href: "/dashboard",
            icon: LayoutDashboard,
          },
          {
            label: "Schedules",
            href: "/schedules",
            icon: CalendarDays,
          },
        ],
      },
    ],
  },
} as const satisfies Record<Role, RoleNavigation>;
