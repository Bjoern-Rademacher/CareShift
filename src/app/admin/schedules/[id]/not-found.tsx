import Link from "next/link";

export default async function detailsNotFound() {
  return (
    <main>
      <h1>404 - not found</h1>
      <p>Sorry, but we could not find any data for the selected period.</p>
      <Link href="/schedules">Back to schedules</Link>
    </main>
  );
}
