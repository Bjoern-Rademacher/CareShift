// import getData from "@/functions/fetchData";
import { PeriodsResponse } from "@/types/scheduling";
import { mockPeriods } from "@/lib/mock/periods";

import PeriodsClient from "./periodsClient";

export default async function PeriodsPage() {
  // const periodsData = await getData<PeriodsResponse>("/api/mockPeriods");
  const periodsData: PeriodsResponse = {
    periods: mockPeriods,
  };

  return (
    <main>
      <PeriodsClient periods={periodsData.periods} />
    </main>
  );
}
