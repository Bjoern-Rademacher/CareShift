"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as ui from "@/ui/classes";

const links = [
  { href: "/", label: "Home" },
  { href: "/periods", label: "Periods" },
  { href: "/dev/login", label: "Dev Login" },
  { href: "/dev/logout", label: "Dev Logout" },
  { href: "/api/auth/session", label: "Session" },
];

export default function DevNav() {
  const pathname = usePathname();

  return (
    <nav className={ui.card}>
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
    </nav>
  );
}
