import { Check, CheckCircle2, FilePenLine } from "lucide-react";

import * as ui from "@/ui/classes";

import type { LucideIcon } from "lucide-react";
import type { PeriodStatus } from "@/types/scheduling";

type StatusMeta = {
  label: string;
  className: string;
  icon: LucideIcon;
};

const statusMeta: Record<PeriodStatus, StatusMeta> = {
  DRAFT: {
    label: "Draft",
    className: ui.badgeWarning,
    icon: FilePenLine,
  },

  VALIDATED: {
    label: "Validated",
    className: ui.badgeInfo,
    icon: CheckCircle2,
  },

  PUBLISHED: {
    label: "Published",
    className: ui.badgeSuccess,
    icon: Check,
  },
};

export default function ScheduleStatusBadge({
  status,
}: {
  status: PeriodStatus;
}) {
  const meta = statusMeta[status];
  const Icon = meta.icon;

  return (
    <span
      className={`${ui.badge} ${meta.className} inline-flex items-center gap-1.5`}
    >
      {meta.label}

      <Icon
        className="size-3.5 shrink-0"
        strokeWidth={2.5}
        aria-hidden="true"
      />
    </span>
  );
}
