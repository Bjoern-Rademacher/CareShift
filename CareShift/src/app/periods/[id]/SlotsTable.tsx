import { ShiftSlot } from "@/types/scheduling";

type Props = {
  shiftSlots: ShiftSlot[];
};

function formatDateTime(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default function SlotsTable({ shiftSlots }: Props) {
  if (shiftSlots.length === 0) {
    return <p>No slots for this period available.</p>;
  }
  return (
    <article className="mt-6 overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left">
            <th className="border-b p-2">Start</th>
            <th className="border-b p-2">End</th>
            <th className="border-b p-2">Position</th>
          </tr>
        </thead>
        <tbody>
          {shiftSlots.map((slot) => (
            <tr key={slot.id}>
              <td className="border-b p-2">{formatDateTime(slot.startTime)}</td>
              <td className="border-b p-2">{formatDateTime(slot.endTime)}</td>
              <td className="border-b p-2">{slot.position}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
}
