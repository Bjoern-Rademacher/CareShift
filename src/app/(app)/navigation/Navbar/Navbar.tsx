"use client";

import { usePathname } from "next/navigation";

import ThemeSwitch from "@/app/theme/ThemeSwitch";

import {
  MessageIcon,
  NotificationIcon,
} from "@/app/(app)/navigation/Navbar/components/NavbarIcons";
import ProfileDropdown from "@/app/(app)/navigation/Navbar/components/ProfileDropdown";

import * as ui from "@/ui/classes";

import type { ReactNode } from "react";
import type { CurrentUser } from "@/types/auth";

type Props = {
  user: CurrentUser | null;
  logoutAction: () => Promise<void>;
};

export default function Navbar({ user, logoutAction }: Props) {
  const pathname = usePathname();

  if (!user) {
    return null;
  }

  const sticky = !isAdminScheduleWorkspace(pathname);

  return (
    <header
      className={
        "h-16 shrink-0 border-b border-border bg-surface sm:h-20 " +
        (sticky ? "sticky top-0 z-40" : "relative")
      }
    >
      <nav
        aria-label="Global navigation"
        className="
          flex h-full min-w-0 items-center justify-between
          gap-4 px-3 sm:px-5 lg:px-8
        "
      >
        <div className="shrink-0">
          <ThemeSwitch />
        </div>

        <div className="flex min-w-0 items-center justify-end gap-2 lg:gap-3">
          <DisabledAction label="Messages" icon={<MessageIcon />} />

          <DisabledAction label="Notifications" icon={<NotificationIcon />} />

          <div className="ml-1 lg:ml-2">
            <ProfileDropdown user={user} logoutAction={logoutAction} />
          </div>
        </div>
      </nav>
    </header>
  );
}

function DisabledAction({ label, icon }: { label: string; icon: ReactNode }) {
  const accessibleLabel = `${label} — Planned`;

  return (
    <span
      title={accessibleLabel}
      className="inline-flex shrink-0 cursor-not-allowed"
    >
      <button
        type="button"
        disabled
        aria-label={accessibleLabel}
        className="
          flex h-9 items-center justify-center gap-2
          rounded-control border border-border
          bg-surface-muted px-2.5 text-sm font-medium
          text-foreground-subtle opacity-70
          sm:h-10 lg:px-3
        "
      >
        <span className="shrink-0">{icon}</span>

        <span className="hidden whitespace-nowrap lg:inline">{label}</span>

        <span
          className={
            `${ui.badge} ${ui.badgeNeutral} ` +
            "hidden whitespace-nowrap lg:inline-flex"
          }
        >
          Planned
        </span>
      </button>
    </span>
  );
}

function isAdminScheduleWorkspace(pathname: string) {
  return pathname.startsWith("/admin/schedules/");
}
