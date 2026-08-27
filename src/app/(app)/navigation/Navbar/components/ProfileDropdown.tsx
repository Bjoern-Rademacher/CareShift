"use client";

import { useEffect, useRef } from "react";

import Link from "next/link";

import { ChevronIcon } from "./NavbarIcons";

import type { CurrentUser } from "@/types/auth";

type Props = {
  user: CurrentUser;
  logoutAction: () => Promise<void>;
};

export default function ProfileDropdown({ user, logoutAction }: Props) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function closeDropdown() {
      if (detailsRef.current) {
        detailsRef.current.open = false;
      }
    }

    function handlePointerDown(event: PointerEvent) {
      const details = detailsRef.current;

      if (
        details?.open &&
        event.target instanceof Node &&
        !details.contains(event.target)
      ) {
        closeDropdown();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || !detailsRef.current?.open) {
        return;
      }

      closeDropdown();
      detailsRef.current.querySelector("summary")?.focus();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const fullName = `${user.firstName} ${user.lastName}`;
  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  const showProfile = user.role !== "DISPLAY";

  return (
    <details ref={detailsRef} className="group relative">
      <summary
        className="
          flex h-11 min-w-0 cursor-pointer list-none
          items-center gap-3 rounded-control border border-border
          bg-surface-muted px-2.5 transition-colors
          hover:bg-surface-hover
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-ring
          [&::-webkit-details-marker]:hidden
        "
      >
        <span
          aria-hidden="true"
          className="
            grid size-8 shrink-0 place-items-center rounded-full
            bg-selected text-xs font-semibold
            text-selected-foreground
          "
        >
          {initials}
        </span>

        <span className="hidden min-w-0 text-left sm:block">
          <span className="block truncate text-sm font-medium text-foreground">
            {fullName}
          </span>

          <span className="block truncate text-xs text-foreground-subtle">
            {formatRole(user.role)}
          </span>
        </span>

        <ChevronIcon />
      </summary>

      <div
        className="
          absolute right-0 z-50 mt-2 w-60 overflow-hidden
          rounded-card border border-border bg-surface shadow-card
        "
      >
        <div
          className={
            "px-4 py-3 " + (showProfile ? "border-b border-border" : "")
          }
        >
          <p className="truncate text-sm font-medium text-foreground">
            {fullName}
          </p>

          <p className="mt-0.5 text-xs text-foreground-subtle">
            {formatRole(user.role)}
          </p>
        </div>

        {showProfile && (
          <div className="p-2">
            <Link
              href="/profile"
              className="
                flex h-10 items-center rounded-control px-3
                text-sm text-foreground-muted transition-colors
                hover:bg-surface-hover hover:text-foreground
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-ring
              "
            >
              Profile
            </Link>
          </div>
        )}

        <form action={logoutAction} className="border-t border-border p-2">
          <button
            type="submit"
            className="
              flex h-10 w-full items-center rounded-control px-3
              text-left text-sm text-danger transition-colors
              hover:bg-danger-muted
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-danger
            "
          >
            Log out
          </button>
        </form>
      </div>
    </details>
  );
}

function formatRole(role: string) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}
