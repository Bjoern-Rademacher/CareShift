import getData from "@/functions/fetchData";
import { PeriodsResponse } from "@/types/scheduling";
import PeriodsClient from "./periodsClient";

export default async function PeriodsPage() {
  const periodsData = await getData<PeriodsResponse>(
    "https://mockfast.io/backend/apitemplate/get/888213805131320/periods"
  );

  console.log(periodsData);

  return (
    <main>
      <PeriodsClient periods={periodsData.periods} />
    </main>
  );
}
