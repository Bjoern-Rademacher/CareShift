"use client";

// React / Next
import { useState } from "react";
import { useRouter } from "next/navigation";

// UI
import * as ui from "@/ui/classes";

import AssignModal from "@/app/admin/schedules/[id]/components/AssignModal";
import {
  ValidationErrors,
  SystemErrors,
} from "@/app/admin/schedules/[id]/components/ErrorComponents";

import Timeline from "@/app/admin/schedules/[id]/components/scheduleViews/Timeline";
import WeekGrid from "@/app/admin/schedules/[id]/components/scheduleViews/WeekGrid";
import EmployeeView from "@/app/admin/schedules/[id]/components/scheduleViews/Employee";
import ScheduleControls from "@/app/admin/schedules/[id]/components/scheduleViews/ScheduleControls";

// Client requests
import {
  assignEmployeeRequest,
  getAssignmentCandidatesRequest,
  scheduleActionRequest,
} from "@/app/admin/schedules/[id]/helpers/scheduleRequests";

// Helpers / constants
import { filterSchedule } from "@/app/admin/schedules/[id]/helpers/filterSchedule";
import { SHIFT_GROUPS, WEEKDAYS } from "@/lib/constants/schedule";

// Types
import type { UUID } from "@/types/common";
import type { AssignableEmployee } from "@/types/employee";
import type { EmployeeAssignmentCandidate } from "@/types/assignment";
import type {
  AssignmentValidationError,
  PublishValidationError,
  ShiftSlot,
} from "@/types/scheduling";
import type { ScheduleFilters, ScheduleView } from "@/types/view";

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

  // Assignment modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<UUID | null>(null);

  const [assignmentCandidates, setAssignmentCandidates] = useState<
    EmployeeAssignmentCandidate[]
  >([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [candidateLoadError, setCandidateLoadError] = useState<string | null>(
    null,
  );

  // Assignment request
  const [isSavingAssign, setIsSavingAssign] = useState(false);
  const [assignmentValidationErrors, setAssignmentValidationErrors] = useState<
    AssignmentValidationError[]
  >([]);
  const [assignSystemError, setAssignSystemError] = useState<string | null>(
    null,
  );

  // Schedule validation / publishing
  const [scheduleValidationErrors, setScheduleValidationErrors] = useState<
    PublishValidationError[]
  >([]);
  const [scheduleSystemError, setScheduleSystemError] = useState<string | null>(
    null,
  );
  const [validationSuccess, setValidationSuccess] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Schedule view / filtering
  const [activeView, setActiveView] = useState<ScheduleView>("TIMELINE");

  const [filters, setFilters] = useState<ScheduleFilters>({
    weekdays: [...WEEKDAYS],
    shiftGroups: [...SHIFT_GROUPS],
    assignment: "ALL",
  });

  const filteredShiftSlots = filterSchedule(shiftSlots, filters);

  const isScheduleActionRunning = isValidating || isPublishing;

  function handleCloseAssignModal() {
    setIsAssignModalOpen(false);
    setSelectedSlotId(null);

    setAssignmentCandidates([]);
    setIsLoadingCandidates(false);
    setCandidateLoadError(null);

    setAssignmentValidationErrors([]);
    setAssignSystemError(null);
    setIsSavingAssign(false);
  }

  // Open immediately, then load fresh cross-period assignment information.
  async function handleOpenAssignModal(slotId: UUID) {
    if (!canAssign) return;

    setSelectedSlotId(slotId);
    setIsAssignModalOpen(true);

    setAssignmentCandidates([]);
    setCandidateLoadError(null);
    setAssignmentValidationErrors([]);
    setAssignSystemError(null);
    setIsLoadingCandidates(true);

    try {
      const candidates = await getAssignmentCandidatesRequest(slotId);

      setAssignmentCandidates(candidates);
    } catch (error) {
      setCandidateLoadError(
        error instanceof Error
          ? error.message
          : "Could not load assignment candidates.",
      );
    } finally {
      setIsLoadingCandidates(false);
    }
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
      <ScheduleControls
        activeView={activeView}
        filters={filters}
        onViewChange={setActiveView}
        onFiltersChange={setFilters}
      />

      {activeView === "TIMELINE" && (
        <Timeline
          shiftSlots={filteredShiftSlots}
          employees={employees}
          canAssign={canAssign}
          onAssignClick={handleOpenAssignModal}
        />
      )}

      {activeView === "WEEK_GRID" && (
        <WeekGrid
          shiftSlots={filteredShiftSlots}
          employees={employees}
          canAssign={canAssign}
          onAssignClick={handleOpenAssignModal}
        />
      )}

      {activeView === "EMPLOYEES" && (
        <EmployeeView
          shiftSlots={filteredShiftSlots}
          employees={employees}
          canAssign={canAssign}
          onAssignClick={handleOpenAssignModal}
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
          candidates={assignmentCandidates}
          isLoadingCandidates={isLoadingCandidates}
          candidateLoadError={candidateLoadError}
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
