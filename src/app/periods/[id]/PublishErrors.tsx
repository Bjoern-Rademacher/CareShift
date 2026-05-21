import * as ui from "@/ui/classes";

import type { ValidationError } from "@/types/scheduling";

type Props = {
  errors: ValidationError[];
  onClose: () => void;
};

export default function PublishErrors({ errors, onClose }: Props) {
  if (errors.length === 0) return null;

  return (
    <div className={ui.errorAlert}>
      <h2>Cannot publish schedule.</h2>

      <ul>
        {errors.map((error, index) => (
          <li key={index}>{error.message}</li>
        ))}
      </ul>

      <button className={ui.button} onClick={onClose}>
        Close
      </button>
    </div>
  );
}
