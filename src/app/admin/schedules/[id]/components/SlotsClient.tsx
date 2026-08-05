"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import * as ui from "@/ui/classes";

import AssignModal from "@/app/admin/schedules/[id]/components/AssignModal";
import Timeline from "@/app/admin/schedules/[id]/components/scheduleViews/Timeline";
import WeekGrid from "@/app/admin/schedules/[id]/components/scheduleViews/WeekGrid";
import EmployeeView from "./scheduleViews/Employee";

import ScheduleViewControls, {
  type ScheduleView,
} from "@/app/admin/schedules/[id]/components/scheduleViews/ScheduleViewControls";

import {
  ValidationErrors,
  SystemErrors,
} from "@/app/admin/schedules/[id]/components/ErrorComponents";

import {
  assignEmployeeRequest,
  scheduleActionRequest,
} from "@/app/admin/schedules/[id]/helpers/scheduleRequests";

import type {
  AssignmentValidationError,
  PublishValidationError,
  ShiftSlot,
} from "@/types/scheduling";
import type { AssignableEmployee } from "@/types/employee";
import type { UUID } from "@/types/common";

type Props = {
  periodId: UUID;
  shiftSlots: ShiftSlot[];
  employees: AssignableEmployee[];
  canAssign: boolean;
};

type ScheduleAction = "VALIDATE" | "PUBLISH";

export default function SlotsClient({
  periodId,
  shiftSlots,
  employees,
  canAssign,
}: Props) {
  const router = useRouter();

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<UUID | null>(null);
  const [isSavingAssign, setIsSavingAssign] = useState(false);

  const [assignmentValidationErrors, setAssignmentValidationErrors] = useState<
    AssignmentValidationError[]
  >([]);
  const [assignSystemError, setAssignSystemError] = useState<string | null>(
    null,
  );

  const [scheduleValidationErrors, setScheduleValidationErrors] = useState<
    PublishValidationError[]
  >([]);
  const [scheduleSystemError, setScheduleSystemError] = useState<string | null>(
    null,
  );
  const [validationSuccess, setValidationSuccess] = useState(false);

  const [isValidating, setIsValidating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const [activeView, setActiveView] = useState<ScheduleView>("TIMELINE");

  const selectedSlot = shiftSlots.find((slot) => slot.id === selectedSlotId);

  const eligibleEmployees = selectedSlot
    ? employees.filter(
        (employee) =>
          employee.departments.includes(selectedSlot.department) &&
          employee.position === selectedSlot.position,
      )
    : [];

  const isScheduleActionRunning = isValidating || isPublishing;

  function handleCloseAssignModal() {
    setIsAssignModalOpen(false);
    setSelectedSlotId(null);
    setAssignmentValidationErrors([]);
    setAssignSystemError(null);
    setIsSavingAssign(false);
  }

  function handleAssignClick(slotId: UUID) {
    if (!canAssign) return;

    setAssignmentValidationErrors([]);
    setAssignSystemError(null);
    setSelectedSlotId(slotId);
    setIsAssignModalOpen(true);
  }

  async function handleAssignConfirm(employeeId: UUID) {
    if (!selectedSlotId) {
      setAssignmentValidationErrors([
        {
          code: "NO_SLOT_SELECTED",
          message: "No slot selected.",
        },
      ]);
      return;
    }

    setAssignmentValidationErrors([]);
    setAssignSystemError(null);
    setIsSavingAssign(true);

    try {
      const result = await assignEmployeeRequest(selectedSlotId, employeeId);

      if (!result.ok) {
        setAssignmentValidationErrors(result.errors);
        return;
      }

      handleCloseAssignModal();
      router.refresh();
    } catch (error) {
      setAssignSystemError(
        error instanceof Error ? error.message : "Unexpected assignment error.",
      );
    } finally {
      setIsSavingAssign(false);
    }
  }

  async function handleScheduleAction(action: ScheduleAction) {
    setScheduleValidationErrors([]);
    setScheduleSystemError(null);
    setValidationSuccess(false);

    if (action === "VALIDATE") {
      setIsValidating(true);
    } else {
      setIsPublishing(true);
    }

    try {
      const result = await scheduleActionRequest(periodId, action);

      if (!result.ok) {
        setScheduleValidationErrors(result.errors);
        return;
      }

      if (result.action === "VALIDATE") {
        setValidationSuccess(true);
        return;
      }

      router.refresh();
    } catch (error) {
      setScheduleSystemError(
        error instanceof Error ? error.message : "Schedule action failed.",
      );
    } finally {
      setIsValidating(false);
      setIsPublishing(false);
    }
  }

  function handleCloseScheduleMessages() {
    setScheduleValidationErrors([]);
    setScheduleSystemError(null);
    setValidationSuccess(false);
  }

  return (
    <section>
      <ScheduleViewControls
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {activeView === "TIMELINE" && (
        <Timeline
          shiftSlots={shiftSlots}
          employees={employees}
          canAssign={canAssign}
          onAssignClick={handleAssignClick}
        />
      )}

      {activeView === "WEEK_GRID" && (
        <WeekGrid
          shiftSlots={shiftSlots}
          employees={employees}
          canAssign={canAssign}
          onAssignClick={handleAssignClick}
        />
      )}

      {activeView === "EMPLOYEES" && (
        <EmployeeView
          shiftSlots={shiftSlots}
          employees={employees}
          canAssign={canAssign}
          onAssignClick={handleAssignClick}
        />
      )}

      {validationSuccess && (
        <div
          role="status"
          className="mt-4 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-green-300"
        >
          <p>Schedule validation passed successfully.</p>

          <button
            type="button"
            className={`${ui.button} mt-3`}
            onClick={handleCloseScheduleMessages}
          >
            Close
          </button>
        </div>
      )}

      {canAssign && (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={ui.button}
            disabled={isScheduleActionRunning}
            onClick={() => handleScheduleAction("VALIDATE")}
          >
            {isValidating ? "Validating..." : "Validate Schedule"}
          </button>

          <button
            type="button"
            className={ui.buttonPrimary}
            disabled={isScheduleActionRunning}
            onClick={() => handleScheduleAction("PUBLISH")}
          >
            {isPublishing ? "Publishing..." : "Publish Schedule"}
          </button>
        </div>
      )}

      <ValidationErrors
        title="Schedule validation failed."
        errors={scheduleValidationErrors}
        onClose={handleCloseScheduleMessages}
      />

      <SystemErrors
        message={scheduleSystemError}
        onClose={handleCloseScheduleMessages}
      />

      {isAssignModalOpen && selectedSlotId && (
        <AssignModal
          employees={eligibleEmployees}
          onConfirm={handleAssignConfirm}
          onClose={handleCloseAssignModal}
          isSaving={isSavingAssign}
          validationErrors={assignmentValidationErrors}
          closeValidationErrors={() => setAssignmentValidationErrors([])}
          systemError={assignSystemError}
          closeSystemError={() => setAssignSystemError(null)}
        />
      )}
    </section>
  );
}
