import * as ui from "@/ui/classes";

type ValidationCheck = {
  label: string;
  valid: boolean | null;
};

type Props = {
  assignedCount: number;
  totalSlots: number;

  validationResult: {
    noOverlaps: boolean;
    sufficientRest: boolean;
    weeklyHoursValid: boolean;
    rollingSevenDayHoursValid: boolean;
  } | null;

  isValidating: boolean;
  isPublishing: boolean;

  onValidate: () => void;
  onPublish: () => void;
};

function CheckIndicator({ valid }: { valid: boolean | null }) {
  if (valid === null) {
    return (
      <span
        aria-label="Not validated"
        className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-600 text-xs text-slate-500"
      >
        •
      </span>
    );
  }

  if (valid) {
    return (
      <span
        aria-label="Passed"
        className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-xs text-emerald-400"
      >
        ✓
      </span>
    );
  }

  return (
    <span
      aria-label="Failed"
      className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/15 text-xs text-red-400"
    >
      ×
    </span>
  );
}

function ChecklistItem({ label, valid }: ValidationCheck) {
  return (
    <li className="flex items-center gap-3">
      <CheckIndicator valid={valid} />

      <span
        className={
          valid === false ? "text-sm text-red-300" : "text-sm text-slate-300"
        }
      >
        {label}
      </span>
    </li>
  );
}

export default function PublishChecklist({
  assignedCount,
  totalSlots,
  validationResult,
  isValidating,
  isPublishing,
  onValidate,
  onPublish,
}: Props) {
  const assignmentsComplete = totalSlots > 0 && assignedCount === totalSlots;

  const checks: ValidationCheck[] = [
    {
      label: `${assignedCount} / ${totalSlots} shifts assigned`,
      valid: assignmentsComplete,
    },
    {
      label: "No overlapping shifts",
      valid: validationResult?.noOverlaps ?? null,
    },
    {
      label: "Minimum rest periods",
      valid: validationResult?.sufficientRest ?? null,
    },
    {
      label: "Weekly hour limits",
      valid: validationResult?.weeklyHoursValid ?? null,
    },
    {
      label: "7-day hour limits",
      valid: validationResult?.rollingSevenDayHoursValid ?? null,
    },
  ];

  const validationPassed =
    validationResult !== null &&
    assignmentsComplete &&
    validationResult.noOverlaps &&
    validationResult.sufficientRest &&
    validationResult.weeklyHoursValid &&
    validationResult.rollingSevenDayHoursValid;

  const actionRunning = isValidating || isPublishing;

  return (
    <aside className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-slate-100">Publish Checklist</h2>

          <p className="mt-1 text-xs text-slate-500">
            Validate the current schedule before publishing.
          </p>
        </div>

        {validationPassed && (
          <span className="whitespace-nowrap rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
            Ready
          </span>
        )}
      </div>

      <ul className="mt-4 space-y-3">
        {checks.map((check) => (
          <ChecklistItem
            key={check.label}
            label={check.label}
            valid={check.valid}
          />
        ))}
      </ul>

      <div className="mt-5 border-t border-slate-800 pt-4">
        {validationResult === null ? (
          <p className="mb-3 text-xs text-slate-500">
            Validation required for the current schedule.
          </p>
        ) : validationPassed ? (
          <p className="mb-3 text-xs text-emerald-400">
            Schedule is ready to publish.
          </p>
        ) : (
          <p className="mb-3 text-xs text-red-300">
            Resolve validation problems before publishing.
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            className={`${ui.button} flex-1`}
            disabled={actionRunning}
            onClick={onValidate}
          >
            {isValidating ? "Validating..." : "Validate"}
          </button>

          <button
            type="button"
            className={`${ui.buttonPrimary} flex-1`}
            disabled={!validationPassed || actionRunning}
            onClick={onPublish}
          >
            {isPublishing ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>
    </aside>
  );
}
