"use client";

import { useEffect, useRef, useState } from "react";

import * as ui from "@/ui/classes";

import AssignModal from "@/app/(app)/admin/schedules/[id]/components/AssignModal";
import ClearAssignmentsModal from "@/app/(app)/admin/schedules/[id]/components/ClearAssignmentsModal";
import PublishChecklist from "@/app/(app)/admin/schedules/[id]/components/PublishChecklist";
import ReturnToDraftModal from "@/app/(app)/admin/schedules/[id]/components/ReturnToDraftModal";
import ScheduleControls from "@/app/(app)/admin/schedules/[id]/components/ScheduleControls";
import ScheduleHeader from "@/app/(app)/admin/schedules/[id]/components/ScheduleHeader";
import ScheduleStatistics from "@/app/(app)/admin/schedules/[id]/components/ScheduleStatistics";

import { useBulkAssignments } from "@/app/(app)/admin/schedules/[id]/components/hooks/useBulkAssignments";
import { useScheduleLifecycle } from "@/app/(app)/admin/schedules/[id]/components/hooks/useScheduleLifecycle";
import { useScheduleMutations } from "@/app/(app)/admin/schedules/[id]/components/hooks/useScheduleMutations";
import { useSlotAssignment } from "@/app/(app)/admin/schedules/[id]/components/hooks/useSlotAssignment";

import EmployeeView from "@/app/(app)/admin/schedules/[id]/components/scheduleViews/Employee";
import Timeline from "@/app/(app)/admin/schedules/[id]/components/scheduleViews/Timeline";
import WeekGrid from "@/app/(app)/admin/schedules/[id]/components/scheduleViews/WeekGrid";

import { filterSchedule } from "@/app/(app)/admin/schedules/[id]/helpers/filterSchedule";

import { ErrorMessage } from "@/lib/components/ErrorComponents";
import { SHIFT_GROUPS, WEEKDAYS } from "@/lib/constants/schedule";

import type { AssignableEmployee } from "@/types/employee";
import type { SchedulePeriod, ShiftSlot } from "@/types/scheduling";
import type { ScheduleFilters, ScheduleView } from "@/types/view";

type Props = {
  schedulePeriod: SchedulePeriod;
  shiftSlots: ShiftSlot[];
  employees: AssignableEmployee[];
  canEdit: boolean;
};

export default function SlotsClient({
  schedulePeriod,
  shiftSlots,
  employees,
  canEdit,
}: Props) {
  const controlsRef = useRef<HTMLDivElement>(null);

  const [controlsHeight, setControlsHeight] = useState(0);

  const [activeView, setActiveView] = useState<ScheduleView>("TIMELINE");

  const [filters, setFilters] = useState<ScheduleFilters>({
    weekdays: [...WEEKDAYS],
    shiftGroups: [...SHIFT_GROUPS],
    assignment: "ALL",
  });

  const filteredShiftSlots = filterSchedule(shiftSlots, filters);

  const assignedCount = shiftSlots.filter(
    (slot) => slot.employeeId !== null,
  ).length;

  const mutations = useScheduleMutations();

  const lifecycle = useScheduleLifecycle({
    schedulePeriod,
    mutations,
  });

  const bulkAssignments = useBulkAssignments({
    periodId: schedulePeriod.id,
    canEdit,
    assignedCount,
    mutations,
    onAssignmentsChanged: lifecycle.invalidateValidation,
  });

  const slotAssignment = useSlotAssignment({
    shiftSlots,
    canEdit,
    mutations,
    onAssignmentChanged: () => {
      lifecycle.invalidateValidation();
      bulkAssignments.clearAutofillResult();
    },
  });

  // Keep the sticky checklist offset aligned with the controls.
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

    return () => {
      observer.disconnect();
    };
  }, []);

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
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                className={ui.buttonPrimary}
                disabled={mutations.mutationRunning}
                onClick={bulkAssignments.handleAutofill}
              >
                {bulkAssignments.isAutofilling
                  ? "Autofilling…"
                  : mutations.isRefreshing
                    ? "Updating…"
                    : "Autofill open slots"}
              </button>

              <button
                type="button"
                className={ui.button}
                disabled={mutations.mutationRunning || assignedCount === 0}
                onClick={bulkAssignments.handleOpenClearAssignmentsModal}
              >
                {bulkAssignments.isClearingAssignments
                  ? "Clearing…"
                  : "Clear assignments"}
              </button>

              {bulkAssignments.autofillResult && (
                <p className={ui.bodyMuted}>
                  <span className="text-success">
                    {bulkAssignments.autofillResult.assignedCount} assigned
                  </span>

                  <span className="mx-2 text-foreground-subtle">•</span>

                  <span
                    className={
                      bulkAssignments.autofillResult.unfilledSlotIds.length > 0
                        ? "text-warning"
                        : "text-foreground-muted"
                    }
                  >
                    {bulkAssignments.autofillResult.unfilledSlotIds.length}{" "}
                    unfilled
                  </span>
                </p>
              )}
            </div>
          ) : schedulePeriod.status !== "DRAFT" ? (
            <div className="flex items-center gap-4">
              <button
                type="button"
                className={ui.buttonPrimary}
                disabled={mutations.mutationRunning}
                onClick={lifecycle.handleOpenReturnToDraftModal}
              >
                {lifecycle.isReturningToDraft
                  ? "Returning…"
                  : mutations.isRefreshing
                    ? "Updating…"
                    : "Return to Draft"}
              </button>
            </div>
          ) : null}

          <ErrorMessage
            message={bulkAssignments.systemError}
            onClose={bulkAssignments.clearSystemError}
          />

          <ErrorMessage
            message={lifecycle.systemError}
            onClose={lifecycle.clearSystemError}
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
              assignmentDisabled={mutations.mutationRunning}
              onAssignClick={slotAssignment.handleOpenModal}
            />
          )}

          {activeView === "WEEK_GRID" && (
            <WeekGrid
              shiftSlots={filteredShiftSlots}
              employees={employees}
              canAssign={canEdit}
              assignmentDisabled={mutations.mutationRunning}
              onAssignClick={slotAssignment.handleOpenModal}
            />
          )}

          {activeView === "EMPLOYEES" && (
            <EmployeeView
              shiftSlots={filteredShiftSlots}
              employees={employees}
              canAssign={canEdit}
              assignmentDisabled={mutations.mutationRunning}
              onAssignClick={slotAssignment.handleOpenModal}
            />
          )}
        </div>

        <aside className="sticky self-start" style={{ top: controlsHeight }}>
          <PublishChecklist
            status={schedulePeriod.status}
            assignedCount={assignedCount}
            totalSlots={shiftSlots.length}
            validationResult={lifecycle.validationResult}
            validationErrors={lifecycle.validationIssues}
            publishError={lifecycle.publishError}
            closeValidationErrors={lifecycle.clearValidationIssues}
            closePublishError={lifecycle.clearPublishError}
            isValidating={lifecycle.isValidating}
            isPublishing={lifecycle.isPublishing}
            mutationRunning={mutations.mutationRunning}
            onValidate={lifecycle.handleValidate}
            onPublish={lifecycle.handlePublish}
          />
        </aside>
      </div>

      {slotAssignment.isAssignModalOpen && slotAssignment.selectedSlot && (
        <AssignModal
          selectedSlot={slotAssignment.selectedSlot}
          candidates={slotAssignment.candidates}
          isLoadingCandidates={slotAssignment.isLoadingCandidates}
          candidateLoadError={slotAssignment.candidateLoadError}
          savingEmployeeId={slotAssignment.savingEmployeeId}
          validationErrors={slotAssignment.assignmentIssues}
          systemError={slotAssignment.systemError}
          onConfirm={slotAssignment.handleConfirm}
          onClose={slotAssignment.handleCloseModal}
          closeValidationErrors={slotAssignment.clearAssignmentIssues}
          closeSystemError={slotAssignment.clearSystemError}
        />
      )}

      {bulkAssignments.isClearAssignmentsModalOpen && (
        <ClearAssignmentsModal
          assignedCount={assignedCount}
          isSubmitting={bulkAssignments.isClearingAssignments}
          error={bulkAssignments.clearAssignmentsError}
          onConfirm={bulkAssignments.handleClearAssignments}
          onClose={bulkAssignments.handleCloseClearAssignmentsModal}
          onClearError={bulkAssignments.clearClearAssignmentsError}
        />
      )}

      {lifecycle.isReturnToDraftModalOpen &&
        schedulePeriod.status !== "DRAFT" && (
          <ReturnToDraftModal
            status={schedulePeriod.status}
            isSubmitting={lifecycle.isReturningToDraft}
            error={lifecycle.returnToDraftError}
            onConfirm={lifecycle.handleReturnToDraft}
            onClose={lifecycle.handleCloseReturnToDraftModal}
            onClearError={lifecycle.clearReturnToDraftError}
          />
        )}
    </section>
  );
}
