"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import * as ui from "@/ui/classes";

import AssignModal from "@/app/(app)/admin/schedules/[id]/components/AssignModal";
import PublishChecklist from "@/app/(app)/admin/schedules/[id]/components/PublishChecklist";
import ReturnToDraftModal from "@/app/(app)/admin/schedules/[id]/components/ReturnToDraftModal";
import ScheduleControls from "@/app/(app)/admin/schedules/[id]/components/ScheduleControls";
import ScheduleHeader from "@/app/(app)/admin/schedules/[id]/components/ScheduleHeader";
import ScheduleStatistics from "@/app/(app)/admin/schedules/[id]/components/ScheduleStatistics";
import EmployeeView from "@/app/(app)/admin/schedules/[id]/components/scheduleViews/Employee";
import Timeline from "@/app/(app)/admin/schedules/[id]/components/scheduleViews/Timeline";
import WeekGrid from "@/app/(app)/admin/schedules/[id]/components/scheduleViews/WeekGrid";

import { ErrorMessage } from "@/lib/components/ErrorComponents";

import { filterSchedule } from "@/app/(app)/admin/schedules/[id]/helpers/filterSchedule";
import {
  assignEmployeeRequest,
  autofillScheduleRequest,
  getAssignmentCandidatesRequest,
  returnScheduleToDraftRequest,
  scheduleActionRequest,
} from "@/app/(app)/admin/schedules/[id]/helpers/scheduleRequests";

import { SHIFT_GROUPS, WEEKDAYS } from "@/lib/constants/schedule";

import type { EmployeeAssignmentCandidate } from "@/types/assignment";
import type { AutofillResult } from "@/types/autofill";
import type { UUID } from "@/types/common";
import type { AssignableEmployee } from "@/types/employee";
import type {
  AssignmentValidationError,
  ScheduleAction,
  SchedulePeriod,
  ScheduleValidationResult,
  schedulePublishError,
  scheduleValidationError,
  ShiftSlot,
} from "@/types/scheduling";
import type { ScheduleFilters, ScheduleView } from "@/types/view";

type Props = {
  schedulePeriod: SchedulePeriod;
  shiftSlots: ShiftSlot[];
  employees: AssignableEmployee[];
  canEdit: boolean;
};

type ScheduleMutation =
  | "ASSIGN"
  | "AUTOFILL"
  | "VALIDATE"
  | "PUBLISH"
  | "RETURN_TO_DRAFT";

const SUCCESSFUL_VALIDATION: ScheduleValidationResult = {
  noOverlaps: true,
  sufficientRest: true,
  weeklyHoursValid: true,
  rollingSevenDayHoursValid: true,
};

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export default function SlotsClient({
  schedulePeriod,
  shiftSlots,
  employees,
  canEdit,
}: Props) {
  const router = useRouter();

  // Used to offset the sticky checklist.
  const controlsRef = useRef<HTMLDivElement>(null);

  // Used to cancel stale candidate requests.
  const candidateRequestRef = useRef<AbortController | null>(null);

  const [controlsHeight, setControlsHeight] = useState(0);

  // Blocks concurrent mutations.
  const [activeMutation, setActiveMutation] = useState<ScheduleMutation | null>(
    null,
  );

  // Return-to-draft modal state.
  const [isReturnToDraftModalOpen, setIsReturnToDraftModalOpen] =
    useState(false);

  const [returnToDraftError, setReturnToDraftError] = useState<string | null>(
    null,
  );

  // Assignment modal state.
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<UUID | null>(null);
  const [savingEmployeeId, setSavingEmployeeId] = useState<UUID | null>(null);

  const [assignmentCandidates, setAssignmentCandidates] = useState<
    EmployeeAssignmentCandidate[]
  >([]);

  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);

  const [candidateLoadError, setCandidateLoadError] = useState<string | null>(
    null,
  );

  const [assignmentValidationErrors, setAssignmentValidationErrors] = useState<
    AssignmentValidationError[]
  >([]);

  const [assignSystemError, setAssignSystemError] = useState<string | null>(
    null,
  );

  // Schedule action feedback.
  const [scheduleValidationErrors, setScheduleValidationErrors] = useState<
    scheduleValidationError[]
  >([]);

  const [schedulePublishError, setSchedulePublishError] =
    useState<schedulePublishError | null>(null);

  const [scheduleSystemError, setScheduleSystemError] = useState<string | null>(
    null,
  );

  // Non-draft schedules were already validated by the server.
  const [validationResult, setValidationResult] =
    useState<ScheduleValidationResult | null>(
      schedulePeriod.status === "VALIDATED" ||
        schedulePeriod.status === "PUBLISHED"
        ? SUCCESSFUL_VALIDATION
        : null,
    );

  const [autofillResult, setAutofillResult] = useState<AutofillResult | null>(
    null,
  );

  const [activeView, setActiveView] = useState<ScheduleView>("TIMELINE");

  const [filters, setFilters] = useState<ScheduleFilters>({
    weekdays: [...WEEKDAYS],
    shiftGroups: [...SHIFT_GROUPS],
    assignment: "ALL",
  });

  // Filters affect the displayed slots only.
  const filteredShiftSlots = filterSchedule(shiftSlots, filters);

  const selectedSlot = shiftSlots.find((slot) => slot.id === selectedSlotId);

  const assignedCount = shiftSlots.filter(
    (slot) => slot.employeeId !== null,
  ).length;

  const mutationRunning = activeMutation !== null;
  const isAutofilling = activeMutation === "AUTOFILL";
  const isValidating = activeMutation === "VALIDATE";
  const isPublishing = activeMutation === "PUBLISH";
  const isReturningToDraft = activeMutation === "RETURN_TO_DRAFT";

  // Keep the sticky offset current.
  useEffect(() => {
    const element = controlsRef.current;

    if (!element) {
      return;
    }

    const updateHeight = () => {
      setControlsHeight(element.getBoundingClientRect().height);
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  function clearAssignmentMessages() {
    setAssignmentValidationErrors([]);
    setAssignSystemError(null);
  }

  function clearScheduleMessages() {
    setScheduleValidationErrors([]);
    setSchedulePublishError(null);
    setScheduleSystemError(null);
  }

  function invalidateScheduleValidation() {
    // Assignment changes invalidate validation.
    setValidationResult(null);
    clearScheduleMessages();
  }

  function resetAssignModal() {
    // Cancel candidate loading for the previous slot.
    candidateRequestRef.current?.abort();
    candidateRequestRef.current = null;

    setIsAssignModalOpen(false);
    setSelectedSlotId(null);
    setSavingEmployeeId(null);
    setAssignmentCandidates([]);
    setIsLoadingCandidates(false);
    setCandidateLoadError(null);

    clearAssignmentMessages();
  }

  function handleCloseAssignModal() {
    // Keep the modal open while saving.
    if (activeMutation === "ASSIGN") {
      return;
    }

    resetAssignModal();
  }

  async function handleOpenAssignModal(slotId: UUID) {
    // Draft-only; mutations cannot overlap.
    if (!canEdit || mutationRunning) {
      return;
    }

    const controller = new AbortController();
    candidateRequestRef.current = controller;

    setSelectedSlotId(slotId);
    setIsAssignModalOpen(true);
    setAssignmentCandidates([]);
    setCandidateLoadError(null);
    setIsLoadingCandidates(true);

    clearAssignmentMessages();

    try {
      const candidates = await getAssignmentCandidatesRequest(
        slotId,
        controller.signal,
      );

      // Ignore stale responses.
      if (candidateRequestRef.current === controller) {
        setAssignmentCandidates(candidates);
      }
    } catch (error) {
      if (!isAbortError(error) && candidateRequestRef.current === controller) {
        setCandidateLoadError(
          error instanceof Error
            ? error.message
            : "Could not load assignment candidates.",
        );
      }
    } finally {
      if (candidateRequestRef.current === controller) {
        candidateRequestRef.current = null;
        setIsLoadingCandidates(false);
      }
    }
  }

  async function handleAssignConfirm(employeeId: UUID) {
    if (selectedSlotId === null) {
      setAssignmentValidationErrors([
        {
          code: "NO_SLOT_SELECTED",
          message: "No slot selected.",
        },
      ]);

      return;
    }

    if (!canEdit || mutationRunning) {
      return;
    }

    // Lock all mutation controls.
    setActiveMutation("ASSIGN");
    setSavingEmployeeId(employeeId);

    clearAssignmentMessages();

    try {
      const result = await assignEmployeeRequest(selectedSlotId, employeeId);

      if (!result.ok) {
        setAssignmentValidationErrors(result.errors);

        return;
      }

      // Clear results derived from old assignments.
      invalidateScheduleValidation();
      setAutofillResult(null);

      resetAssignModal();
      router.refresh();
    } catch (error) {
      setAssignSystemError(
        error instanceof Error ? error.message : "Unexpected assignment error.",
      );
    } finally {
      setSavingEmployeeId(null);
      setActiveMutation(null);
    }
  }

  async function handleScheduleAction(action: ScheduleAction) {
    if (mutationRunning) {
      return;
    }

    setActiveMutation(action);
    clearScheduleMessages();

    if (action === "VALIDATE") {
      // Clear the previous validation result.
      setValidationResult(null);
    }

    try {
      const result = await scheduleActionRequest(schedulePeriod.id, action);

      if (!result.ok) {
        if ("errors" in result) {
          setScheduleValidationErrors(result.errors);
        } else if (action === "PUBLISH") {
          setSchedulePublishError(result.error);
        } else {
          setScheduleSystemError(result.error);
        }

        return;
      }

      if (result.action === "VALIDATE") {
        setValidationResult(SUCCESSFUL_VALIDATION);
      }

      // Reload status and server data.
      router.refresh();
    } catch (error) {
      setScheduleSystemError(
        error instanceof Error ? error.message : "Schedule action failed.",
      );
    } finally {
      setActiveMutation(null);
    }
  }

  async function handleAutofill() {
    if (!canEdit || mutationRunning) {
      return;
    }

    setActiveMutation("AUTOFILL");
    setAutofillResult(null);

    // Autofill invalidates previous validation.
    invalidateScheduleValidation();

    try {
      const result = await autofillScheduleRequest(
        schedulePeriod.id,
        "BALANCE_WORKLOAD",
      );

      setAutofillResult(result);
      router.refresh();
    } catch (error) {
      setScheduleSystemError(
        error instanceof Error ? error.message : "Autofill failed.",
      );
    } finally {
      setActiveMutation(null);
    }
  }

  function handleOpenReturnToDraftModal() {
    if (schedulePeriod.status === "DRAFT" || mutationRunning) {
      return;
    }

    setReturnToDraftError(null);
    setIsReturnToDraftModalOpen(true);
  }

  function handleCloseReturnToDraftModal() {
    if (isReturningToDraft) {
      return;
    }

    setReturnToDraftError(null);
    setIsReturnToDraftModalOpen(false);
  }

  async function handleReturnToDraft() {
    if (schedulePeriod.status === "DRAFT" || mutationRunning) {
      return;
    }

    setActiveMutation("RETURN_TO_DRAFT");
    setReturnToDraftError(null);

    try {
      await returnScheduleToDraftRequest(schedulePeriod.id);

      setValidationResult(null);
      setAutofillResult(null);
      clearScheduleMessages();
      setIsReturnToDraftModalOpen(false);

      router.refresh();
    } catch (error) {
      setReturnToDraftError(
        error instanceof Error
          ? error.message
          : "Could not return schedule to draft.",
      );
    } finally {
      setActiveMutation(null);
    }
  }

  return (
    <section>
      <ScheduleHeader schedulePeriod={schedulePeriod} />

      <div ref={controlsRef} className="sticky top-0 z-40 bg-surface py-3">
        <div className="space-y-3 rounded-overlay border border-border bg-background p-3 shadow-card">
          <ScheduleStatistics shiftSlots={shiftSlots} />

          <ScheduleControls
            activeView={activeView}
            filters={filters}
            onViewChange={setActiveView}
            onFiltersChange={setFilters}
          />

          {canEdit ? (
            <div className="flex items-center gap-4">
              <button
                type="button"
                className={ui.buttonPrimary}
                disabled={mutationRunning}
                onClick={handleAutofill}
              >
                {isAutofilling ? "Autofilling…" : "Autofill open slots"}
              </button>

              {autofillResult && (
                <p className={ui.bodyMuted}>
                  <span className="text-success">
                    {autofillResult.assignedCount} assigned
                  </span>

                  <span className="mx-2 text-foreground-subtle">•</span>

                  <span
                    className={
                      autofillResult.unfilledSlotIds.length > 0
                        ? "text-warning"
                        : "text-foreground-muted"
                    }
                  >
                    {autofillResult.unfilledSlotIds.length} unfilled
                  </span>
                </p>
              )}
            </div>
          ) : schedulePeriod.status !== "DRAFT" ? (
            <div className="flex items-center gap-4">
              <button
                type="button"
                className={ui.buttonPrimary}
                disabled={mutationRunning}
                onClick={handleOpenReturnToDraftModal}
              >
                {isReturningToDraft ? "Returning…" : "Return to Draft"}
              </button>
            </div>
          ) : null}

          <ErrorMessage
            message={scheduleSystemError}
            onClose={clearScheduleMessages}
          />
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_280px] items-start gap-4">
        <div className="min-w-0 overflow-hidden rounded-overlay border border-border bg-surface">
          {activeView === "TIMELINE" && (
            <Timeline
              shiftSlots={filteredShiftSlots}
              employees={employees}
              canAssign={canEdit}
              assignmentDisabled={mutationRunning}
              onAssignClick={handleOpenAssignModal}
            />
          )}

          {activeView === "WEEK_GRID" && (
            <WeekGrid
              shiftSlots={filteredShiftSlots}
              employees={employees}
              canAssign={canEdit}
              assignmentDisabled={mutationRunning}
              onAssignClick={handleOpenAssignModal}
            />
          )}

          {activeView === "EMPLOYEES" && (
            <EmployeeView
              shiftSlots={filteredShiftSlots}
              employees={employees}
              canAssign={canEdit}
              assignmentDisabled={mutationRunning}
              onAssignClick={handleOpenAssignModal}
            />
          )}
        </div>

        <aside className="sticky self-start" style={{ top: controlsHeight }}>
          <PublishChecklist
            status={schedulePeriod.status}
            assignedCount={assignedCount}
            totalSlots={shiftSlots.length}
            validationResult={validationResult}
            validationErrors={scheduleValidationErrors}
            publishError={schedulePublishError}
            closeValidationErrors={() => setScheduleValidationErrors([])}
            closePublishError={() => setSchedulePublishError(null)}
            isValidating={isValidating}
            isPublishing={isPublishing}
            mutationRunning={mutationRunning}
            onValidate={() => handleScheduleAction("VALIDATE")}
            onPublish={() => handleScheduleAction("PUBLISH")}
          />
        </aside>
      </div>

      {isAssignModalOpen && selectedSlot && (
        <AssignModal
          selectedSlot={selectedSlot}
          candidates={assignmentCandidates}
          isLoadingCandidates={isLoadingCandidates}
          candidateLoadError={candidateLoadError}
          onConfirm={handleAssignConfirm}
          onClose={handleCloseAssignModal}
          savingEmployeeId={savingEmployeeId}
          validationErrors={assignmentValidationErrors}
          closeValidationErrors={() => setAssignmentValidationErrors([])}
          systemError={assignSystemError}
          closeSystemError={() => setAssignSystemError(null)}
        />
      )}

      {isReturnToDraftModalOpen && schedulePeriod.status !== "DRAFT" && (
        <ReturnToDraftModal
          status={schedulePeriod.status}
          isSubmitting={isReturningToDraft}
          error={returnToDraftError}
          onConfirm={handleReturnToDraft}
          onClose={handleCloseReturnToDraftModal}
          onClearError={() => setReturnToDraftError(null)}
        />
      )}
    </section>
  );
}
