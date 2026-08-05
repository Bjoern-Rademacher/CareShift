import * as ui from "@/ui/classes";

export type ScheduleView = "TIMELINE" | "WEEK_GRID" | "EMPLOYEES";

type Props = {
  activeView: ScheduleView;
  onViewChange: (view: ScheduleView) => void;
};

const VIEW_OPTIONS: Array<{
  value: ScheduleView;
  label: string;
}> = [
  {
    value: "TIMELINE",
    label: "Timeline",
  },
  {
    value: "WEEK_GRID",
    label: "Week Grid",
  },
  {
    value: "EMPLOYEES",
    label: "Employees",
  },
];

export default function ScheduleViewControls({
  activeView,
  onViewChange,
}: Props) {
  return (
    <nav
      aria-label="Schedule view"
      className="mb-6 flex flex-wrap items-center gap-2"
    >
      <span className="mr-2 text-sm font-medium text-slate-400">View:</span>

      {VIEW_OPTIONS.map((option) => {
        const isActive = activeView === option.value;

        return (
          <button
            key={option.value}
            type="button"
            className={isActive ? ui.buttonPrimary : ui.button}
            aria-pressed={isActive}
            onClick={() => onViewChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </nav>
  );
}
