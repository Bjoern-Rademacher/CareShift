import * as ui from "@/ui/classes";

import { ErrorList, ErrorMessage } from "@/lib/components/ErrorComponents";
import ScheduleStatusBadge from "@/lib/components/ScheduleStatusBadge";

import type {
  PeriodStatus,
  ScheduleValidationResult,
  schedulePublishError,
  scheduleValidationError,
  scheduleValidationErrorCode,
} from "@/types/scheduling";

type ValidationCheck = {
  label: string;
  valid: boolean | null;
};

type Props = {
  status: PeriodStatus;
  assignedCount: number;
  totalSlots: number;
  validationResult: ScheduleValidationResult | null;
  validationErrors: scheduleValidationError[];
  publishError: schedulePublishError | null;
  closeValidationErrors: () => void;
  closePublishError: () => void;
  isValidating: boolean;
  isPublishing: boolean;
  mutationRunning: boolean;
  onValidate: () => void;
  onPublish: () => void;
};

function hasValidationError(
  errors: scheduleValidationError[],
  code: scheduleValidationErrorCode,
) {
  return errors.some((error) => error.code === code);
}

function CheckIndicator({ valid }: { valid: boolean | null }) {
  if (valid === null) {
    return (
      <span
        aria-label="Not validated"
        className="flex size-5 items-center justify-center rounded-full border border-border-strong text-xs text-foreground-subtle"
      >
        •
      </span>
    );
  }

  if (valid) {
    return (
      <span
        aria-label="Passed"
        className="flex size-5 items-center justify-center rounded-full bg-success-muted text-xs text-success"
      >
        ✓
      </span>
    );
  }

  return (
    <span
      aria-label="Failed"
      className="flex size-5 items-center justify-center rounded-full bg-danger-muted text-xs text-danger"
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
          valid === false ? "text-sm text-danger" : "text-sm text-foreground"
        }
      >
        {label}
      </span>
    </li>
  );
}

export default function PublishChecklist({
  status,
  assignedCount,
  totalSlots,
  validationResult,
  validationErrors,
  publishError,
  closeValidationErrors,
  closePublishError,
  isValidating,
  isPublishing,
  mutationRunning,
  onValidate,
  onPublish,
}: Props) {
  const assignmentsComplete = totalSlots > 0 && assignedCount === totalSlots;

  const hasOverlapError = hasValidationError(
    validationErrors,
    "DOUBLE_ASSIGNMENT",
  );
  const hasRestError = hasValidationError(
    validationErrors,
    "INSUFFICIENT_REST",
  );
  const hasWeeklyHoursError = hasValidationError(
    validationErrors,
    "WEEKLY_HOURS_EXCEEDED",
  );

  const checks: ValidationCheck[] = [
    {
      label: `${assignedCount} / ${totalSlots} shifts assigned`,
      valid: assignmentsComplete,
    },
    {
      label: "No overlapping shifts",
      valid: hasOverlapError ? false : (validationResult?.noOverlaps ?? null),
    },
    {
      label: "Minimum rest periods",
      valid: hasRestError ? false : (validationResult?.sufficientRest ?? null),
    },
    {
      label: "Weekly hour limits",
      valid: hasWeeklyHoursError
        ? false
        : (validationResult?.weeklyHoursValid ?? null),
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

  const isDraft = status === "DRAFT";
  const isValidated = status === "VALIDATED";
  const isPublished = status === "PUBLISHED";

  return (
    <aside className="rounded-card border border-border bg-surface p-4 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className={ui.sectionTitle}>Publish Checklist</h2>

          <p className={`${ui.caption} mt-1`}>
            Validate the current schedule before publishing.
          </p>
        </div>

        {isPublished ? (
          <ScheduleStatusBadge status="PUBLISHED" />
        ) : (
          validationPassed && (
            <span
              className={`${ui.badge} ${ui.badgeSuccess} whitespace-nowrap`}
            >
              Ready
            </span>
          )
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

      <div className="mt-4 space-y-2">
        <ErrorList
          title="Validation errors"
          errors={validationErrors}
          onClose={closeValidationErrors}
        />

        <ErrorMessage message={publishError} onClose={closePublishError} />
      </div>

      <div className="mt-5 border-t border-border pt-4">
        {isPublished ? (
          <p className="mb-3 text-xs text-success">Schedule is published.</p>
        ) : validationErrors.length > 0 ? (
          <p className="mb-3 text-xs text-danger">
            Resolve validation problems before publishing.
          </p>
        ) : validationResult === null ? (
          <p className={`${ui.caption} mb-3`}>
            Validation required for the current schedule.
          </p>
        ) : validationPassed ? (
          <p className="mb-3 text-xs text-success">
            Schedule is ready to publish.
          </p>
        ) : (
          <p className="mb-3 text-xs text-danger">
            Resolve validation problems before publishing.
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            className={`${ui.button} flex-1`}
            disabled={!isDraft || mutationRunning}
            onClick={onValidate}
          >
            {isValidating ? "Validating…" : "Validate"}
          </button>

          <button
            type="button"
            className={`${ui.buttonPrimary} flex-1`}
            disabled={!isValidated || !validationPassed || mutationRunning}
            onClick={onPublish}
          >
            {isPublishing ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>
    </aside>
  );
}
