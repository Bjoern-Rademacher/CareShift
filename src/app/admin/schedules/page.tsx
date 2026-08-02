import PeriodsClient from "./periodsClient";
import { getSchedulePeriods } from "@/lib/db/schedulePeriods";
import { mapSchedulePeriodToSchedule } from "@/lib/db/mappers";

export default async function PeriodsPage() {
  const data = await getSchedulePeriods();
  const periods = data.map(mapSchedulePeriodToSchedule);
  return (
    <main>
      <PeriodsClient periods={periods} />
    </main>
  );
}
