import { notFound } from "next/navigation";
import Link from "next/link";
import getData from "@/functions/fetchData";
import { PeriodsResponse } from "@/types/scheduling";

export default async function PeriodsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const periodsData = await getData<PeriodsResponse>(
    "https://mockfast.io/backend/apitemplate/get/888213805131320/periods",
  );

  const period = periodsData.periods.find((p) => p.id === id);

  if (!period) {
    notFound();
  }

  return (
    <main>
      <section>
        <h2>Department: {period.department}</h2>
        <p>Start Date: {period.startDate}</p>
        <p>Period ID: {period.id}</p>
        <p>Status: {period.status}</p>
        <Link href="/periods">Back to periods</Link>
      </section>
    </main>
  );
}
