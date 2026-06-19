import { getSchedulePeriodById } from "@/lib/db/schedulePeriods";

export default async function test() {
  const periods = await getSchedulePeriodById("period-er-2026-05-04");
  console.log(periods);
  return (
    <article>
      <h1>Test</h1>
    </article>
  );
}
