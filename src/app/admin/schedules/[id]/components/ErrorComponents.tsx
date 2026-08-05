import * as ui from "@/ui/classes";

import type {
  PublishValidationError,
  AssignmentValidationError,
} from "@/types/scheduling";

type ValidationErrorProps = {
  errors: PublishValidationError[] | AssignmentValidationError[];
  onClose: () => void;
  title: string;
};

type SystemErrorProps = {
  message: string | null;
  onClose?: () => void;
};

export function ValidationErrors({
  errors,
  onClose,
  title,
}: ValidationErrorProps) {
  if (errors.length === 0) return null;

  return (
    <div className={ui.errorAlert}>
      <h2>{title}</h2>

      <ul>
        {errors.map((error, index) => (
          <li key={`${error.code}-${index}`}>{error.message}</li>
        ))}
      </ul>

      <button className={ui.button} onClick={onClose}>
        Close
      </button>
    </div>
  );
}

export function SystemErrors({ message, onClose }: SystemErrorProps) {
  if (!message) return null;

  return (
    <div className={ui.errorAlert}>
      <p>{message}</p>

      {onClose && (
        <button className={ui.button} onClick={onClose}>
          Close
        </button>
      )}
    </div>
  );
}
