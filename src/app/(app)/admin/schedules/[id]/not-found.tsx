import Link from "next/link";

import { ArrowLeft, CalendarX2 } from "lucide-react";

import * as ui from "@/ui/classes";

export default function ScheduleNotFound() {
  return (
    <div className={ui.page}>
      <section
        className="
          rounded-card border border-border
          bg-surface p-8 text-center shadow-card
        "
      >
        <span
          aria-hidden="true"
          className="
            mx-auto grid size-14 place-items-center
            rounded-full bg-surface-muted
            text-foreground-muted
          "
        >
          <CalendarX2 className="size-6" />
        </span>

        <p className={`${ui.caption} mt-5`}>Schedule unavailable</p>

        <h1 className={`${ui.pageTitle} mt-1`}>Schedule not found</h1>

        <p className={`${ui.bodyMuted} mx-auto mt-2 max-w-md`}>
          The selected schedule does not exist or is no longer available.
        </p>

        <Link
          href="/admin/schedules"
          className={`${ui.buttonPrimary} mt-6 inline-flex items-center gap-2`}
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to schedule planning
        </Link>
      </section>
    </div>
  );
}
