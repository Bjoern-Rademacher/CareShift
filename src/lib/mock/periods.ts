import type { SchedulePeriod } from "@/types/scheduling";
import { createISODateString } from "@/lib/functions/dateTimeUtils";
import { periodIds } from "./id_s";

const iso = createISODateString;

export const mockPeriods: SchedulePeriod[] = [
  {
    id: periodIds.erWeek1,
    department: "ER",
    startDate: iso("2026-05-04T00:00:00Z"),
    endDate: iso("2026-05-10T23:59:59Z"),
    status: "draft",
  },
  {
    id: periodIds.icuWeek1,
    department: "ICU",
    startDate: iso("2026-05-04T00:00:00Z"),
    endDate: iso("2026-05-10T23:59:59Z"),
    status: "draft",
  },
  {
    id: periodIds.surgeryWeek1,
    department: "SURGERY",
    startDate: iso("2026-05-04T00:00:00Z"),
    endDate: iso("2026-05-10T23:59:59Z"),
    status: "published",
  },
];
