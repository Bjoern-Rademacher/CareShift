"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import ThemeSwitch from "@/app/theme/ThemeSwitch";

import * as ui from "@/ui/classes";

const links = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/schedules", label: "Schedules" },
  { href: "/admin/schedules", label: "Admin/Schedules" },
  { href: "/dev/login", label: "Dev Login" },
  { href: "/dev/logout", label: "Dev Logout" },
  { href: "/api/auth/session", label: "Session" },
];

export default function DevNav() {
  const pathname = usePathname();

  return (
    <nav className={`${ui.card} top-0 z-50`}>
      <div className="flex flex-wrap items-center gap-2">
        {links.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={isActive ? ui.buttonPrimary : ui.button}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
      <ThemeSwitch />
    </nav>
  );
}
