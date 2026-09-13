"use client";

import { useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ChevronLeft, ChevronRight } from "lucide-react";

import * as ui from "@/ui/classes";

import { navigationByRole } from "./navigationByRole";

import type { CurrentUser } from "@/types/auth";
import type { NavigationItem, NavigationSection } from "./navigationByRole";

type Props = {
  user: CurrentUser | null;
};

export default function NavigationAside({ user }: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) {
    return null;
  }

  const navigation = navigationByRole[user.role];

  return (
    <aside
      className={`
        sticky top-0 flex h-[calc(100vh-1.5rem)]
        shrink-0 self-start flex-col overflow-hidden
        rounded-l-overlay border-r border-border bg-surface
        transition-[width] duration-fast
        ${collapsed ? "w-16" : "w-60"}
      `}
    >
      <Brand collapsed={collapsed} />

      <nav aria-label={navigation.ariaLabel} className="flex-1 px-3 py-5">
        <ul className="space-y-6">
          {navigation.sections.map((section) => (
            <li key={section.label}>
              <NavigationGroup
                section={section}
                pathname={pathname}
                collapsed={collapsed}
              />
            </li>
          ))}
        </ul>
      </nav>

      <SidebarFooter
        collapsed={collapsed}
        footerLabel={navigation.footerLabel}
        onToggle={() => setCollapsed((current) => !current)}
      />
    </aside>
  );
}

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <Link
      href="/dashboard"
      title={collapsed ? "CareShift" : undefined}
      aria-label={collapsed ? "CareShift dashboard" : undefined}
      className={`
        flex h-20 shrink-0 items-center
        border-b border-border
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-inset
        focus-visible:ring-ring
        ${collapsed ? "justify-center px-3" : "gap-3 px-5"}
      `}
    >
      <Image
        src="/CareShiftLogo.png"
        alt=""
        aria-hidden="true"
        width={36}
        height={36}
        priority
        className="size-9 shrink-0 object-contain"
      />

      {!collapsed && (
        <span className="min-w-0">
          <span
            className="
              block text-lg font-semibold
              tracking-tight text-foreground
            "
          >
            CareShift
          </span>

          <span
            className="
              block truncate text-xs
              text-foreground-subtle
            "
          >
            Workforce scheduling
          </span>
        </span>
      )}
    </Link>
  );
}

function NavigationGroup({
  section,
  pathname,
  collapsed,
}: {
  section: NavigationSection;
  pathname: string;
  collapsed: boolean;
}) {
  return (
    <section aria-label={collapsed ? section.label : undefined}>
      {!collapsed && (
        <h2
          className="
            mb-2 px-3 text-[0.6875rem]
            font-semibold uppercase
            tracking-[0.12em]
            text-foreground-subtle
          "
        >
          {section.label}
        </h2>
      )}

      <ul className="space-y-1">
        {section.items.map((item) => (
          <li key={item.href}>
            <NavigationEntry
              item={item}
              active={isActivePath(pathname, item.href)}
              collapsed={collapsed}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function NavigationEntry({
  item,
  active,
  collapsed,
}: {
  item: NavigationItem;
  active: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;

  if (item.disabled) {
    return (
      <div
        aria-disabled="true"
        aria-label={collapsed ? `${item.label}, planned` : undefined}
        title={collapsed ? `${item.label} — Planned` : undefined}
        className="
          relative flex h-10 cursor-not-allowed
          select-none items-center rounded-control
          px-3 text-sm font-medium
          text-foreground-subtle
        "
      >
        <Icon className="absolute left-3 size-4" aria-hidden="true" />

        {!collapsed && (
          <>
            <span className="ml-7 whitespace-nowrap">{item.label}</span>

            <span
              className={`
                ${ui.badge} ${ui.badgeNeutral}
                ml-auto
              `}
            >
              Planned
            </span>
          </>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      aria-label={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      className={`
        relative flex h-10 items-center
        rounded-control px-3 text-sm font-medium
        transition-colors duration-fast
        before:absolute before:left-0
        before:h-5 before:w-0.5
        before:rounded-full before:transition-colors
        focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-ring
        ${
          active
            ? `
              bg-selected text-selected-foreground
              before:bg-primary
            `
            : `
              text-foreground-muted
              before:bg-transparent
              hover:bg-surface-hover
              hover:text-foreground
            `
        }
      `}
    >
      <Icon className="absolute left-3 size-4" aria-hidden="true" />

      {!collapsed && (
        <span className="ml-7 whitespace-nowrap">{item.label}</span>
      )}
    </Link>
  );
}

function SidebarFooter({
  collapsed,
  footerLabel,
  onToggle,
}: {
  collapsed: boolean;
  footerLabel: string;
  onToggle: () => void;
}) {
  const toggleLabel = collapsed ? "Expand navigation" : "Collapse navigation";

  return (
    <footer className="border-t border-border p-3">
      <button
        type="button"
        onClick={onToggle}
        title={toggleLabel}
        aria-label={toggleLabel}
        aria-expanded={!collapsed}
        className="
          relative flex h-10 w-full items-center
          rounded-control text-sm font-medium
          text-foreground-muted
          transition-colors duration-fast
          hover:bg-surface-hover hover:text-foreground
          focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-ring
        "
      >
        {collapsed ? (
          <ChevronRight className="absolute left-3 size-4" aria-hidden="true" />
        ) : (
          <ChevronLeft className="absolute left-3 size-4" aria-hidden="true" />
        )}

        {!collapsed && (
          <span className="ml-10 whitespace-nowrap">Collapse sidebar</span>
        )}
      </button>

      {!collapsed && <p className={`${ui.caption} mt-3 px-3`}>{footerLabel}</p>}
    </footer>
  );
}

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
