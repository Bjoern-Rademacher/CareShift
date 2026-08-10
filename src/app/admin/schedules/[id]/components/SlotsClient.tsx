"use client";

// React / Next
import { useState } from "react";
import { useRouter } from "next/navigation";

// UI
import * as ui from "@/ui/classes";
import AssignModal from "@/app/admin/schedules/[id]/components/AssignModal";
import { SystemErrors } from "@/app/admin/schedules/[id]/components/ErrorComponents";
import PublishChecklist from "@/app/admin/schedules/[id]/components/PublishChecklist";
import ScheduleControls from "@/app/admin/schedules/[id]/components/ScheduleControls";
import ScheduleHeader from "@/app/admin/schedules/[id]/components/ScheduleHeader";
import ScheduleStatistics from "@/app/admin/schedules/[id]/components/ScheduleStatistics";

import EmployeeView from "@/app/admin/schedules/[id]/components/scheduleViews/Employee";
import Timeline from "@/app/admin/schedules/[id]/components/scheduleViews/Timeline";
import WeekGrid from "@/app/admin/schedules/[id]/components/scheduleViews/WeekGrid";

// Client requests
import {
  assignEmployeeRequest,
  autofillScheduleRequest,
  getAssignmentCandidatesRequest,
  scheduleActionRequest,
} from "@/app/admin/schedules/[id]/helpers/scheduleRequests";

// Helpers / constants
import { filterSchedule } from "@/app/admin/schedules/[id]/helpers/filterSchedule";
import { SHIFT_GROUPS, WEEKDAYS } from "@/lib/constants/schedule";

// Types
import type { EmployeeAssignmentCandidate } from "@/types/assignment";
import type { AutofillResult } from "@/types/autofill";
import type { UUID } from "@/types/common";
import type { AssignableEmployee } from "@/types/employee";
import type {
  AssignmentValidationError,
  SchedulePeriod,
  ScheduleValidationError,
  ShiftSlot,
} from "@/types/scheduling";
import type { ScheduleFilters, ScheduleView } from "@/types/view";

type Props = {
  schedulePeriod: SchedulePeriod;
  shiftSlots: ShiftSlot[];
  employees: AssignableEmployee[];
  canAssign: boolean;
};

type ScheduleAction = "VALIDATE" | "PUBLISH";

type ScheduleValidationResult = {
  noOverlaps: boolean;
  sufficientRest: boolean;
  weeklyHoursValid: boolean;
  rollingSevenDayHoursValid: boolean;
};

export default function SlotsClient({
  schedulePeriod,
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
    ScheduleValidationError[]
  >([]);

  const [scheduleSystemError, setScheduleSystemError] = useState<string | null>(
    null,
  );

  const [validationResult, setValidationResult] =
    useState<ScheduleValidationResult | null>(null);

  const [isValidating, setIsValidating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Autofill
  const [isAutofilling, setIsAutofilling] = useState(false);

  const [autofillResult, setAutofillResult] = useState<AutofillResult | null>(
    null,
  );

  // Schedule view / filtering
  const [activeView, setActiveView] = useState<ScheduleView>("TIMELINE");

  const [filters, setFilters] = useState<ScheduleFilters>({
    weekdays: [...WEEKDAYS],
    shiftGroups: [...SHIFT_GROUPS],
    assignment: "ALL",
  });

  const filteredShiftSlots = filterSchedule(shiftSlots, filters);

  // Derived from the original schedule, independent of active UI filters.
  const selectedSlot = shiftSlots.find((slot) => slot.id === selectedSlotId);

  const assignedCount = shiftSlots.filter(
    (slot) => slot.employeeId !== null,
  ).length;

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

      /*
       * The schedule changed, so any previous publish validation
       * is no longer authoritative.
       */
      setValidationResult(null);
      setScheduleValidationErrors([]);
      setScheduleSystemError(null);

      /*
       * The previous autofill result no longer describes
       * the current schedule after a manual assignment.
       */
      setAutofillResult(null);

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

    if (action === "VALIDATE") {
      setIsValidating(true);
      setValidationResult(null);
    } else {
      setIsPublishing(true);
    }

    try {
      const result = await scheduleActionRequest(schedulePeriod.id, action);

      if (!result.ok) {
        setScheduleValidationErrors(result.errors);
        return;
      }

      if (result.action === "VALIDATE") {
        /*
         * V1:
         * A successful backend validation means all currently
         * validated scheduling rules passed.
         *
         * Later the API should return these values explicitly.
         */
        setValidationResult({
          noOverlaps: true,
          sufficientRest: true,
          weeklyHoursValid: true,
          rollingSevenDayHoursValid: true,
        });

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

  async function handleAutofill() {
    if (!canAssign) return;

    setIsAutofilling(true);
    setAutofillResult(null);
    setScheduleSystemError(null);

    try {
      const result = await autofillScheduleRequest(
        schedulePeriod.id,
        "BALANCE_WORKLOAD",
      );

      /*
       * Schedule changed. Previous publish validation
       * can no longer be trusted.
       */
      setValidationResult(null);
      setScheduleValidationErrors([]);

      /*
       * This result is only feedback about the autofill operation.
       * The refreshed shiftSlots remain the schedule source of truth.
       */
      setAutofillResult(result);

      router.refresh();
    } catch (error) {
      setScheduleSystemError(
        error instanceof Error ? error.message : "Autofill failed.",
      );
    } finally {
      setIsAutofilling(false);
    }
  }

  function handleCloseScheduleMessages() {
    setScheduleValidationErrors([]);
    setScheduleSystemError(null);
  }

  return (
    <section>
      <ScheduleHeader schedulePeriod={schedulePeriod} />

      {/* Sticky schedule workspace controls */}
      <div className="sticky top-0 z-40 bg-slate-950 py-3">
        <div className="space-y-3">
          <ScheduleStatistics shiftSlots={shiftSlots} />

          <ScheduleControls
            activeView={activeView}
            filters={filters}
            onViewChange={setActiveView}
            onFiltersChange={setFilters}
          />

          {canAssign && (
            <div className="flex items-center gap-4">
              <button
                type="button"
                className={ui.buttonPrimary}
                disabled={isAutofilling}
                onClick={handleAutofill}
              >
                {isAutofilling ? "Autofilling..." : "Autofill open slots"}
              </button>

              {autofillResult && (
                <p className="text-sm text-slate-400">
                  <span className="text-emerald-300">
                    {autofillResult.assignedCount} assigned
                  </span>

                  <span className="mx-2 text-slate-600">•</span>

                  <span
                    className={
                      autofillResult.unfilledSlotIds.length > 0
                        ? "text-amber-300"
                        : "text-slate-400"
                    }
                  >
                    {autofillResult.unfilledSlotIds.length} unfilled
                  </span>
                </p>
              )}
            </div>
          )}

          <SystemErrors
            message={scheduleSystemError}
            onClose={handleCloseScheduleMessages}
          />
        </div>
      </div>

      {/* Main scheduling workspace */}
      <div className="grid grid-cols-[minmax(0,1fr)_280px] items-start gap-4">
        <main className="min-w-0">
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
        </main>

        {canAssign && (
          <aside className="sticky top-[148px] self-start">
            <PublishChecklist
              assignedCount={assignedCount}
              totalSlots={shiftSlots.length}
              validationResult={validationResult}
              isValidating={isValidating}
              isPublishing={isPublishing}
              onValidate={() => handleScheduleAction("VALIDATE")}
              onPublish={() => handleScheduleAction("PUBLISH")}
            />
          </aside>
        )}
      </div>

      {isAssignModalOpen && selectedSlot && (
        <AssignModal
          selectedSlot={selectedSlot}
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
