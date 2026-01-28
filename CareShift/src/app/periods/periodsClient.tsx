"use client";
import { useState } from "react";

import type { SchedulePeriod } from "@/types/scheduling";
import type { Departments } from "@/types/common";
import { DEPARTMENTS } from "@/types/common";

type Props = Readonly<{
  periods: SchedulePeriod[];
}>;

function formatDateOnly(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  let day = d.getDay();

  if (day === 0) {
    day = 7;
  }

  const diff = day - 1;
  d.setDate(d.getDate() - diff);
  d.setHours(12, 0, 0, 0);

  return d;
}

function parseDateOnly(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// mit dem Montag können wir die periods auswählen

export default function PeriodsClient({ periods }: Props) {
  const [selectedDepartment, setSelectedDepartment] =
    useState<Departments>("ER");

  const [selectedMonday, setSelectedMonday] = useState<string>(() =>
    formatDateOnly(getMonday(new Date())),
  );

  const filteredPeriods = periods.filter(
    (p) =>
      p.department === selectedDepartment &&
      p.startDate.slice(0, 10) === selectedMonday,
  );

  function changeMonday(direction: "previous" | "next") {
    const delta = direction === "previous" ? -7 : 7;
    const date = parseDateOnly(selectedMonday);

    date.setDate(date.getDate() + delta);
    date.setHours(12, 0, 0, 0);

    setSelectedMonday(formatDateOnly(date));
  }

  return (
    <section>
      <h1 className="font-semibold">CLIENT</h1>
      <select
        value={selectedDepartment}
        onChange={(e) => setSelectedDepartment(e.target.value as Departments)}
      >
        {DEPARTMENTS.map((dept) => (
          <option key={dept} value={dept}>
            {dept}
          </option>
        ))}
      </select>
      <button onClick={() => changeMonday("previous")}>PREVIOUS</button>
      <input
        type="date"
        value={selectedMonday}
        onChange={(e) => {
          const picked = parseDateOnly(e.target.value);
          const monday = getMonday(picked);
          setSelectedMonday(formatDateOnly(monday));
          console.log(selectedMonday);
        }}
      />
      <button className="border-red-500" onClick={() => changeMonday("next")}>
        NEXT
      </button>
      <p className="mt-4">
        selected week is <strong>{selectedMonday}</strong>
      </p>
      <ul className="mt-2">
        {filteredPeriods.length === 0 ? (
          <li>No data for this week</li>
        ) : (
          filteredPeriods.map((p) => <li key={p.id}>{p.startDate}</li>)
        )}
      </ul>
    </section>
  );
}
