import * as ui from "@/ui/classes";

import type {
  AssignmentValidationError,
  scheduleValidationError,
} from "@/types/scheduling";

type ErrorListItem = AssignmentValidationError | scheduleValidationError;

type ErrorListProps = {
  errors: ErrorListItem[];
  title: string;
  onClose?: () => void;
};

type ErrorMessageProps = {
  message: string | null;
  onClose?: () => void;
};

export function ErrorList({ errors, title, onClose }: ErrorListProps) {
  if (errors.length === 0) {
    return null;
  }

  return (
    <details className="rounded-control border border-danger-border bg-danger-muted">
      <summary className="cursor-pointer select-none px-3 py-2 text-sm font-medium text-danger">
        {title}
      </summary>

      <div className="border-t border-danger-border px-3 py-3">
        <ul className="space-y-1">
          {errors.map((error, index) => (
            <li key={`${error.code}-${index}`} className={ui.bodyText}>
              {error.message}
            </li>
          ))}
        </ul>

        {onClose && (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-medium text-danger transition-colors duration-fast hover:text-foreground"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </details>
  );
}

export function ErrorMessage({ message, onClose }: ErrorMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <div className="flex items-start justify-between gap-4 rounded-control border border-danger-border bg-danger-muted px-3 py-2">
      <p className="text-sm text-danger">{message}</p>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-sm font-medium text-danger transition-colors duration-fast hover:text-foreground"
        >
          Close
        </button>
      )}
    </div>
  );
}
