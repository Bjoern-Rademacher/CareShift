"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { LoaderCircle, Plus, X } from "lucide-react";

import * as ui from "@/ui/classes";

import { createSchedule } from "@/lib/api/createSchedule";

import type { Departments } from "@/types/common";

type DefaultProps = {
  size?: "default";
  department?: Departments;
  weekStart?: Date;
  dimmed?: boolean;
};

type CompactProps = {
  size: "compact";
  department: Departments;
  weekStart: Date;
  dimmed?: never;
};

type Props = DefaultProps | CompactProps;

export default function CreateScheduleButton(props: Props) {
  const router = useRouter();

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleQuickCreate() {
    if (props.size !== "compact" || pending) {
      return;
    }

    setPending(true);
    setError(null);

    try {
      const result = await createSchedule({
        department: props.department,
        weekStartDate: props.weekStart.toISOString().slice(0, 10),
      });

      if (!result.ok) {
        setError(
          result.code === "SCHEDULE_ALREADY_EXISTS"
            ? "Already exists"
            : "Create failed",
        );

        if (result.code === "SCHEDULE_ALREADY_EXISTS") {
          router.refresh();
        }

        return;
      }

      router.refresh();
    } catch {
      setError("Request failed");
    } finally {
      setPending(false);
    }
  }

  if (props.size === "compact") {
    return (
      <div className={`flex items-center justify-end gap-2`}>
        {error ? (
          <>
            <span role="alert" className={`${ui.badge} ${ui.badgeDanger}`}>
              {error}
            </span>

            <button
              type="button"
              onClick={() => setError(null)}
              aria-label="Dismiss error"
              className="
                grid size-5 shrink-0 place-items-center
                rounded-full text-danger
                transition-colors duration-fast
                hover:bg-danger-muted hover:text-danger
                focus-visible:outline-none
                focus-visible:ring-2 focus-visible:ring-ring
              "
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleQuickCreate}
            disabled={pending}
            aria-label="Create schedule"
            className="
              group inline-flex items-center gap-2
              rounded-control text-primary
              focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-ring
              disabled:cursor-wait disabled:opacity-70
            "
          >
            <span
              className="
                inline-flex items-center rounded-full
                border border-primary/50
                bg-primary/20 px-2.5 py-1
                text-xs font-semibold leading-4
                transition-colors duration-fast
                group-hover:bg-primary/30
                group-hover:text-primary-hover
              "
            >
              {pending ? "Creating…" : "Create Schedule"}
            </span>
            {pending ? (
              <LoaderCircle
                className="size-4 shrink-0 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Plus
                className="
                  size-4 shrink-0
                  transition-transform duration-fast
                  group-hover:scale-110
                "
                aria-hidden="true"
              />
            )}
          </button>
        )}
      </div>
    );
  }

  const appearanceClass = props.dimmed
    ? `
      rounded-control border border-primary/50
      bg-primary/25 px-3 py-2
      text-sm font-semibold text-primary
      hover:bg-primary/35 hover:text-primary-hover
    `
    : ui.buttonPrimary;

  return (
    <Link
      href={{
        pathname: "/admin/schedules/create",

        query: {
          ...(props.department && {
            department: props.department,
          }),

          ...(props.weekStart && {
            weekStart: props.weekStart.toISOString().slice(0, 10),
          }),
        },
      }}
      className={`
        inline-flex items-center gap-2
        transition-colors duration-fast
        ${appearanceClass}
      `}
    >
      <Plus className="size-4 shrink-0" aria-hidden="true" />
      <span>Create Schedule</span>
    </Link>
  );
}
